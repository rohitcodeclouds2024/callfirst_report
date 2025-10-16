// src/server.js
import 'dotenv/config';
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import multipart from "@fastify/multipart";
import fastifyJwt from '@fastify/jwt';
import fastifyFormbody from '@fastify/formbody';
import { fileURLToPath } from 'url';
import { Server as IOServer } from 'socket.io';

import registerAuthRoutes from './routes/auth.js';
import registerUsersRoutes from './routes/users.js';
import registerRolesRoutes from './routes/roles.js';
import registerTokenRoutes from './routes/twilio.js';
import registerVoiceRoutes from './routes/voice.js';
import registerVoiceStatusRoutes from "./routes/voice-status.js";
import trackerRoutes from "./routes/tracker.js";
import uploadRoutes from "./routes/upload.js";
import User from './models/user.js'; // Sequelize model
import { twilioRestClient, TWILIO_FROM_NUMBER } from './lib/twilio.js';

const fastify = Fastify({ logger: true });
const PORT = process.env.PORT || 5010;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

async function build() {
	// --- JWT plugin ---
	await fastify.register(fastifyJwt, { secret: JWT_SECRET });

	// decorate authenticate helper (must be done after fastify-jwt)
	fastify.decorate('authenticate', async function (request, reply) {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.code(401).send({ error: 'unauthorized', message: err.message || 'invalid token' });
		}
	});

	fastify.decorate("activeCalls", new Map());

	// CORS
	await fastify.register(fastifyCors, {
  		origin: (origin, cb) => {
    	if (!origin) return cb(null, true); // allow server-to-server / curl etc.
    	const allowed = ['http://localhost:3000', 'http://127.0.0.1:3000','https://29be0d7f685a.ngrok-free.app'];
    	if (allowed.includes(origin)) return cb(null, true);
    		return cb(new Error('Not allowed by CORS'), false);
  		},
  		credentials: true,
  		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
  		allowedHeaders: ["Content-Type", "Authorization"],
	});

	await fastify.register(multipart, {
  		limits: { fileSize: 10 * 1024 * 1024 } // optional: 10MB max file size
	});

	await fastify.register(fastifyFormbody);

	// Routes
	await registerAuthRoutes(fastify);
	await registerUsersRoutes(fastify);
	await registerRolesRoutes(fastify);
	await registerTokenRoutes(fastify);
	await registerVoiceRoutes(fastify);
	await registerVoiceStatusRoutes(fastify);
	await trackerRoutes(fastify);
	await uploadRoutes(fastify);

	fastify.get('/_ping', async () => ({ pong: true, ts: Date.now() }));
	fastify.get('/health', async () => ({ status: 'ok' }));

	return fastify;
}

/**
 * Start server and wire Socket.IO when run directly
 */
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
	build()
		.then(async (app) => {
			await app.ready();

			// In-memory active calls map (replace with Redis/DB in prod)
			const activeCalls = new Map();

			const io = new IOServer(app.server, {
				cors: {
					origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
					credentials: true,
				},
			});

			// Socket auth
			io.use((socket, next) => {
				const token = socket.handshake.auth?.token;
				if (!token) {
					app.log.warn('Socket rejected: no token');
					return next(new Error('Auth required'));
				}
				try {
					const payload = app.jwt.verify(token);
					socket.user = payload;
					return next();
				} catch (err) {
					app.log.warn('Socket JWT verify error:', err.message);
					return next(new Error('Invalid token'));
				}
			});

			const findActiveCallForAgent = (agentId) => {
				for (const [callId, rec] of activeCalls.entries()) {
					if (Number(rec.agentId) === Number(agentId)) return { callId, rec };
				}
				return null;
			};

			io.on('connection', (socket) => {
				const user = socket.user;
				app.log.info(`socket connected ${socket.id} user=${user?.id}`);

				if (!user?.id) {
					app.log.error('Missing user.id in JWT payload');
					socket.disconnect(true);
					return;
				}

				// persist socket (best-effort if you have a DB model)
				if (User) {
					User.update(
						{ socket_id: socket.id, availability: 'online', last_active_at: new Date() },
						{ where: { id: user.id } }
					).catch((e) => {
						app.log.warn('Failed to update user socket_id', e);
					});
				}

				io.emit('presence:update', { userId: user.id, status: 'online' });

				// ------------------------------
				// presence:list
				// ------------------------------
				socket.on('presence:list', async (payload, cb) => {
					try {
						const q = (payload && payload.q) ? String(payload.q).trim() : '';
						const where = { availability: 'online' };
						const users = await User.findAll({
							where,
							attributes: ['id', 'name', 'email', 'slug', 'socket_id', 'availability', 'contact_number'],
							limit: 200,
							order: [['id', 'ASC']],
						});
						const mapped = (users || []).map(u => ({
							id: u.id,
							name: u.name,
							email: u.email,
							slug: u.slug,
							socket_id: u.socket_id,
							availability: u.availability,
							contact_number: u.contact_number,
						}));
						if (typeof cb === 'function') return cb(mapped);
						return socket.emit('presence:list', mapped);
					} catch (err) {
						app.log.error('presence:list error', err);
						if (typeof cb === 'function') return cb([]);
						return socket.emit('presence:list', []);
					}
				});

				// ------------------------------
				// call:initiate
				// ------------------------------
				socket.on('call:initiate', async (payload, cb) => {
					try {
						const { to, targetUserId } = payload || {};
						if (!to) {
							const err = { ok: false, error: 'missing_target' };
							if (cb) return cb(err);
							return socket.emit('call:status', { status: 'failed', error: 'missing_target' });
						}

						if (!twilioRestClient || !TWILIO_FROM_NUMBER) {
							const err = { ok: false, error: 'twilio_not_configured' };
							if (cb) return cb(err);
							return socket.emit('call:status', { status: 'failed', error: 'twilio_not_configured' });
						}

						const confName = `conf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
						const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || PORT}`;
						const customerUrl = `${base}/voice/join?name=${encodeURIComponent(confName)}&startOnEnter=false`;

						const twCall = await twilioRestClient.calls.create({
							to,
							from: TWILIO_FROM_NUMBER,
							url: customerUrl,
							method: 'POST',
						});

						const callId = twCall.sid;
						const rec = {
							callSid: twCall.sid,
							conferenceName: confName,
							agentId: user.id,
							agentSocketId: socket.id,
							targetNumber: to,
							status: 'initiating',
							createdAt: new Date(),
							startedAt: null,
						};

						activeCalls.set(callId, rec);

						if (User) {
							User.update({ availability: 'in-call', last_active_at: new Date() }, { where: { id: user.id } }).catch(() => { });
						}

						socket.emit('call:status', { callId, callSid: twCall.sid, status: 'initiating', conference: confName });

						if (targetUserId) {
							try {
								const target = await User.findByPk(Number(targetUserId));
								if (target && target.socket_id) {
									io.to(target.socket_id).emit('incoming-invite', {
										from: { id: user.id, name: user.name, slug: user.slug },
										callId,
										callSid: twCall.sid,
										conference: confName,
										number: to,
									});
								}
							} catch (e) {
								app.log.warn('Failed to notify target agent', e);
							}
						}

						if (cb) cb({ ok: true, callId, callSid: twCall.sid, conference: confName });
					} catch (err) {
						app.log.error('call:initiate error', err);
						if (cb) return cb({ ok: false, error: 'initiate_failed' });
						socket.emit('call:status', { status: 'failed', error: 'initiate_failed' });
					}
				});

				// ------------------------------
				// call:transfer
				// ------------------------------
				socket.on('call:transfer', async (payload, cb) => {
					try {
						const { callId, target, mode } = payload || {};
						if (!callId || !target) {
							if (cb) return cb({ ok: false, error: 'missing' });
							return socket.emit('call:status', { status: 'failed', error: 'missing' });
						}

						let rec = activeCalls.get(callId);
						if (!rec) {
							for (const [k, v] of activeCalls.entries()) {
								if (v.callSid === callId) { rec = v; break; }
							}
						}
						if (!rec) {
							if (cb) return cb({ ok: false, error: 'call_not_found' });
							return socket.emit('call:status', { status: 'failed', error: 'call_not_found' });
						}

						if (!twilioRestClient || !TWILIO_FROM_NUMBER) {
							if (cb) return cb({ ok: false, error: 'twilio_not_configured' });
							return socket.emit('call:status', { status: 'failed', error: 'twilio_not_configured' });
						}

						const confName = rec.conferenceName || `conf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
						const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || PORT}`;

						if (!rec.conferenceName && rec.callSid) {
							const customerUrl = `${base}/voice/join?name=${encodeURIComponent(confName)}&startOnEnter=false`;
							try {
								await twilioRestClient.calls(rec.callSid).update({ url: customerUrl, method: 'POST' });
							} catch (err) {
								app.log.warn('Failed to update customer call to join conference', err);
							}
						}

						if (typeof target === 'string' && target.startsWith('agent:')) {
							const slug = target.replace(/^agent:/, '');
							const targetUser = await User.findOne({ where: { slug } });
							if (!targetUser) {
								if (cb) return cb({ ok: false, error: 'agent_not_found' });
								return socket.emit('call:status', { status: 'failed', error: 'agent_not_found' });
							}

							const agentIdentity = targetUser.twilio_identity || `agent:${targetUser.slug || targetUser.id}`;
							const agentUrl = `${base}/voice/join?name=${encodeURIComponent(confName)}&startOnEnter=true`;

							const agentCall = await twilioRestClient.calls.create({
								url: agentUrl,
								to: `client:${agentIdentity.replace(/^client:/, '')}`,
								from: TWILIO_FROM_NUMBER,
							});

							activeCalls.set(agentCall.sid, {
								callSid: agentCall.sid,
								conferenceName: confName,
								agentId: targetUser.id,
								agentSocketId: targetUser.socket_id || null,
								role: 'transfer_target',
								createdAt: new Date(),
							});

							rec.conferenceName = confName;
							activeCalls.set(rec.callSid, rec);

							if (cb) cb({ ok: true, mode: 'consult', agentCallSid: agentCall.sid, conference: confName });
							socket.emit('call:status', { callId: rec.callSid, status: 'transfer_consult', conference: confName });

							if (targetUser.socket_id) {
								io.to(targetUser.socket_id).emit('incoming-invite', {
									from: { id: socket.user.id, name: socket.user.name, slug: socket.user.slug },
									callSid: agentCall.sid,
									conference: confName,
									number: rec.targetNumber || rec.number || null,
								});
							}
							return;
						}

						const agentUrl = `${base}/voice/join?name=${encodeURIComponent(confName)}&startOnEnter=true`;
						const outCall = await twilioRestClient.calls.create({
							url: agentUrl,
							to: target,
							from: TWILIO_FROM_NUMBER,
						});

						activeCalls.set(outCall.sid, {
							callSid: outCall.sid,
							conferenceName: confName,
							role: 'transfer_target',
							createdAt: new Date(),
						});

						rec.conferenceName = confName;
						activeCalls.set(rec.callSid, rec);

						if (cb) return cb({ ok: true, conference: confName, callSid: outCall.sid });
						return;
					} catch (err) {
						app.log.error('call:transfer error', err);
						if (cb) cb({ ok: false, error: 'transfer_failed' });
						socket.emit('call:status', { status: 'failed', error: 'transfer_failed' });
					}
				});

				// ------------------------------
				// call:end
				// ------------------------------
				socket.on('call:end', async (payload) => {
					try {
						const { callId, callSid } = payload || {};
						const id = callId || callSid;
						if (!id) return socket.emit('call:status', { status: 'failed', error: 'missing_callId' });

						let rec = activeCalls.get(id);
						if (!rec) {
							for (const [k, v] of activeCalls.entries()) {
								if (v.callSid === id) { rec = v; break; }
							}
						}

						if (rec && rec.callSid && twilioRestClient) {
							try {
								await twilioRestClient.calls(rec.callSid).update({ status: 'completed' });
							} catch (e) {
								app.log.warn('twilio update on end failed', e);
							}
						}

						if (rec) {
							activeCalls.delete(rec.callSid || id);
							if (User) {
								User.update({ availability: 'online' }, { where: { id: rec.agentId } }).catch(() => { });
							}
						}

						socket.emit('call:status', { callId: id, status: 'ended' });
						io.emit('call:status', { callId: id, status: 'ended' });
					} catch (err) {
						app.log.error('call:end error', err);
						socket.emit('call:status', { status: 'failed', error: 'end_failed' });
					}
				});

				// ------------------------------
				// disconnect cleanup
				// ------------------------------
				socket.on('disconnect', async (reason) => {
					app.log.info(`socket disconnect ${socket.id} reason=${reason}`);

					if (User) {
						User.update(
							{ socket_id: null, availability: 'offline', last_active_at: new Date() },
							{ where: { id: user.id } }
						).catch(() => { });
					}

					for (const [callId, rec] of activeCalls.entries()) {
						if (rec.agentSocketId === socket.id) {
							rec.agentSocketId = null;
							rec.status = 'agent-disconnected';
							activeCalls.set(callId, rec);
							io.emit('call:status', { callId, status: 'agent-disconnected' });
						}
					}

					io.emit('presence:update', { userId: user.id, status: 'offline' });
				});
			});

			try {
				await app.listen({ port: Number(PORT), host: '0.0.0.0' });
				app.log.info(`Server listening on ${PORT}`);
			} catch (err) {
				app.log.error('Error while starting server:', err);
				process.exit(1);
			}
		})
		.catch((err) => {
			console.error('Server failed to start:', err);
			process.exit(1);
		});
}

export default build;

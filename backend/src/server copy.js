// src/server.js
import 'dotenv/config';
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import { fileURLToPath } from 'url';
import { Server as IOServer } from 'socket.io';
import jwt from 'jsonwebtoken'; // ✅ Added import
import { initDb } from './lib/db.js';
import registerAuthRoutes from './routes/auth.js';
import registerUsersRoutes from './routes/users.js';
import User from './models/user.js';
import registerTokenRoutes from "./routes/twilio.js";





const fastify = Fastify({ logger: true });

const PORT = process.env.PORT || 5010;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

async function build() {
	// --- JWT plugin ---
	await fastify.register(fastifyJwt, { secret: JWT_SECRET });

	fastify.decorate('authenticate', async function (request, reply) {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply
				.code(401)
				.send({ error: 'unauthorized', message: err.message || 'invalid token' });
		}
	});

	// --- CORS ---
	await fastify.register(fastifyCors, {
		origin: (origin, cb) => {
			if (!origin) return cb(null, true);
			const allowed = ['http://localhost:3000', 'http://127.0.0.1:3000'];
			if (allowed.includes(origin)) return cb(null, true);
			return cb(new Error('Not allowed'), false);
		},
		credentials: true,
	});

	// --- DB ---
	await initDb();

	// --- Routes ---
	await registerAuthRoutes(fastify);
	await registerUsersRoutes(fastify);
	await registerTokenRoutes(fastify);

	// --- Health & Ping ---
	fastify.get('/_ping', async () => ({ pong: true, ts: Date.now() }));
	fastify.get('/health', async () => ({ status: 'ok' }));

	return fastify;
}

export default build;

// --- Start Server ---
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
	build()
		.then(async (app) => {
			await app.ready();

			const io = new IOServer(app.server, {
				cors: {
					origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
					credentials: true,
				},
			});

			// Authenticate every socket connection
			io.use((socket, next) => {
				const token = socket.handshake.auth?.token;
				if (!token) {
					console.error("❌ Socket rejected: no token provided");
					return next(new Error("Auth required"));
				}

				try {
					// use Fastify's JWT verify instead of jsonwebtoken
					const payload = app.jwt.verify(token);
					console.log("🔑 Decoded JWT payload via fastify.jwt:", payload);
					socket.user = payload;
					return next();
				} catch (err) {
					console.error("❌ Socket JWT verify failed:", err.message);
					return next(new Error("Invalid token"));
				}
			});


			io.on("connection", async (socket) => {
				const user = socket.user;
				console.log("🔌 Socket connected:", socket.id, "user:", user);

				if (!user?.id) {
					console.error("❌ No user.id in JWT payload — cannot update DB");
					return;
				}

				// Update DB: set this user's socket_id + mark online
				try {
					const [count] = await User.update(
						{
							socket_id: socket.id,
							availability: "online",
							last_active_at: new Date(),
						},
						{ where: { id: user.id } }
					);
					console.log(`📝 DB update result for user ${user.id}: ${count} row(s) affected`);
				} catch (err) {
					console.error("🚨 Failed to update user socket_id:", err);
				}

				io.emit("presence:update", { userId: user.id, status: "online" });

				socket.on("disconnect", async () => {
					console.log("❌ Socket disconnected:", socket.id);
					try {
						const [count] = await User.update(
							{
								socket_id: null,
								availability: "offline",
								last_active_at: new Date(),
							},
							{ where: { id: user.id } }
						);
						console.log(`📝 DB clear result for user ${user.id}: ${count} row(s) affected`);
					} catch (err) {
						console.error("🚨 Failed to clear socket_id on disconnect:", err);
					}

					io.emit("presence:update", { userId: user.id, status: "offline" });
				});
			});

			// ✅ Start Fastify as usual
			try {
				await app.listen({ port: Number(PORT), host: '0.0.0.0' });
				app.log.info(`🚀 Server listening on ${PORT}`);
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

// src/routes/calls.js
import { twilioRestClient, TWILIO_FROM_NUMBER } from '../lib/twilio.js';
import User from '../models/user.js';

export default async function registerCallsRoutes(fastify) {
	// helper valid number function (very basic)
	const normalizeNumber = (num) => {
		if (!num) return null;
		// naive: if number starts with +, return as-is; else return as-is (you can sanitize)
		return String(num).trim();
	};

	// POST /calls/initiate  (fallback if socket unavailable)
	fastify.post('/calls/initiate', { preValidation: [fastify.authenticate] }, async (request, reply) => {
		try {
			const { to, targetUserId } = request.body || {};
			const agent = request.user;
			if (!to) return reply.code(400).send({ error: 'missing_target_number' });

			if (!twilioRestClient || !TWILIO_FROM_NUMBER) {
				request.log.error('Twilio client not configured');
				return reply.code(500).send({ error: 'twilio_not_configured' });
			}

			const confName = `conf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

			// Twilio will request our /voice/answer endpoint to obtain TwiML that joins the conference
			const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5010}`;
			const customerUrl = `${base}/voice/join?name=${encodeURIComponent(confName)}&startOnEnter=false`;

			console.log(customerUrl);

			const call = await twilioRestClient.calls.create({
				to: normalizeNumber(to),
				from: TWILIO_FROM_NUMBER,
				url: customerUrl,
				method: 'POST',
			});

			// update agent availability in DB
			try {
				await User.update({ availability: 'in-call', last_active_at: new Date() }, { where: { id: agent.id } });
			} catch (e) {
				request.log.warn('Failed to update user availability', e);
			}

			// store minimal record in-memory via global map handled in server.js (server will populate if running)
			// We return callSid to client as reference
			return reply.send({ ok: true, callSid: call.sid, conference: confName });
		} catch (err) {
			request.log.error('calls/initiate error', err);
			return reply.code(500).send({ error: 'initiate_failed' });
		}
	});

	// POST /calls/end  (fallback)
	fastify.post('/calls/end', { preValidation: [fastify.authenticate] }, async (request, reply) => {
		try {
			const { callSid } = request.body || {};
			if (!callSid) return reply.code(400).send({ error: 'missing_callSid' });

			if (!twilioRestClient) return reply.code(500).send({ error: 'twilio_not_configured' });

			try {
				await twilioRestClient.calls(callSid).update({ status: 'completed' });
			} catch (e) {
				// Twilio may error if call already ended - log and continue
				request.log.warn('twilio call update failed', e);
			}

			// mark user back online (best-effort)
			try {
				const agentId = request.user?.id;
				if (agentId) {
					await User.update({ availability: 'online' }, { where: { id: agentId } });
				}
			} catch (e) {
				request.log.warn('failed to set user online', e);
			}

			return reply.send({ ok: true });
		} catch (err) {
			request.log.error('calls/end error', err);
			return reply.code(500).send({ error: 'end_failed' });
		}
	});
}

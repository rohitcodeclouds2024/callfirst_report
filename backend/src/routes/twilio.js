// src/routes/twilio.js
import { generateTwilioAccessToken } from '../lib/twilio.js';
import User from '../models/user.js';

export default async function registerTwilioRoutes(fastify) {
	// GET /twilio/token
	fastify.get('/twilio/token', { preValidation: [fastify.authenticate] }, async (request, reply) => {
		try {
			const identityQuery = (request.query && request.query.identity) || null;
			const userPayload = request.user;
			if (!userPayload) return reply.code(401).send({ error: 'unauthorized' });

			const dbUser = User ? await User.findByPk(Number(userPayload.id)) : null;
			const storedIdentity = dbUser?.twilio_identity || null;

			const effectiveIdentity =
				(typeof identityQuery === 'string' && identityQuery.trim()) ||
				storedIdentity ||
				userPayload.slug ||
				userPayload.email ||
				`agent:${userPayload.id}`;

			const TTL = Number(process.env.TWILIO_TOKEN_TTL || 3600);
			const tokenInfo = generateTwilioAccessToken(effectiveIdentity, TTL);

			// persist identity/token times if you have columns
			try {
				if (dbUser) {
					dbUser.twilio_identity = effectiveIdentity;
					if (Object.prototype.hasOwnProperty.call(dbUser, 'twilio_token_issued_at')) {
						dbUser.twilio_token_issued_at = new Date(tokenInfo.issuedAt * 1000);
					}
					if (Object.prototype.hasOwnProperty.call(dbUser, 'twilio_token_expires_at')) {
						dbUser.twilio_token_expires_at = new Date(tokenInfo.expiresAt * 1000);
					}
					await dbUser.save();
				}
			} catch (saveErr) {
				request.log.warn('Failed to persist twilio token metadata:', saveErr);
			}

			return reply.send({
				ok: true,
				token: tokenInfo.jwt,
				identity: tokenInfo.identity,
				expiresIn: TTL,
				issuedAt: tokenInfo.issuedAt,
				expiresAt: tokenInfo.expiresAt,
			});
		} catch (err) {
			request.log.error('Token generation failed:', err);
			return reply.code(500).send({ error: 'token_generation_failed' });
		}
	});
}

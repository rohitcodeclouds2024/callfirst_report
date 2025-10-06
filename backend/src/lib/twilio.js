// src/lib/twilio.js
import Twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKeySid = process.env.TWILIO_API_KEY_SID || process.env.TWILIO_API_KEY;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET || process.env.TWILIO_API_SECRET;
const outgoingAppSid = process.env.TWILIO_TWIML_APP_SID || process.env.TWILIO_APP_SID || null;
const TWILIO_FROM_NUMBER = process.env.TWILIO_NUMBER || null;

if (!accountSid && (process.env.NODE_ENV === 'production')) {
	// warn only in prod
	console.warn('Twilio ACCOUNT SID not configured');
}

export function generateTwilioAccessToken(identity, ttl = 3600) {
	if (!apiKeySid || !apiKeySecret || !accountSid) {
		throw new Error('Missing TWILIO credentials in environment variables');
	}

	const AccessToken = Twilio.jwt.AccessToken;
	const VoiceGrant = AccessToken.VoiceGrant;

	const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, { ttl });
	token.identity = identity;

	const voiceGrant = new VoiceGrant({
		outgoingApplicationSid: outgoingAppSid || undefined,
		incomingAllow: true,
	});

	token.addGrant(voiceGrant);

	const issuedAt = Math.floor(Date.now() / 1000);
	const expiresAt = issuedAt + ttl;

	return {
		identity,
		jwt: token.toJwt(),
		issuedAt,
		expiresAt,
	};
}

const twilioRestClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
	? Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
	: null;

export { twilioRestClient, TWILIO_FROM_NUMBER, outgoingAppSid };

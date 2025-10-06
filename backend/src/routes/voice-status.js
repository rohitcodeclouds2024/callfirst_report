// src/routes/voice-status.js
export default async function registerVoiceStatusRoutes(fastify) {
	fastify.post("/voice/status", async (request, reply) => {
		const params = { ...request.body, ...request.query };
		request.log.info({ params }, "📡 Twilio conference status callback");

		const {
			ConferenceSid,
			ConferenceName,
			StatusCallbackEvent,
			CallSid,
			ParticipantSid,
			Timestamp,
		} = params;

		// TODO: replace with DB updates in prod
		const activeCalls = fastify.activeCalls || new Map();
		fastify.activeCalls = activeCalls;

		switch (StatusCallbackEvent) {
			case "conference-start":
				activeCalls.set(ConferenceSid, {
					conference: ConferenceName,
					status: "started",
					participants: [],
					startedAt: Timestamp || new Date().toISOString(),
				});
				break;

			case "conference-end":
				if (activeCalls.has(ConferenceSid)) {
					const rec = activeCalls.get(ConferenceSid);
					rec.status = "ended";
					rec.endedAt = Timestamp || new Date().toISOString();
					activeCalls.set(ConferenceSid, rec);
				}
				break;

			case "participant-join":
				if (activeCalls.has(ConferenceSid)) {
					const rec = activeCalls.get(ConferenceSid);
					rec.participants = rec.participants || [];
					rec.participants.push({ callSid: CallSid, participantSid: ParticipantSid });
					rec.status = "in-progress";
					activeCalls.set(ConferenceSid, rec);
				}
				break;

			case "participant-leave":
				if (activeCalls.has(ConferenceSid)) {
					const rec = activeCalls.get(ConferenceSid);
					rec.participants =
						(rec.participants || []).filter((p) => p.participantSid !== ParticipantSid);
					activeCalls.set(ConferenceSid, rec);
				}
				break;

			default:
				request.log.info(`Unhandled StatusCallbackEvent: ${StatusCallbackEvent}`);
		}

		return reply.code(200).send("ok");
	});
}

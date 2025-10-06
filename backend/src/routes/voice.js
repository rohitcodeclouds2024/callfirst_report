// src/routes/voice.js
export default async function registerVoiceRoutes(fastify) {
	const handler = async (request, reply) => {
		const params = { ...request.query, ...request.body };
		request.log.info({ twilioParams: params }, "📞 Incoming Twilio webhook /voice/join");

		const confName = params.name || params.conference;
		if (!confName) return reply.code(400).send("missing conference name");

		const startRaw = params.startOnEnter ?? params.start_on_enter;
		const startOnEnter = startRaw === true || startRaw === "true" || startRaw === "1";

		const waitUrl =
			params.waitUrl ||
			process.env.TWILIO_CONFERENCE_WAIT_URL ||
			"http://twimlets.com/holdmusic?Bucket=com.twilio.music.classical";

		// NEW: Conference status callback URL
		const statusCallbackUrl =
			process.env.PUBLIC_BASE_URL + "/voice/status"; // must be publicly accessible

		const twiml = `
      <Response>
        <Dial>
          <Conference
            startConferenceOnEnter="${startOnEnter ? "true" : "false"}"
            endConferenceOnExit="true"
            waitUrl="${waitUrl}"
            statusCallback="${statusCallbackUrl}"
            statusCallbackMethod="POST"
            statusCallbackEvent="start end join leave"
          >${confName}</Conference>
        </Dial>
      </Response>
    `;

		reply.header("Content-Type", "text/xml").send(twiml);
	};

	fastify.post("/voice/join", handler);
	fastify.get("/voice/join", handler);
}

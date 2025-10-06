import LgTracker from '../models/lgTracker.js';
import bcrypt from 'bcrypt';

export default async function trackerRoutes(fastify) {
	fastify.post("/tracker", async (request, reply) => {
	    try {
	      const {
	        campaign_name,
	        no_of_dials,
	        no_of_contacts,
	        gross_transfer,
	        net_transfer,
	        date,
	      } = request.body;

	      const tracker = await LgTracker.create({
	        campaign_name,
	        no_of_dials,
	        no_of_contacts,
	        gross_transfer,
	        net_transfer,
	        date,
	      });

	      return reply.send({ success: true, data: tracker });
	    } catch (err) {
	      fastify.log.error(err);
	      return reply.status(500).send({ error: "failed_to_create_tracker" });
	    }
	});
}

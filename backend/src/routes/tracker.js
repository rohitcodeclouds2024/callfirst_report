import LgTracker from '../models/lgTracker.js';
import bcrypt from 'bcrypt';

export default async function trackerRoutes(fastify) {
	fastify.post("/tracker", async (request, reply) => {
	    try {
	      const {
	      	client_id,
	        campaign_name,
	        no_of_dials,
	        no_of_contacts,
	        gross_transfer,
	        net_transfer,
	        date,
	      } = request.body;

	      const tracker = await LgTracker.create({
	      	client_id,
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

	fastify.get("/report/tracker-data", async (req, reply) => {
    	try {
      		const { client_id, start_date, end_date } = req.query;

      		if (!client_id) {
        		return reply.status(400).send({ error: "Client ID is required" });
      		}

      		const where = { client_id };

      		if (start_date && end_date) {
        		where.date = {
          			[Op.between]: [new Date(start_date), new Date(end_date)],
        		};
      		} else if (start_date) {
        		where.date = { [Op.gte]: new Date(start_date) };
      		} else if (end_date) {
        		where.date = { [Op.lte]: new Date(end_date) };
      		}

      		const data = await LgTracker.findAll({
        		where,
        		order: [["date", "DESC"]],
      		});

      		return reply.send({ data });
    	} catch (err) {
      		fastify.log.error(err);
      		return reply.status(500).send({ error: "Failed to fetch tracker data" });
    	}
  	});
}

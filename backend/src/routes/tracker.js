import LgTracker from '../models/lgTracker.js';
import { getDateRange } from "../utils/dateRange.js";
import bcrypt from 'bcrypt';
import { Op } from "sequelize";

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

  	fastify.post("/conversion-percentage", async (request, reply) => {
  		const { clientId, dateFilter, customRange } = request.body;

  		if (!clientId) return reply.status(400).send({ message: "clientId is required" });

  		let startDate, endDate, dateArray;
  		try {
    		({ startDate, endDate, dateArray } = getDateRange(dateFilter, customRange));
  		} catch (err) {
    		return reply.status(400).send({ message: err.message });
  		}

  		const data = await LgTracker.findAll({
    		where: {
      			client_id: clientId,
      			date: {
        			[Op.between]: [startDate, endDate],
      			},
    		},
    		order: [["date", "ASC"]],
    		attributes: ["date", "no_of_contacts", "gross_transfer"],
  		});

  		const chartData = dateArray.map((date) => {
    		const record = data.find((d) => d.date === date);
    		const conversion = record && record.no_of_contacts
      			? (100 * record.gross_transfer) / record.no_of_contacts
      			: 0;	

    		return {
      			name: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      			conversion: parseFloat(conversion.toFixed(2)),
    		};
  		});

  		return reply.send(chartData);
	});


  	fastify.post("/contacts-number", async (request, reply) => {
    	const { clientId, dateFilter, customRange } = request.body;

    	if (!clientId) return reply.status(400).send({ message: "clientId is required" });

  		let startDate, endDate, dateArray;
  		try {
    		({ startDate, endDate, dateArray } = getDateRange(dateFilter, customRange));
  		} catch (err) {
    		return reply.status(400).send({ message: err.message });
  		}

  		const data = await LgTracker.findAll({
    		where: {
      			client_id: clientId,
      			date: {
        			[Op.between]: [startDate, endDate],
      			},
    		},
    		order: [["date", "ASC"]],
    		attributes: ["date", "no_of_contacts"],
  		});

    	// Map data to chart format
    	const chartData = dateArray.map((date) => {
	      	const record = data.find((d) => d.date === date);
	      	const no_of_contacts = (record && record.no_of_contacts) || 0;
	      	return {
	        	name: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), // e.g., Oct 1
	        	contacts: no_of_contacts,
	      	};
	    });

    	return reply.send(chartData);
  	});

  	fastify.post("/dials-number", async (request, reply) => {
    	const { clientId, dateFilter, customRange } = request.body;

    	if (!clientId) return reply.status(400).send({ message: "clientId is required" });

  		let startDate, endDate, dateArray;
  		try {
    		({ startDate, endDate, dateArray } = getDateRange(dateFilter, customRange));
  		} catch (err) {
    		return reply.status(400).send({ message: err.message });
  		}

  		const data = await LgTracker.findAll({
    		where: {
      			client_id: clientId,
      			date: {
        			[Op.between]: [startDate, endDate],
      			},
    		},
    		order: [["date", "ASC"]],
    		attributes: ["date", "no_of_dials"],
  		});

    	// Map data to chart format
    	const chartData = dateArray.map((date) => {
	      	const record = data.find((d) => d.date === date);
	      	const no_of_dials = (record && record.no_of_dials) || 0;
	      	return {
	        	name: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), // e.g., Oct 1
	        	dials: no_of_dials,
	      	};
	    });

    	return reply.send(chartData);
  	});
}

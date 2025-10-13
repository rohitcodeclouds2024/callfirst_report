import LgTracker from '../models/lgTracker.js';
import UploadedData from "../models/uploadedData.js";
import { getDateRange } from "../utils/dateRange.js";
import bcrypt from 'bcrypt';
import { Op } from "sequelize";
import { sequelize } from '../lib/db.js';

import multer from "fastify-multer";
import csvParser from "csv-parser";
import fs from "fs";

// Configure multer to store uploaded files temporarily
const upload = multer({ dest: "uploads/" });

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

	fastify.post("/report/tracker-data", async (req, reply) => {
    	try {
      		const {
        		client_id,
        		start_date,
        		end_date,
        		page = 1,
        		perPage = 20,
      		} = req.body;

      		if (!client_id) {
        		return reply.status(400).send({ error: "Client ID is required" });
      		}

      		const pageNum = Math.max(1, Number(page));
      		const limit = Math.max(1, Math.min(100, Number(perPage)));
      		const offset = (pageNum - 1) * limit;

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

      		const { rows, count } = await LgTracker.findAndCountAll({
        		where,
        		order: [["date", "DESC"]],
        		limit,
        		offset,
      		});

  			return reply.send({
    			data: rows,
    			meta: {
      				page: pageNum,
      				perPage: limit,
      				total: count,
      				totalPages: Math.ceil(count / limit),
    			},
  			});
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

  	fastify.post("/uploads-report", async (request, reply) => {
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
    		attributes: ["date", "count"],
  		});

    	// Map data to chart format
    	const chartData = dateArray.map((date) => {
	      	const record = data.find((d) => d.date === date);
	      	const count = (record && record.count) || 0;
	      	return {
	        	name: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), // e.g., Oct 1
	        	value: count,
	      	};
	    });

    	return reply.send(chartData);
  	});

  	fastify.post(
    	"/tracker/upload",
    	{ preHandler: upload.single("file") },
    	async (req, reply) => {
      		const {
        		client_id,
        		campaign_name,
        		no_of_dials,
        		no_of_contacts,
        		gross_transfer,
        		net_transfer,
        		date,
      		} = req.body;

      		const file = req.file;

      		// --- Validation ---
      		if (!client_id) return reply.status(400).send({ error: "Client ID is required" });
      		if (!date) return reply.status(400).send({ error: "Date is required" });

      		try {
        		let results = [];
        		let fileName = null;
        		let count = 0;
        		let status = "no_file";

        		// --- If a file is uploaded ---
        		if (file) {
          			fileName = file.originalname;
          			const filePath = file.path;
          			status = "processing";

          			// --- Parse CSV ---
          			await new Promise((resolve, reject) => {
            			fs.createReadStream(filePath)
              			.pipe(csvParser())
              			.on("data", (row) => {
                			if (row["Customer Name"] && row["Phone number"] && row["Status"]) {
                  				results.push({
                    				client_id: Number(client_id),
                    				customer_name: row["Customer Name"],
                    				phone_number: row["Phone number"],
                    				status: row["Status"],
                  				});
                			}
              			})
              			.on("end", resolve)
              			.on("error", reject);
          			});

          			count = results.length;
          			status = count > 0 ? "success" : "failed";

          			// Delete the uploaded file after parsing
          			fs.unlinkSync(filePath);
        		}

        		// --- Create Tracker Record ---
        		const tracker = await LgTracker.create({
		          	client_id,
		          	campaign_name,
		          	no_of_dials,
		          	no_of_contacts,
		          	gross_transfer,
		          	net_transfer,
		          	date,
		          	file_name: fileName || "",
		          	count: count || 0,
		          	status,
		        });

        		// --- If file data exists, bulk insert uploaded rows ---
        		if (results.length > 0) {
          			const rowsWithTrackerId = results.map((r) => ({
            			...r,
            			lg_tracker_id: tracker.id,
          			}));
          			await UploadedData.bulkCreate(rowsWithTrackerId);
        		}

        		return reply.send({
		          	success: true,
		          	message: "Tracker saved successfully",
		          	data: tracker,
		          	uploaded_count: count,
		        });
      		} catch (err) {
        		fastify.log.error(err);
        		return reply.status(500).send({ error: "Failed to save tracker data" });
      		}
    	}
  	);

}

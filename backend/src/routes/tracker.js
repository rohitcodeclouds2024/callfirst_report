import LgTracker from '../models/lgTracker.js';
import UploadedData from "../models/uploadedData.js";
import { getDateRange,getDateRangeNewLogic } from "../utils/dateRange.js";
import { formatDateRangeLabel,groupData,formatDateMDY } from "../utils/helperFunction.js";
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
     			order: [["id", "DESC"]],
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

  	fastify.get("/report/tracker-download", async (req, reply) => {
  		try {
    		const { client_id, start_date, end_date } = req.query;

    		if (!client_id) {
      		return reply.status(400).send({ error: "Client ID is required" });
    		}

    		const where = { client_id };

    		if (start_date && end_date) {
      		where.date = { [Op.between]: [new Date(start_date), new Date(end_date)] };
    		}

    		const rows = await LgTracker.findAll({ where, raw: true });

    		if (!rows.length) {
      		return reply.status(404).send({ error: "No data found" });
    		}

			const formattedData = rows.map(item => ({
		      // "Date": formatDateMDY(item.date),
		      "Date": item.date,
		      "No. of Dials": item.no_of_dials || 0,
		      "No. of Contacts": item.no_of_contacts || 0,
		      "Gross Transfer": item.gross_transfer || 0,
		      "Net Transfer": item.net_transfer || 0,
		      "Conv %": item.no_of_contacts
		        ? ((100 * item.gross_transfer) / item.no_of_contacts).toFixed(2)
		        : "0.00",
		   }));

		    // Convert to CSV manually
		   const headers = Object.keys(formattedData[0]).join(",") + "\n";
		   const csvRows = formattedData
		      .map(row => Object.values(row).join(","))
		      .join("\n");
		   const csv = headers + csvRows;

    		reply
      	.header("Content-Type", "text/csv")
      	.header("Content-Disposition", "attachment; filename=tracker_report.csv")
      	.send(csv);
  		} catch (error) {
    		console.error(error);
    		reply.status(500).send({ error: "Failed to generate CSV" });
  		}
	});

	fastify.post("/conversion-percentage", async (request, reply) => {
  		try {
	    	const { clientId, dateFilter, customRange } = request.body;
	    	if (!clientId) return reply.status(400).send({ message: "clientId is required" });

	    	// Get date range
	    	const { startDate, endDate, dateArray } = getDateRangeNewLogic(dateFilter, customRange);
	    	const sameYear = new Date(startDate).getFullYear() === new Date(endDate).getFullYear();

	    	// Fetch tracker data
	    	const trackerData = await LgTracker.findAll({
	      	where: {
	        		client_id: clientId,
	        		date: { [Op.between]: [startDate, endDate] },
	      	},
	      	order: [["date", "ASC"]],
	      	attributes: ["date", "no_of_contacts", "gross_transfer"],
	      	raw: true,
	    	});

	    	// Map data
	    	const dataMap = new Map(
	      	trackerData.map(d => [
	        		d.date.split("T")[0],
	        		{ no_of_contacts: d.no_of_contacts, gross_transfer: d.gross_transfer },
	      	])
	    	);

	    	// Conversion = gross_transfer / no_of_contacts * 100
	    	const groupedData = [];
	    	const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
	    	const maxPoints = 10;
	    	const groupSize = diffDays > 10 ? Math.ceil(diffDays / maxPoints) : 1;

	    	for (let i = 0; i < dateArray.length; i += groupSize) {
	      	const groupDates = dateArray.slice(i, i + groupSize);
	      	let totalContacts = 0;
	      	let totalTransfers = 0;

	      	groupDates.forEach(date => {
	        		const entry = dataMap.get(date);
	        		if (entry) {
	          		totalContacts += entry.no_of_contacts || 0;
	          		totalTransfers += entry.gross_transfer || 0;
	        		}
	      	});

	      	const conversion = totalContacts > 0 ? (totalTransfers / totalContacts) * 100 : 0;
	      	groupedData.push({
	        		name: formatDateRangeLabel(groupDates[0], groupDates[groupDates.length - 1], sameYear),
	        		conversion: Number(conversion.toFixed(2)),
	      	});
    		}

    		return reply.send(groupedData);
  		} catch (error) {
    		console.error("Error in /conversion-percentage:", error);
    		return reply.status(500).send({ message: "Internal server error" });
  		}
	});

	fastify.post("/contacts-number", async (request, reply) => {
  		try {
    		const { clientId, dateFilter, customRange } = request.body;
    		if (!clientId) return reply.status(400).send({ message: "clientId is required" });

    		const { startDate, endDate, dateArray } = getDateRangeNewLogic(dateFilter, customRange);
    		const sameYear = new Date(startDate).getFullYear() === new Date(endDate).getFullYear();

    		const trackerData = await LgTracker.findAll({
      		where: {
        			client_id: clientId,
        			date: { [Op.between]: [startDate, endDate] },
      		},
      		order: [["date", "ASC"]],
      		attributes: ["date", "no_of_contacts"],
      		raw: true,
    		});

    		const dataMap = new Map(trackerData.map(d => [d.date.split("T")[0], { no_of_contacts: d.no_of_contacts }]));

    		const groupedData = groupData({
      		dateArray,
      		dataMap,
      		startDate,
      		endDate,
      		sameYear,
      		field: "no_of_contacts",
      		sendas: "contacts",
    		});

    		return reply.send(groupedData);
  		} catch (error) {
    		console.error("Error in /contacts-number:", error);
    		return reply.status(500).send({ message: "Internal server error" });
  		}
	});

	fastify.post("/dials-number", async (request, reply) => {
  		try {
    		const { clientId, dateFilter, customRange } = request.body;
    		if (!clientId) return reply.status(400).send({ message: "clientId is required" });

    		const { startDate, endDate, dateArray } = getDateRangeNewLogic(dateFilter, customRange);
    		const sameYear = new Date(startDate).getFullYear() === new Date(endDate).getFullYear();

    		const trackerData = await LgTracker.findAll({
      		where: {
        			client_id: clientId,
        			date: { [Op.between]: [startDate, endDate] },
      		},
      		order: [["date", "ASC"]],
      		attributes: ["date", "no_of_dials"],
      		raw: true,
    		});

    		const dataMap = new Map(trackerData.map(d => [d.date.split("T")[0], { no_of_dials: d.no_of_dials }]));

    		const groupedData = groupData({
      		dateArray,
      		dataMap,
      		startDate,
      		endDate,
      		sameYear,
      		field: "no_of_dials",
      		sendas: "dials",
    		});

    		return reply.send(groupedData);
  		} catch (error) {
    		console.error("Error in /dials-number:", error);
    		return reply.status(500).send({ message: "Internal server error" });
  		}
	});

	fastify.post("/uploads-report", async (request, reply) => {
  		try {
    		const { clientId, dateFilter, customRange } = request.body;
    		if (!clientId) return reply.status(400).send({ message: "clientId is required" });

    		const { startDate, endDate, dateArray } = getDateRangeNewLogic(dateFilter, customRange);
    		const sameYear = new Date(startDate).getFullYear() === new Date(endDate).getFullYear();

    		const trackerData = await LgTracker.findAll({
      		where: {
        			client_id: clientId,
        			date: { [Op.between]: [startDate, endDate] },
      		},
      		order: [["date", "ASC"]],
      		attributes: ["date", "count"],
      		raw: true,
    		});

    		const dataMap = new Map(trackerData.map(d => [d.date.split("T")[0], { count: d.count }]));

    		const groupedData = groupData({
		      dateArray,
		      dataMap,
		      startDate,
		      endDate,
		      sameYear,
		      field: "count",
		      sendas: "value",
		   });

    		return reply.send(groupedData);
  		} catch (error) {
    		console.error("Error in /uploads-report:", error);
    		return reply.status(500).send({ message: "Internal server error" });
  		}
	});


  	fastify.post(
  		"/tracker/upload",
  		{ preHandler: upload.single("file") },
  		async (req, reply) => {
		   const {
		      lg_tracker_id,
		      client_id,
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

	      	if(count != gross_transfer){
	      		return reply.status(400).send({ error: "Trying to attempt wrong file" });
	      	}

   			let tracker;

   			if (Number(lg_tracker_id) === 0) {
     				// --- Create new tracker ---
		        	tracker = await LgTracker.create({
		          	client_id,
		          	no_of_dials,
		          	no_of_contacts,
		          	gross_transfer,
		          	net_transfer,
		          	date,
		          	file_name: fileName || "",
		          	count: count || 0,
		          	status,
		        	});
   			} else {
        			// --- Update existing tracker ---
        			tracker = await LgTracker.findByPk(lg_tracker_id);

        			if (!tracker) {
          			return reply.status(404).send({ error: "Tracker not found" });
        			}

        			await tracker.update({
			         client_id,
			         no_of_dials,
			         no_of_contacts,
			         gross_transfer,
			         net_transfer,
			         date,
			         file_name: fileName || tracker.file_name,
			         count: count || 0,
			         status,
			       });

        			// --- Delete previous UploadedData entries ---
			      await UploadedData.destroy({
			         where: { lg_tracker_id: lg_tracker_id },
			      });
      		}

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
        			message: lg_tracker_id === 0 ? "Tracker saved successfully" : "Tracker updated successfully",
        			data: tracker,
        			uploaded_count: count,
      		});
    		} catch (err) {
      		fastify.log.error(err);
      		return reply.status(500).send({ error: "Failed to save tracker data" });
    		}
  		}
	);


  	fastify.post(
	   "/tracker/details",
	   // { preValidation: [fastify.authenticate] }, 
	   async (request, reply) => {
	      try {
	        const { lg_tracker_id } = request.body;

	        	if (!lg_tracker_id) {
	          	return reply.status(400).send({ error: "lg_tracker_id is required" });
	        	}

	        	const lgData = await LgTracker.findOne({
	            where: { id: lg_tracker_id },
	            attributes: ['client_id', 'no_of_dials', 'no_of_contacts','gross_transfer','net_transfer','date'],
	            include: [
	               {
	                 	model: User,
	                 	as: 'client', // same 'as' as in your association
	                 	attributes: ['name'],
	               },
	            ],
	         });

	        	return reply.send({
	          	data: lgData,
	        	});
	      } catch (err) {
	        	fastify.log.error(err);
	        	return reply.status(500).send({ error: "list_failed" });
	      }
	   }
	);

	fastify.delete('/tracker/:id', async (request, reply) => {
		try {
			const id = Number(request.params.id);
			if (!Number.isFinite(id) || id <= 0) {
				return reply.code(400).send({ error: 'invalid_id' });
			}

			const deleted = await LgTracker.destroy({ where: { id } });

			if (!deleted) {
				return reply.code(404).send({ error: 'not_found' });
			}
			await UploadedData.destroy({
	          	where: { lg_tracker_id: id },
	        });

			// return 200 with body or 204 no-content — using 200 for easier client handling
			return reply.code(200).send({ ok: true, id });
		} catch (err) {
			fastify.log.error(err);
			return reply.code(500).send({ error: 'delete_failed' });
		}
	});

}

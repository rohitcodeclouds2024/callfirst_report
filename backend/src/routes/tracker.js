import LgTracker from '../models/lgTracker.js';
import UploadedData from "../models/uploadedData.js";
import { getDateRange,getDateRangeNewLogic } from "../utils/dateRange.js";
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


  	fastify.post("/conversion-percentage_old", async (request, reply) => {
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

	fastify.post("/conversion-percentage", async (request, reply) => {
  try {
    const { clientId, dateFilter, customRange } = request.body;

    if (!clientId) {
      return reply.status(400).send({ message: "clientId is required" });
    }

    const { startDate, endDate, dateArray } = getDateRangeNewLogic(dateFilter, customRange);
    const sameYear = new Date(startDate).getFullYear() === new Date(endDate).getFullYear();

    // Fetch data from DB
    const data = await LgTracker.findAll({
      where: {
        client_id: clientId,
        date: { [Op.between]: [startDate, endDate] },
      },
      order: [["date", "ASC"]],
      attributes: ["date", "no_of_contacts", "gross_transfer"],
      raw: true,
    });

    // Map DB results by date
    const dataMap = new Map();
    data.forEach(d => {
      const dateKey = d.date.split("T")[0];
      dataMap.set(dateKey, {
        no_of_contacts: d.no_of_contacts,
        gross_transfer: d.gross_transfer,
      });
    });

    const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    let groupedData;

    if (diffDays > 10) {
      const maxPoints = 10;
      const groupSize = Math.ceil(diffDays / maxPoints);

      for (let i = 0; i < dateArray.length; i += groupSize) {
        const groupDates = dateArray.slice(i, i + groupSize);

        let totalContacts = 0;
        let totalGross = 0;

        groupDates.forEach(date => {
          const record = dataMap.get(date);
          if (record) {
            totalContacts += record.no_of_contacts || 0;
            totalGross += record.gross_transfer || 0;
          }
        });

        // Compute conversion
        const conversion = totalContacts ? (100 * totalGross) / totalContacts : 0;

        // Format label
        const startDateObj = new Date(groupDates[0]);
        const endDateObj = new Date(groupDates[groupDates.length - 1]);

        const startLabel = startDateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          ...(sameYear ? {} : { year: "2-digit" }),
        });
        const endLabel = endDateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          ...(sameYear ? {} : { year: "2-digit" }),
        });

        const rangeLabel = startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;

        groupedData.push({
          name: rangeLabel,
          conversion: parseFloat(conversion.toFixed(2)),
        });
      }
    } else {
      // Daily data
      groupedData = dateArray.map(date => {
        const record = dataMap.get(date);
        const conversion = record && record.no_of_contacts
          ? (100 * record.gross_transfer) / record.no_of_contacts
          : 0;

        return {
          name: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          conversion: parseFloat(conversion.toFixed(2)),
        };
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

		    if (!clientId) {
		      return reply.status(400).send({ message: "clientId is required" });
		    }

    		const { startDate, endDate, dateArray } = getDateRangeNewLogic(dateFilter, customRange);

    		const sameYear = new Date(startDate).getFullYear() === new Date(endDate).getFullYear();

    		// console.log(startDate, endDate, dateArray);

		    const trackerData = await LgTracker.findAll({
		      	where: {
		        	client_id: clientId,
		        	date: { [Op.between]: [startDate, endDate] },
		      	},
		      	order: [["date", "ASC"]],
		      	attributes: ["date", "no_of_contacts"],
		      	raw: true,
		    });

    		// Convert DB results into a map for fast lookup
    		const contactMap = new Map(
      			trackerData.map((d) => [d.date.split("T")[0], d.no_of_contacts])
    		);

    		// console.log(contactMap, trackerData);


    		const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    		let groupedData = [];

    		if (diffDays > 10) {
      			const maxPoints = 10;
      			const groupSize = Math.ceil(diffDays / maxPoints);

      			for (let i = 0; i < dateArray.length; i += groupSize) {
  					const groupDates = dateArray.slice(i, i + groupSize);
  					const totalContacts = groupDates.reduce(
    					(sum, d) => sum + (contactMap.get(d) || 0),
    					0
  					);

  					const startDateObj = new Date(groupDates[0]);
  					const endDateObj = new Date(groupDates[groupDates.length - 1]);


  					// Format labels
				  	const startLabel = startDateObj.toLocaleDateString("en-US", {
				    	month: "short",
				    	day: "numeric",
				    	...(sameYear ? {} : { year: '2-digit' })
				  	});
				  	const endLabel = endDateObj.toLocaleDateString("en-US", {
				    	month: "short",
				    	day: "numeric",
				    	...(sameYear ? {} : { year: '2-digit' })
				  	});

				  	const rangeLabel = startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;

				  	groupedData.push({
				    	name: rangeLabel,
				    	contacts: totalContacts,
				  	});
				}
    		} else {
      			// Small range → keep daily data
      			groupedData = dateArray.map((date) => ({
       	 				name: new Date(date).toLocaleDateString("en-US", {
          				month: "short",
          				day: "numeric",
        			}),
        			contacts: contactMap.get(date) || 0,
     	 		}));
    		}

    		return reply.send(groupedData);
  		} catch (error) {
    		console.error("Error in /contacts-number:", error);
    		return reply.status(500).send({ message: "Internal server error" });
  		}
	});

	fastify.post("/dials-number", async (request, reply) => {
  		try {
    		const { clientId, dateFilter, customRange } = request.body;

		    if (!clientId) {
		      return reply.status(400).send({ message: "clientId is required" });
		    }

    		const { startDate, endDate, dateArray } = getDateRangeNewLogic(dateFilter, customRange);

    		const sameYear = new Date(startDate).getFullYear() === new Date(endDate).getFullYear();

    		// console.log(startDate, endDate, dateArray);

		    const trackerData = await LgTracker.findAll({
		      	where: {
		        	client_id: clientId,
		        	date: { [Op.between]: [startDate, endDate] },
		      	},
		      	order: [["date", "ASC"]],
		      	attributes: ["date", "no_of_dials"],
		      	raw: true,
		    });

    		// Convert DB results into a map for fast lookup
    		const contactMap = new Map(
      			trackerData.map((d) => [d.date.split("T")[0], d.no_of_dials])
    		);

    		// console.log(contactMap, trackerData);


    		const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    		let groupedData = [];

    		if (diffDays > 10) {
      			const maxPoints = 10;
      			const groupSize = Math.ceil(diffDays / maxPoints);

      			for (let i = 0; i < dateArray.length; i += groupSize) {
  					const groupDates = dateArray.slice(i, i + groupSize);
  					const totalContacts = groupDates.reduce(
    					(sum, d) => sum + (contactMap.get(d) || 0),
    					0
  					);

  					const startDateObj = new Date(groupDates[0]);
  					const endDateObj = new Date(groupDates[groupDates.length - 1]);


  					// Format labels
				  	const startLabel = startDateObj.toLocaleDateString("en-US", {
				    	month: "short",
				    	day: "numeric",
				    	...(sameYear ? {} : { year: '2-digit' })
				  	});
				  	const endLabel = endDateObj.toLocaleDateString("en-US", {
				    	month: "short",
				    	day: "numeric",
				    	...(sameYear ? {} : { year: '2-digit' })
				  	});

				  	const rangeLabel = startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;

				  	groupedData.push({
				    	name: rangeLabel,
				    	dials: totalContacts,
				  	});
				}
    		} else {
      			// Small range → keep daily data
      			groupedData = dateArray.map((date) => ({
       	 				name: new Date(date).toLocaleDateString("en-US", {
          				month: "short",
          				day: "numeric",
        			}),
        			dials: contactMap.get(date) || 0,
     	 		}));
    		}

    		return reply.send(groupedData);
  		} catch (error) {
    		console.error("Error in //dials-number:", error);
    		return reply.status(500).send({ message: "Internal server error" });
  		}
	});

	fastify.post("/uploads-report", async (request, reply) => {
  		try {
    		const { clientId, dateFilter, customRange } = request.body;

		    if (!clientId) {
		      return reply.status(400).send({ message: "clientId is required" });
		    }

    		const { startDate, endDate, dateArray } = getDateRangeNewLogic(dateFilter, customRange);

    		const sameYear = new Date(startDate).getFullYear() === new Date(endDate).getFullYear();

    		// console.log(startDate, endDate, dateArray);

		    const trackerData = await LgTracker.findAll({
		      	where: {
		        	client_id: clientId,
		        	date: { [Op.between]: [startDate, endDate] },
		      	},
		      	order: [["date", "ASC"]],
		      	attributes: ["date", "count"],
		      	raw: true,
		    });

    		// Convert DB results into a map for fast lookup
    		const contactMap = new Map(
      			trackerData.map((d) => [d.date.split("T")[0], d.count])
    		);

    		// console.log(contactMap, trackerData);


    		const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    		let groupedData = [];

    		if (diffDays > 10) {
      			const maxPoints = 10;
      			const groupSize = Math.ceil(diffDays / maxPoints);

      			for (let i = 0; i < dateArray.length; i += groupSize) {
  					const groupDates = dateArray.slice(i, i + groupSize);
  					const totalContacts = groupDates.reduce(
    					(sum, d) => sum + (contactMap.get(d) || 0),
    					0
  					);

  					const startDateObj = new Date(groupDates[0]);
  					const endDateObj = new Date(groupDates[groupDates.length - 1]);


  					// Format labels
				  	const startLabel = startDateObj.toLocaleDateString("en-US", {
				    	month: "short",
				    	day: "numeric",
				    	...(sameYear ? {} : { year: '2-digit' })
				  	});
				  	const endLabel = endDateObj.toLocaleDateString("en-US", {
				    	month: "short",
				    	day: "numeric",
				    	...(sameYear ? {} : { year: '2-digit' })
				  	});

				  	const rangeLabel = startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;

				  	groupedData.push({
				    	name: rangeLabel,
				    	value: totalContacts,
				  	});
				}
    		} else {
      			// Small range → keep daily data
      			groupedData = dateArray.map((date) => ({
       	 				name: new Date(date).toLocaleDateString("en-US", {
          				month: "short",
          				day: "numeric",
        			}),
        			value: contactMap.get(date) || 0,
     	 		}));
    		}

    		return reply.send(groupedData);
  		} catch (error) {
    		console.error("Error in //uploads-report:", error);
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

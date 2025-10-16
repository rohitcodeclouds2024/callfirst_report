// routes/upload.js
import multer from "fastify-multer";
import csvParser from "csv-parser";
import fs from "fs";
import { Op } from "sequelize";
import { sequelize } from '../lib/db.js';

import UploadLog from "../models/uploadLog.js";
import UploadedData from "../models/uploadedData.js";
import User from "../models/user.js";
import LgTracker from '../models/lgTracker.js';
import { getDateRange } from "../utils/dateRange.js";

// Configure multer to store uploaded files temporarily
const upload = multer({ dest: "uploads/" });

export default async function uploadRoutes(fastify, opts) {
   //Upload CSV/XLSX route
   fastify.post(
      "/upload",
      { preHandler: upload.single("file") }, // multer middleware
      async (req, reply) => {
         try {
            const { client_id } = req.body;
            const file = req.file;

            if (!client_id) {
               return reply.status(400).send({ error: "Client ID is required" });
            }

            if (!file) {
               return reply.status(400).send({ error: "File is required" });
            }

            const filePath = file.path;

            // Create upload log entry
            const log = await UploadLog.create({
               client_id,
               file_name: file.originalname,
               status: "processing",
            });

            const results = [];

            // Parse CSV file
            await new Promise((resolve, reject) => {
               fs.createReadStream(filePath)
               .pipe(csvParser())
               .on("data", (row) => {
                  if (row["Customer Name"] && row["Phone number"] && row["Status"]) {
                     results.push({
                        upload_log_id: log.id,
                        client_id:client_id,
                        customer_name: row["Customer Name"],
                        phone_number: row["Phone number"],
                        status: row["Status"],
                     });
                  }
               })
               .on("end", resolve)
               .on("error", reject);
            });

            // Save parsed data to uploaded_data table
            if (results.length > 0) {
               await UploadedData.bulkCreate(results);
               await log.update({ status: "success",count: results.length});
            } else {
               await log.update({ status: "failed" });
            }

            // Delete temporary uploaded file
            fs.unlinkSync(filePath);

            return reply.send({ message: "File uploaded successfully" });
         } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Upload failed" });
         }
      }
   );

   // Download sample CSV route
   fastify.get("/upload/sample", async (req, reply) => {
      const sample =
      "Customer Name,Phone number,Status\nJohn Doe,9999999999,Active\nJane Doe,8888888888,Inactive";
      reply.header("Content-Type", "text/csv");
      reply.header("Content-Disposition", "attachment; filename=upload_sample.csv");
      reply.send(sample);
   });

   fastify.post(
      "/report/tracker/uploaded-data",
      // { preValidation: [fastify.authenticate] }, 
      async (request, reply) => {
         try {
            const { lg_tracker_id, page = 1, perPage = 20, keyword = "" } = request.body;

            if (!lg_tracker_id) {
               return reply.status(400).send({ error: "lg_tracker_id is required" });
            }

            const pageNum = Math.max(1, Number(page));
            const limit = Math.max(1, Math.min(100, Number(perPage)));
            const offset = (pageNum - 1) * limit;

            const where = { lg_tracker_id };

            // Optional keyword search by customer name or phone number
            if (keyword.trim()) {
               where[Op.or] = [
                  { customer_name: { [Op.like]: `%${keyword}%` } },
                  { phone_number: { [Op.like]: `%${keyword}%` } },
               ];
            }

            const { rows, count } = await UploadedData.findAndCountAll({
               where,
               limit,
               offset,
               order: [["id", "DESC"]],
            });

            return reply.send({
               data: rows,
               lgData: await LgTracker.findOne({
                  where: { id: lg_tracker_id },
                  attributes: ['client_id', 'no_of_dials', 'no_of_contacts','gross_transfer','net_transfer','date'],
                  include: [
                     {
                        model: User,
                        as: 'client', // same 'as' as in your association
                        attributes: ['name'],
                     },
                  ],
               }),
               meta: {
                  page: pageNum,
                  perPage: limit,
                  total: count,
                  totalPages: Math.ceil(count / limit),
               },
            });
         } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "list_failed" });
         }
      }
   );

   fastify.get("/tracker/uploaded-data-download", async (request, reply) => {
      try {
         const { lg_tracker_id } = request.query;

         if (!lg_tracker_id) {
            return reply.status(400).send({ error: "lg_tracker_id is required" });
         }

         // Fetch all uploaded data for this tracker
         const rows = await UploadedData.findAll({
            where: { lg_tracker_id },
            order: [["id", "DESC"]],
            raw: true,
         });

         if (!rows.length) {
            return reply.status(404).send({ error: "No data found" });
         }

         // Transform data to only include what you want to download
         const formattedData = rows.map(item => ({
            "Customer Name": item.customer_name,
            "Phone Number": item.phone_number,
            "Status": item.status,
         }));

         // Convert to CSV
         const headers = Object.keys(formattedData[0]).join(",") + "\n";
         const csvRows = formattedData.map(row => Object.values(row).join(",")).join("\n");
         const csv = headers + csvRows;

         // Send CSV response
         reply
         .header("Content-Type", "text/csv")
         .header(
           "Content-Disposition",
           `attachment; filename=uploaded_data_${lg_tracker_id}.csv`
         )
         .send(csv);

      } catch (error) {
         console.error(error);
         reply.status(500).send({ error: "Failed to generate CSV" });
      }
   });

}

// routes/upload.js
import multer from "fastify-multer";
import csvParser from "csv-parser";
import fs from "fs";

import UploadLog from "../models/uploadLog.js";
import UploadedData from "../models/uploadedData.js";

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
          await log.update({ status: "success" });
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

  fastify.get("/report/uploaded-data", async (req, reply) => {
    try {
      const { client_id, start_date, end_date } = req.query;

      if (!client_id) {
        return reply.status(400).send({ error: "Client ID is required" });
      }

      const where = { client_id };

      // Optional date filter
      if (start_date && end_date) {
        where.createdAt = {
          [Op.between]: [new Date(start_date), new Date(end_date)],
        };
      } else if (start_date) {
        where.createdAt = { [Op.gte]: new Date(start_date) };
      } else if (end_date) {
        where.createdAt = { [Op.lte]: new Date(end_date) };
      }

      const data = await UploadedData.findAll({
        where,
        order: [["createdAt", "DESC"]],
      });

      return reply.send({ data });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: "Failed to fetch report data" });
    }
  });
}

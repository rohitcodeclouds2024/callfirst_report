// routes/upload.js
import multer from "fastify-multer";
import csvParser from "csv-parser";
import fs from "fs";
import { Op } from "sequelize";
import { sequelize } from '../lib/db.js';

import Revenue from "../models/revenue.js";
import User from "../models/user.js";
import RevenueOffer from "../models/revenueOffer.js";

const include = [
   {
      model: User,
      as: "client", // matches Revenue.belongsTo(User, { as: 'client' })
      attributes: ["id", "name", "email"],
      required: true,
   },
   {
      model: RevenueOffer,
      as: "offers", // matches Revenue.hasMany(RevenueOffer, { as: 'offers' })
      attributes: ["id", "offer_percentage", "start_date", "end_date"],
   },
];

export default async function revenueRoutes(fastify, opts) {

   fastify.post("/revenue", async (req, reply) => {
      try {
         const { client_id, revenue_per_conversion, special_offer, offers } = req.body;

         const existingRevenue = await Revenue.findOne({ where: { client_id } });

         if (existingRevenue) {
            return reply.status(400).send({
               success: false,
               message: "Revenue already exists for this client.",
            });
         }

         const revenue = await Revenue.create({
            client_id,
            revenue_per_conversion,
            special_offer,
         });

         if (special_offer && offers?.length) {
            const offerData = offers.map((offer) => ({
               revenue_id: revenue.id,
               offer_percentage: offer.offer_percentage,
               start_date: offer.start_date,
               end_date: offer.end_date,
            }));
            await RevenueOffer.bulkCreate(offerData);
         }

         reply.send({ success: true, revenue });
      } catch (err) {
         console.error(err);
         reply.status(500).send({ error: "Failed to create revenue" });
      }
   });

   // Get by ID
   fastify.get("/revenue/:id", async (req, reply) => {
      try {
         const revenue = await Revenue.findByPk(req.params.id,{include});
         if (!revenue) return reply.status(404).send({ error: "not_found" });
         return reply.send(revenue);
      } catch (err) {
         fastify.log.error(err);
         return reply.status(500).send({ error: "fetch_failed" });
      }
   });

   // PUT /revenue/:id ->update
   fastify.put("/revenue/:id", async (req, res) => {
      try {
         const id = req.params.id;
         const { client_id, revenue_per_conversion, special_offer, offers } = req.body;

         const revenue = await Revenue.findByPk(id);
         if (!revenue) return res.status(404).send({ error: "Revenue not found" });

         await revenue.update({ client_id, revenue_per_conversion, special_offer });

         // Delete old offers
         await RevenueOffer.destroy({ where: { revenue_id: id } });

         // Add new offers
         if (special_offer && offers?.length) {
            for (const offer of offers) {
               await RevenueOffer.create({
                  revenue_id: id,
                  offer_percentage: offer.offer_percentage,
                  start_date: offer.start_date,
                  end_date: offer.end_date,
               });
            }
         }

         res.send({ success: true, revenue });
      } catch (err) {
         console.error(err);
         res.status(500).send({ error: "Failed to update revenue" });
      }
   });

   fastify.delete("/revenue/:id", async (request, reply) => {
      try {
         const id = Number(request.params.id);

         // Validate ID
         if (!Number.isFinite(id) || id <= 0) {
            return reply.code(400).send({ error: "invalid_id" });
         }

         // Delete revenue record
         const deleted = await Revenue.destroy({ where: { id } });

         // If no record found
         if (!deleted) {
            return reply.code(404).send({ error: "not_found" });
         }

         // Return response
         return reply.code(200).send({ ok: true, id });
      } catch (err) {
         fastify.log.error("Error deleting revenue record:", err);
         return reply.code(500).send({ error: "delete_failed" });
      }
   });

   fastify.post(
      "/revenue/bulk-delete",
      // { preValidation: [fastify.authenticate] }, // uncomment if using auth
      async (request, reply) => {
         try {
            const { ids } = request.body || {};

            // Validate input
            if (!Array.isArray(ids) || ids.length === 0) {
               return reply.code(400).send({ error: "ids must be a non-empty array" });
            }

            // Delete in bulk
            const deletedCount = await Revenue.destroy({
               where: { id: ids },
            });

            return reply.send({
               ok: true,
               deletedCount,
               ids,
            });
         } catch (err) {
            fastify.log.error("Error deleting revenue records:", err);
            return reply.code(500).send({ error: "bulk_delete_failed" });
         }
      }
   );

   // List
   fastify.get(
      "/revenue",
      // { preValidation: [fastify.authenticate] },
      async (request, reply) => {
         try {
            const page = Math.max(1, Number(request.query.page) || 1);
            const perPage = Math.max(1, Math.min(100, Number(request.query.perPage) || 20));
            const keyword = (request.query.keyword || "").trim();

            const offset = (page - 1) * perPage;

            if (keyword) {
               include[0].where = {
                  name: { [Op.like]: `%${keyword}%` },
               };
            }

            const { rows, count } = await Revenue.findAndCountAll({
               where: {},
               include,
               limit: perPage,
               offset,
               order: [["id", "DESC"]],
            });

            return reply.send({
               success: true,
               data: rows,
               meta: {
                  page,
                  perPage,
                  total: count,
                  totalPages: Math.ceil(count / perPage),
               },
            });
         } catch (err) {
            console.log(err);
            fastify.log.error("Error fetching revenue:", err);
            return reply.status(500).send({
               success: false,
               error: "An error occurred while fetching revenue list",
            });
         }
      }
   );


}

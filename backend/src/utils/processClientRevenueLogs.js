import { Op } from "sequelize";
import { LgTracker } from "../models/lgTracker.js";
import { RevenueLog } from "../models/revenueLog.js";
import { getConversionRate } from "./getConversionRate.js";

/**
 * Process revenue logs for a given client in chunks.
 * For each LgTracker entry, fetch conversion rate and update/create RevenueLog.
 *
 * @param {number} clientId - The client ID to process
 * @param {number} chunkSize - Optional. Number of records to process per chunk (default: 100)
 */
export async function processClientRevenueLogs(clientId, chunkSize = 100) {
  try {
    let offset = 0;
    let processedCount = 0;

    while (true) {
      // 1. Fetch a chunk of LgTracker entries for this client
      const trackers = await LgTracker.findAll({
        where: { client_id: clientId },
        order: [["id", "ASC"]],
        offset,
        limit: chunkSize,
      });

      if (trackers.length === 0) break; // no more data

      // 2. Loop through each tracker
      for (const tracker of trackers) {
        const { id: trackerId, date, net_transfer } = tracker;

        // Get conversion rate
        const rate = await getConversionRate(date, clientId);
        if (!rate) {
          console.warn(`No conversion rate found for client ${clientId} on ${date}`);
          continue;
        }

        const totalRevenue = rate * (Number(net_transfer) || 0);

        // 3. Check if RevenueLog already exists
        const existingLog = await RevenueLog.findOne({
          where: { lg_tracker_id: trackerId },
        });

        if (existingLog) {
          // Update existing log
          await existingLog.update({ revenue: totalRevenue });
          console.log(` Updated RevenueLog for tracker ${trackerId}`);
        } else {
          // Create new log
          await RevenueLog.create({
            lg_tracker_id: trackerId,
            revenue: totalRevenue,
          });
          console.log(` Created RevenueLog for tracker ${trackerId}`);
        }

        processedCount++;
      }

      // 4. Move to next chunk
      offset += chunkSize;
    }

    console.log(` Finished processing ${processedCount} records for client ${clientId}`);
  } catch (error) {
    console.error(" Error in processClientRevenueLogs:", error);
    throw error;
  }
}

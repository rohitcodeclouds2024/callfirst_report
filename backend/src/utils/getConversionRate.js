import { Op } from "sequelize";
import { Revenue } from "../models/revenue.js";
import { RevenueOffer } from "../models/revenueOffer.js";

/**
 * Get conversion rate for a client on a specific date.
 *
 * @param {string|Date} date - The date to check (YYYY-MM-DD or Date object)
 * @param {number} clientId - The client ID
 * @returns {Promise<number|null>} - Final conversion rate or null if not found
 */
export async function getConversionRate(date, clientId) {
  try {
    const formattedDate = new Date(date);

    // 1. Get revenue info for client
    const revenue = await Revenue.findOne({
      where: { client_id: clientId },
      include: [
        {
          model: RevenueOffer,
          as: "offers",
          where: {
            start_date: { [Op.lte]: formattedDate },
            end_date: { [Op.gte]: formattedDate },
          },
          required: false, // in case no offers exist
        },
      ],
    });

    if (!revenue) return null;

    let conversionRate = revenue.revenue_per_conversion;

    // 2. If offer exists, apply offer percentage
    const activeOffer = revenue.offers?.[0];
    if (activeOffer && activeOffer.offer_rate) {
      conversionRate = activeOffer.offer_rate;
    }

    return conversionRate;
  } catch (error) {
    console.error("Error in getConversionRate:", error);
    throw error;
  }
}

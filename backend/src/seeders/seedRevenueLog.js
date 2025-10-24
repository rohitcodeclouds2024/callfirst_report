import { sequelize } from '../lib/db.js';
import LgTracker from '../models/lgTracker.js';
import RevenueLog from '../models/revenueLog.js';

export async function seedRevenueLog() {
  console.log("Starting RevenueLog seeding...");

  try {
    // Ensure models are synced
    await sequelize.sync();

    // Fetch all LgTracker records
    const trackers = await LgTracker.findAll({
      attributes: ["id", "net_transfer"],
    });

    if (trackers.length === 0) {
      console.log("No LgTracker records found. Exiting.");
      return;
    }

    // Prepare RevenueLog data
    const logs = trackers.map((tracker) => ({
      lg_tracker_id: tracker.id,
      revenue: tracker.net_transfer * 10,
      created_at: new Date(),
    }));

    console.log(`Inserting ${logs.length} RevenueLog records...`);

    // Bulk create, ignore duplicates
    await RevenueLog.bulkCreate(logs, { ignoreDuplicates: true });

    console.log("RevenueLog table seeded successfully!");
  } catch (error) {
    console.error(" Error seeding RevenueLog:", error);
  } finally {
    await sequelize.close();
  }
}

// Run directly if executed as standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRevenueLog();
}

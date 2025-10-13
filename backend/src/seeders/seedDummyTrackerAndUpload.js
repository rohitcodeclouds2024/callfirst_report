import { sequelize } from '../lib/db.js';
import LgTracker from '../models/lgTracker.js';
import UploadedData from "../models/uploadedData.js";

// Utility to get random integer between min and max
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate random status
const randomStatus = () => {
  const statuses = ["success", "failed", "processing"];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Generate random phone number
const randomPhone = () => {
  return "9" + Math.floor(100000000 + Math.random() * 900000000);
};

export async function seedDummyTrackerAndUpload() {
  try {
    const startDate = new Date("2023-01-01");
    const endDate = new Date("2025-10-10");

    const trackers = [];

    // Create LgTracker dummy data
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const no_of_dials = randomInt(150, 300);

      const no_of_contacts = randomInt(100, no_of_dials);

      const gross_transfer = randomInt(70, no_of_contacts);

      const net_transfer = randomInt(10, gross_transfer);

      trackers.push({
        client_id: randomInt(1, 10),
        no_of_dials,
        no_of_contacts,
        gross_transfer,
        net_transfer,
        date: d.toISOString().split("T")[0],
        file_name: `file_${Date.now()}.csv`,
        count: randomInt(5, 50),
        status: randomStatus(),
      });
    }

    const insertedTrackers = await LgTracker.bulkCreate(trackers);
    console.log(`✅ Inserted ${insertedTrackers.length} LgTracker records`);

    // Create UploadedData for some trackers
    const uploads = insertedTrackers
      .filter(() => Math.random() > 0.3) // ~70% trackers have uploads
      .map((tracker) => {
        const numberOfRows = randomInt(1, 10);
        const rows = [];
        for (let i = 0; i < numberOfRows; i++) {
          rows.push({
            client_id: tracker.client_id,
            lg_tracker_id: tracker.id,
            customer_name: `Customer ${i + 1}`,
            phone_number: randomPhone(),
            status: ["pending", "completed", "failed"][Math.floor(Math.random() * 3)],
          });
        }
        return rows;
      })
      .flat();

    await UploadedData.bulkCreate(uploads);
    console.log(`✅ Inserted ${uploads.length} UploadedData records`);
  } catch (err) {
    console.error("❌ Seeder failed:", err);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDummyTrackerAndUpload();
}
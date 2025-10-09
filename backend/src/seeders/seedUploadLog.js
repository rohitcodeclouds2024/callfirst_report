import { sequelize } from '../lib/db.js';
import UploadLog from "../models/uploadLog.js";

export async function seedUploadLog() {
  console.log("🚀 Starting UploadLog seeding...");

  const startDate = new Date("2023-01-01");
  const endDate = new Date("2025-10-02");

  const statuses = ["completed", "pending", "failed"];
  const clients = [1, 2, 3, 4]; // sample client IDs
  const data = [];

  // Generate date range
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // For each date, generate 1–3 random uploads per client
    for (const clientId of clients) {
      const uploadsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < uploadsPerDay; i++) {
        const fileIndex = Math.floor(Math.random() * 1000);
        const fileName = `upload_${clientId}_${fileIndex}.csv`;

        data.push({
          client_id: clientId,
          file_name: fileName,
          count: Math.floor(Math.random() * 500) + 50,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          date: new Date(d).toISOString().split("T")[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }

  try {
    await sequelize.sync();
    console.log(`📦 Inserting ${data.length} records into upload_log...`);
    await UploadLog.bulkCreate(data, { ignoreDuplicates: true });
    console.log("✅ UploadLog table seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding UploadLog:", error);
  } finally {
    await sequelize.close();
  }
}

// Run directly when executed standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUploadLog();
}

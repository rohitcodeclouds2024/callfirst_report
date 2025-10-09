import { sequelize } from '../lib/db.js';
import LgTracker from '../models/lgTracker.js';

export async function seedLgTracker() {
  console.log("Starting LgTracker seeding...");

  // Define start and end dates
  const startDate = new Date("2023-01-01");
  const endDate = new Date("2025-10-02");

  const data = [];
  const clients = [1, 2, 3]; // example client IDs
  const campaignNames = ["Winter Campaign", "Spring Sale", "Summer Push", "Autumn Blast"];

  // Generate date range
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Random values for demo data
    const client_id = clients[Math.floor(Math.random() * clients.length)];
    const campaign_name = campaignNames[Math.floor(Math.random() * campaignNames.length)];
    const no_of_dials = Math.floor(Math.random() * 200) + 50;
    const no_of_contacts = Math.floor(no_of_dials * (Math.random() * 0.8));
    const gross_transfer = Math.floor(no_of_contacts * (Math.random() * 0.7));
    const net_transfer = Math.floor(gross_transfer * (Math.random() * 0.9));

    data.push({
      client_id,
      campaign_name,
      no_of_dials,
      no_of_contacts,
      gross_transfer,
      net_transfer,
      date: new Date(d).toISOString().split("T")[0],
      created_at: new Date(),
    });
  }

  try {
    await sequelize.sync(); // ensure model is ready
    console.log(`Inserting ${data.length} records...`);
    await LgTracker.bulkCreate(data, { ignoreDuplicates: true });
    console.log("✅ LgTracker table seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding LgTracker:", error);
  } finally {
    await sequelize.close();
  }
}

// Run directly if executed as standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  seedLgTracker();
}

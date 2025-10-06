"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { notify } from "../../../components/Toaster";

export default function TrackerForm() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    campaign_name: "",
    no_of_dials: 0,
    no_of_contacts: 0,
    gross_transfer: 0,
    net_transfer: 0,
    date: today,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "campaign_name" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation before API call
    if (!formData.campaign_name) {
      notify("Campaign Name is required", "error");
      return;
    }
    if (!formData.no_of_dials) {
      notify("Campaign Name is required", "error");
      return;
    }
    if (!formData.no_of_contacts) {
      notify("No of Contacts is required", "error");
      return;
    }
    if (!formData.gross_transfer) {
      notify("Campaign Name is required", "error");
      return;
    }
    if (!formData.net_transfer) {
      notify("Net Transfer is required", "error");
      return;
    }
    if (!formData.date) {
      notify("Date is required", "error");
      return;
    }

    try {
      await apiClient.post("/tracker", formData);
      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Failed to submit tracker", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">📊 Tracker Form</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Campaign Name</label>
          <input
            type="text"
            name="campaign_name"
            value={formData.campaign_name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">No of Dials</label>
          <input
            type="number"
            name="no_of_dials"
            value={formData.no_of_dials}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            min="0"
          />
        </div>

        <div>
          <label className="block font-medium">No of Contacts</label>
          <input
            type="number"
            name="no_of_contacts"
            value={formData.no_of_contacts}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            min="0"
          />
        </div>

        <div>
          <label className="block font-medium">Gross Transfer</label>
          <input
            type="number"
            name="gross_transfer"
            value={formData.gross_transfer}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            min="0"
          />
        </div>

        <div>
          <label className="block font-medium">Net Transfer</label>
          <input
            type="number"
            name="net_transfer"
            value={formData.net_transfer}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            min="0"
          />
        </div>

        <div>
          <label className="block font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Tracker
        </button>
      </form>
    </div>
  );
}

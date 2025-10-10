"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { notify } from "../../../components/Toaster";
import Card from "@/components/ui/card/Card";

interface User {
  id: number;
  email: string;
  contact_number: string;
}

export default function TrackerForm() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [clientList, setClientList] = useState([]);

  const [formData, setFormData] = useState({
    client_id: 0,
    campaign_name: "",
    no_of_dials: 0,
    no_of_contacts: 0,
    gross_transfer: 0,
    net_transfer: 0,
    date: today,
  });

  useEffect(() => {
    const fetchClientList = async (page, searchTerm) => {
      try {
        const { data } = await apiClient.get<{
          data: User[];
        }>("/clients", {
          params: { page, keyword: searchTerm },
        });

        setClientList(data.data || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchClientList(1, "");
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // console.log(name, value);

    setFormData((prev) => ({
      ...prev,
      [name]: name === "campaign_name" ? value : Number(value),
    }));
  };

  // console.log(formData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation before API call
    if (!formData.client_id) {
      notify("Client Name is required", "error");
      return;
    }
    // if (!formData.campaign_name) {
    //   notify("Campaign Name is required", "error");
    //   return;
    // }
    // if (!formData.no_of_dials) {
    //   notify("Campaign Name is required", "error");
    //   return;
    // }
    // if (!formData.no_of_contacts) {
    //   notify("No of Contacts is required", "error");
    //   return;
    // }
    // if (!formData.gross_transfer) {
    //   notify("Campaign Name is required", "error");
    //   return;
    // }
    // if (!formData.net_transfer) {
    //   notify("Net Transfer is required", "error");
    //   return;
    // }
    if (!formData.date) {
      notify("Date is required", "error");
      return;
    }

    try {
      await apiClient.post("/tracker", formData);
      router.push("/admin/reports/tracker");
    } catch (err) {
      console.error("Failed to submit tracker", err);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="tracker-form-wrapper">
      <h3 className="text-2xl font-semibold mb-4">Tracker Form</h3>
      <Card>
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
          <div className="col-span-6">
            <label className="block text-sm font-medium mb-2">
              Client Name
            </label>
            <select
              className="w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary"
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
            >
              <option value="">Select Client</option>
              {clientList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-6">
            <label className="block text-sm font-medium mb-2">
              No of Dials
            </label>
            <input
              type="number"
              name="no_of_dials"
              value={formData.no_of_dials}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary"
              min="0"
            />
          </div>
          <div className="col-span-6">
            <label className="block text-sm font-medium mb-2">
              No of Contacts
            </label>
            <input
              type="number"
              name="no_of_contacts"
              value={formData.no_of_contacts}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary"
              min="0"
            />
          </div>
          <div className="col-span-6">
            <label className="block text-sm font-medium mb-2">
              Gross Transfer
            </label>
            <input
              type="number"
              name="gross_transfer"
              value={formData.gross_transfer}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary"
              min="0"
            />
          </div>
          <div className="col-span-6">
            <label className="block text-sm font-medium mb-2">
              Net Transfer
            </label>
            <input
              type="number"
              name="net_transfer"
              value={formData.net_transfer}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary"
              min="0"
            />
          </div>
          <div className="col-span-6">
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div className="col-span-12 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white border border-primary rounded-md hover:text-primary hover:bg-transparent transition-all duration-300"
            >
              Save Tracker
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

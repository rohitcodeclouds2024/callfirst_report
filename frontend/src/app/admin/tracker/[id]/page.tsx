"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { toast } from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  email: string;
  contact_number: string;
}

export default function TrackerAndUploadPage() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [clientList, setClientList] = useState<User[]>([]);
  const params = useParams(); // Get route params
  const lg_tracker_id = Number(params.id);

  // --- Tracker Form State ---
  const [trackerForm, setTrackerForm] = useState({
    client_id: "",
    no_of_dials: "",
    no_of_contacts: "",
    gross_transfer: "",
    net_transfer: "",
    date: today,
    lg_tracker_id: lg_tracker_id,
  });

  // --- Upload Form State ---
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // --- Fetch Clients ---
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await apiClient.get<{ data: User[] }>("/clients", {
          params: { keyword: "" },
        });
        setClientList(data.data || []);
      } catch (err) {
        console.error("Failed to fetch clients", err);
        toast.error("Failed to load clients");
      }
    };
    const fetchTrackerDetails = async () => {
      if (lg_tracker_id === 0) {
        return;
      }
      try {
        const res = await apiClient.post(`/report/tracker/uploaded-data`, {
          lg_tracker_id: lg_tracker_id,
        });

        const lgResponse = res.data.lgData;

        setTrackerForm((prevState) => ({
          ...prevState, // keep all previous values
          client_id: lgResponse.client_id,
          no_of_dials: lgResponse.no_of_dials,
          no_of_contacts: lgResponse.no_of_contacts,
          gross_transfer: lgResponse.gross_transfer,
          net_transfer: lgResponse.net_transfer,
          date: lgResponse.date,
        }));
      } catch (err) {
        // toast.error("Failed to fetch report");
      } finally {
        // setLoading(false);
      }
    };
    fetchClients();
    fetchTrackerDetails();
  }, []);

  // --- Tracker Form Change Handler ---
  const handleTrackerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTrackerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumeriChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setTrackerForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTrackerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      client_id,
      date,
      no_of_dials,
      no_of_contacts,
      gross_transfer,
      net_transfer,
    } = trackerForm;

    // --- Validation Rules ---
    const validations = [
      { valid: !!client_id, message: "Client Name is required" },
      { valid: !!date, message: "Date is required" },
      { valid: !!no_of_dials, message: "No of Dials is required" },
      {
        valid: no_of_contacts <= no_of_dials,
        message: "No of Contacts cannot be greater than No of Dials",
      },
      {
        valid: gross_transfer <= no_of_contacts,
        message: "Gross Transfer cannot be greater than No of Contacts",
      },
      {
        valid: net_transfer <= gross_transfer,
        message: "Net Transfer cannot be greater than Gross Transfer",
      },
      { valid: !!uploadFile, message: "File is required" },
    ];

    // --- Run validations ---
    for (const { valid, message } of validations) {
      console.log(valid);
      if (!valid) {
        toast.error(message);
        return;
      }
    }

    try {
      const formData = new FormData();

      // Append tracker fields
      Object.entries(trackerForm).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      // Append upload file if provided
      if (uploadFile) {
        formData.append("file", uploadFile);
      }

      // --- API Request ---
      await apiClient.post("/tracker/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Tracker and file saved successfully!");
      router.push("/admin/reports/tracker");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save tracker or upload file");
    }
  };

  return (
    <div className="tracker-upload-page space-y-12">
      {/* Tracker Form Section */}
      <div className="tracker-form-section">
        <h3 className="text-2xl font-semibold mb-4">Tracker Form</h3>
        <Card>
          <form
            onSubmit={handleTrackerSubmit}
            className="grid grid-cols-12 gap-4 sm:gap-6"
          >
            <div className="col-span-12 sm:col-span-6">
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={trackerForm.date}
                onChange={handleTrackerChange}
                className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <label className="block text-sm font-medium mb-2">
                Client Name
              </label>
              <select
                name="client_id"
                value={trackerForm.client_id}
                onChange={handleTrackerChange}
                className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
              >
                <option value="">Select Client</option>
                {clientList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-12 sm:col-span-6">
              <label className="block text-sm font-medium mb-2">
                No of Dials
              </label>
              <input
                type="text"
                name="no_of_dials"
                value={trackerForm.no_of_dials}
                onChange={handleNumeriChange}
                className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
                min="0"
              />
            </div>

            <div className="col-span-12 sm:col-span-6">
              <label className="block text-sm font-medium mb-2">
                No of Contacts
              </label>
              <input
                type="text"
                name="no_of_contacts"
                value={trackerForm.no_of_contacts}
                onChange={handleNumeriChange}
                className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
                min="0"
              />
            </div>

            <div className="col-span-12 sm:col-span-6">
              <label className="block text-sm font-medium mb-2">
                Gross Transfer
              </label>
              <input
                type="text"
                name="gross_transfer"
                value={trackerForm.gross_transfer}
                onChange={handleNumeriChange}
                className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
                min="0"
              />
            </div>

            <div className="col-span-12 sm:col-span-6">
              <label className="block text-sm font-medium mb-2">
                Net Transfer
              </label>
              <input
                type="text"
                name="net_transfer"
                value={trackerForm.net_transfer}
                onChange={handleNumeriChange}
                className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
                min="0"
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <label className="block text-sm font-medium mb-2">
                Upload File
              </label>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full bg-white dark:bg-background px-4 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
              />
            </div>

            <div className="col-span-12 flex justify-between items-center gap-4">
              <Link
                href="http://localhost:5010/upload/sample"
                className="inline-block font-medium text-primary underline"
              >
                Download Sample File
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white border border-primary rounded-md hover:text-primary hover:bg-transparent transition-all duration-300"
              >
                Save
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

"use client";
import { apiClient } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface User {
  id: number;
  email: string;
  contact_number: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [client, setClient] = useState("");
  const [clientList, setClientList] = useState([]);
  const router = useRouter();

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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !client) {
      toast.error("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("client_id", client);

    try {
      const res = await apiClient.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // explicitly tell axios
        },
      });

      toast.success("File uploaded successfully!");
      router.push("/admin/dashboard");
    } catch {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Upload CSV</h1>
      <form onSubmit={handleUpload} className="space-y-4">
        {/* Client dropdown */}
        <select
          className="border p-2 w-full"
          value={client}
          onChange={(e) => setClient(e.target.value)}
        >
          <option value="">Select Client</option>
          {clientList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* File upload */}
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 w-full"
        />

        <div className="flex gap-4">
          <a
            href="http://localhost:5010/upload/sample"
            className="text-blue-500 underline"
          >
            Download Sample
          </a>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Upload
          </button>
        </div>
      </form>
    </div>
  );
}

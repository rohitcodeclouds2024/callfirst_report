"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [client, setClient] = useState("");

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
      const res = await fetch("http://localhost:5010/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("File uploaded successfully!");
        window.location.href = "/admin/dashboard";
      } else {
        toast.error("Upload failed!");
      }
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
          <option value="1">Client 1</option>
          <option value="2">Client 2</option>
          <option value="3">Client 3</option>
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

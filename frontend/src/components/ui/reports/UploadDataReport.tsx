import { apiClient } from "@/lib/axios";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface UploadedData {
  id: number;
  customer_name: string;
  phone_number: string;
  status: string;
  createdAt: string;
}

export default function UploadDataReport({ clientList }) {
  const [clientId, setClientId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<UploadedData[]>([]);
  const [loading, setLoading] = useState(false);
  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error("Please select a client");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        client_id: clientId,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      });

      const res = await apiClient.get(`/report/uploaded-data?${params}`);
      setData(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="uploaded_data_report mb-12">
      <h1 className="text-xl font-bold mb-4">📊 Uploaded Data Report</h1>

      <form onSubmit={handleFetch} className="grid grid-cols-4 gap-4 mb-6">
        <select
          className="border p-2 rounded"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="">Select Client</option>
          {clientList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch Report"}
        </button>
      </form>

      {data.length > 0 ? (
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Customer Name</th>
              <th className="p-2 border">Phone Number</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={item.id} className="text-center">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{item.customer_name}</td>
                <td className="border p-2">{item.phone_number}</td>
                <td className="border p-2">{item.status}</td>
                <td className="border p-2">
                  {new Date(item.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-sm mt-4">
          {loading ? "" : "No data found."}
        </p>
      )}
    </div>
  );
}

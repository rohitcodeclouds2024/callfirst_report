import { apiClient } from "@/lib/axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Card from "../card/Card";

interface UploadedData {
  id: number;
  customer_name: string;
  phone_number: string;
  status: string;
  createdAt: string;
}

export default function TrackerUploadReport({ clientList, clientIdFromUrl }) {
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

      const res = await apiClient.get(
        `/report/tracker/uploaded-data?${clientId}`
      );
      setData(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="uploaded_data_report mb-12">
      <h3 className="text-2xl font-semibold mb-4">Uploaded Data Report</h3>
      <Card className="mb-6">
        <form onSubmit={handleFetch} className="grid grid-cols-12 gap-6">
          <select
            className="col-span-3 w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary"
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
            className="col-span-3 w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="col-span-3 w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            type="submit"
            className="col-span-3 px-4 py-2 bg-primary text-white border border-primary rounded-md hover:text-primary hover:bg-transparent transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Loading..." : "Fetch Report"}
          </button>
        </form>
      </Card>
      {data.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full text-sm text-left">
            <thead className="uppercase">
              <tr>
                <th className="p-4 bg-white">#</th>
                <th className="p-4 bg-white">Customer Name</th>
                <th className="p-4 bg-white">Phone Number</th>
                <th className="p-4 bg-white">Status</th>
                <th className="p-4 bg-white">Created At</th>
              </tr>
            </thead>
            <tbody className="text-gray-500">
              {data.map((item, i) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 bg-white border-t border-border">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 bg-white border-t border-border">
                    {item.customer_name}
                  </td>
                  <td className="px-4 py-3 bg-white border-t border-border">
                    {item.phone_number}
                  </td>
                  <td className="px-4 py-3 bg-white border-t border-border">
                    {item.status}
                  </td>
                  <td className="px-4 py-3 bg-white border-t border-border">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-sm mt-4">
          {loading ? "" : "No data found."}
        </p>
      )}
    </div>
  );
}

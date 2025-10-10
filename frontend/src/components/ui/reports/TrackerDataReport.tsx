import { apiClient } from "@/lib/axios";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface TrackerData {
  id: number;
  campaign_name: string;
  no_of_dials: number;
  no_of_contacts: number;
  gross_transfer: number;
  net_transfer: number;
  date: string;
}

export default function TrackerDataReport({ clientList }) {
  const [trackerClient, setTrackerClient] = useState("");
  const [trackerStart, setTrackerStart] = useState("");
  const [trackerEnd, setTrackerEnd] = useState("");
  const [trackerData, setTrackerData] = useState<TrackerData[]>([]);
  const [trackerLoading, setTrackerLoading] = useState(false);

  const handleTrackerFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackerClient) {
      toast.error("Please select a client");
      return;
    }

    try {
      setTrackerLoading(true);
      const params = new URLSearchParams({
        client_id: trackerClient,
        ...(trackerStart && { start_date: trackerStart }),
        ...(trackerEnd && { end_date: trackerEnd }),
      });

      const res = await apiClient.get(`/report/tracker-data?${params}`);
      setTrackerData(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch tracker report");
    } finally {
      setTrackerLoading(false);
    }
  };

  return (
    <div className="tracker_data_report">
      <h1 className="text-xl font-bold mb-4">📈 Tracker Data Report</h1>

      <form
        onSubmit={handleTrackerFetch}
        className="grid grid-cols-4 gap-4 mb-6"
      >
        <select
          className="border p-2 rounded"
          value={trackerClient}
          onChange={(e) => setTrackerClient(e.target.value)}
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
          value={trackerStart}
          onChange={(e) => setTrackerStart(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={trackerEnd}
          onChange={(e) => setTrackerEnd(e.target.value)}
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={trackerLoading}
        >
          {trackerLoading ? "Loading..." : "Fetch Tracker"}
        </button>
      </form>

      {trackerData.length > 0 ? (
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">#</th>
              {/* <th className="p-2 border">Campaign Name</th> */}
              <th className="p-2 border">No. of Dials</th>
              <th className="p-2 border">No. of Contacts</th>
              <th className="p-2 border">Gross Transfer</th>
              <th className="p-2 border">Net Transfer</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Conv %</th>
            </tr>
          </thead>
          <tbody>
            {trackerData.map((item, i) => (
              <tr key={item.id} className="text-center">
                <td className="border p-2">{i + 1}</td>
                {/* <td className="border p-2">{item.campaign_name}</td> */}
                <td className="border p-2">{item.no_of_dials}</td>
                <td className="border p-2">{item.no_of_contacts}</td>
                <td className="border p-2">{item.gross_transfer}</td>
                <td className="border p-2">{item.net_transfer}</td>
                <td className="border p-2">
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td>
                  {item.no_of_contacts
                    ? `${(
                        (100 * item.gross_transfer) /
                        item.no_of_contacts
                      ).toFixed(2)}`
                    : "0.00"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-sm mt-4">
          {trackerLoading ? "" : "No data found."}
        </p>
      )}
    </div>
  );
}

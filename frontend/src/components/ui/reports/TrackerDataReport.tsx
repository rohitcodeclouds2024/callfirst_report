import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Card from "../card/Card";
import { FaEye } from "react-icons/fa";

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
  const router = useRouter();
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

  const redirectUploadRedirect = (id) => {
    router.push(`/admin/reports/tracker/upload/${id}`);
  };

  return (
    <>
      <h3 className="text-2xl font-semibold mb-4">Tracker Data Report</h3>
      <Card className="mb-6">
        <form
          onSubmit={handleTrackerFetch}
          className="grid grid-col-12 sm:grid-cols-4 gap-2 sm:gap-4 lg:gap-6"
        >
          <select
            className="w-full px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
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
            className="w-full px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
            value={trackerStart}
            onChange={(e) => setTrackerStart(e.target.value)}
          />
          <input
            type="date"
            className="w-full px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
            value={trackerEnd}
            onChange={(e) => setTrackerEnd(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white border border-primary rounded-md hover:text-primary hover:bg-transparent transition-all duration-300"
            disabled={trackerLoading}
          >
            {trackerLoading ? "Loading..." : "Fetch Tracker"}
          </button>
        </form>
      </Card>
      {trackerData.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full text-sm text-left">
            <thead className="uppercase">
              <tr>
                <th className="p-4 bg-white">#</th>
                <th className="p-4 bg-white">No. of Dials</th>
                <th className="p-4 bg-white">No. of Contacts</th>
                <th className="p-4 bg-white">Gross Transfer</th>
                <th className="p-4 bg-white">Net Transfer</th>
                <th className="p-4 bg-white">Date</th>
                <th className="p-4 bg-white">Conv %</th>
                <th className="p-4 bg-white">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-500">
              {trackerData.map((item, i) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 bg-white border-t border-border">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 bg-white border-t border-border">
                    {item.no_of_dials}
                  </td>
                  <td className="px-4 py-3 bg-white border-t border-border">
                    {item.no_of_contacts}
                  </td>
                  <td className="px-4 py-3 bg-white border-t border-border">
                    {item.gross_transfer}
                  </td>
                  <td className="px-4 py-3 bg-white border-t border-border">
                    {item.net_transfer}
                  </td>
                  <td className="px-4 py-3 bg-white border-t border-border">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 bg-white border-t border-border">
                    {item.no_of_contacts
                      ? `${(
                          (100 * item.gross_transfer) /
                          item.no_of_contacts
                        ).toFixed(2)}`
                      : "0.00"}
                  </td>
                  <td className="border p-2">
                    <span onClick={() => redirectUploadRedirect(item.id)}>
                      <FaEye />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-sm mt-4">
          {trackerLoading ? "" : "No data found."}
        </p>
      )}
    </>
  );
}

import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Card from "../card/Card";
import { FaEye } from "react-icons/fa";
import Pagination from "@/components/form/Pagination";
import { TrackerData } from "@/types/trackerData";

export default function TrackerDataReport({ clientList }) {
  const router = useRouter();
  const [trackerClient, setTrackerClient] = useState<number | "">("");
  const [trackerStart, setTrackerStart] = useState("");
  const [trackerEnd, setTrackerEnd] = useState("");
  const [trackerData, setTrackerData] = useState<TrackerData[]>([]);
  const [trackerLoading, setTrackerLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [appliedClientId, setAppliedClientId] = useState<number | "">("");

  const handleTrackerFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackerClient) {
      toast.error("Please select a client");
      return;
    }
    setAppliedClientId(trackerClient);
  };

  const getTrackerData = async () => {
    try {
      setTrackerLoading(true);

      const body = {
        client_id: trackerClient,
        ...(trackerStart && { start_date: trackerStart }),
        ...(trackerEnd && { end_date: trackerEnd }),
        page: currentPage,
        perPage: 20,
      };
      const res = await apiClient.post(`/report/tracker-data`, body);
      setTrackerData(res.data.data || []);
      setTotalPages(res.data.meta.totalPages || 0);
      setTotal(res.data.meta.total || 0);
    } catch (err) {
      toast.error("Failed to fetch tracker report");
    } finally {
      setTrackerLoading(false);
    }
  };

  useEffect(() => {
    if (clientList.length > 0 && trackerClient === "") {
      const firstValidClient = clientList.find(
        (client) => client.id !== 0 && client.id !== null
      );
      if (firstValidClient) {
        setTrackerClient(firstValidClient.id);
        setAppliedClientId(firstValidClient.id);
      }
    }
  }, [clientList, trackerClient]);

  useEffect(() => {
    if (trackerClient !== "") {
      getTrackerData();
    }
  }, [currentPage, appliedClientId]);

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
            onChange={(e) => setTrackerClient(Number(e.target.value) || "")}
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
                  <td className="px-4 py-3 bg-white border-t border-border">
                    <span onClick={() => redirectUploadRedirect(item.id)}>
                      <FaEye />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!trackerLoading && trackerData.length > 0 && (
            <Pagination
              total={total}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-sm mt-4">
          {trackerLoading ? "" : "No data found."}
        </p>
      )}
    </>
  );
}

import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Card from "../card/Card";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Pagination from "@/components/form/Pagination";
import { TrackerData } from "@/types/trackerData";
import MySwal from "@/lib/swal";

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
  const [appliedtrackerStart, setAppliedTrackerStart] = useState("");
  const [appliedtrackerEnd, setAppliedTrackerEnd] = useState("");

  const handleTrackerFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackerClient) {
      toast.error("Please select a client");
      return;
    }
    setAppliedClientId(trackerClient);
    setAppliedTrackerStart(trackerStart);
    setAppliedTrackerEnd(trackerEnd);
  };

  const getTrackerData = async () => {
    try {
      setTrackerLoading(true);

      const body = {
        client_id: trackerClient,
        ...(appliedtrackerStart && { start_date: appliedtrackerStart }),
        ...(appliedtrackerEnd && { end_date: appliedtrackerEnd }),
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
  }, [currentPage, appliedClientId, appliedtrackerStart, appliedtrackerEnd]);

  const redirectUploadShow = (id: number) => {
    router.push(`/admin/reports/tracker/upload/${id}`);
  };

  const redirectUploadEdit = (id: number) => {
    router.push(`/admin/tracker/${id}`);
  };

  const handleDeleteOperation = async (id: number) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(`/tracker/${id}`);

      // update state
      setTrackerData((prev) => prev.filter((u) => u.id !== id));

      MySwal.fire("Deleted!", "Tracker Record has been deleted.", "success");
    } catch (err: any) {
      console.error("Failed to delete user", err.response?.data || err.message);
      MySwal.fire(
        "Error!",
        err.response?.data?.error || "Something went wrong.",
        "error"
      );
    }
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
            className="w-full px-4 py-3 bg-white dark:bg-background text-sm border border-border rounded-md focus:outline-none focus:border-primary"
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
            className="w-full px-4 py-3 bg-white dark:bg-background text-sm border border-border rounded-md focus:outline-none focus:border-primary"
            value={trackerStart}
            onChange={(e) => setTrackerStart(e.target.value)}
          />
          <input
            type="date"
            className="w-full px-4 py-3 bg-white dark:bg-background text-sm border border-border rounded-md focus:outline-none focus:border-primary"
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
                <th className="p-4 bg-surface">#</th>
                <th className="p-4 bg-surface">Date</th>
                <th className="p-4 bg-surface">No. of Dials</th>
                <th className="p-4 bg-surface">No. of Contacts</th>
                <th className="p-4 bg-surface">Gross Transfer</th>
                <th className="p-4 bg-surface">Net Transfer</th>
                <th className="p-4 bg-surface">Conv %</th>
                <th className="p-4 bg-surface">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-500 dark:text-gray-300">
              {trackerData.map((item, i) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {item.no_of_dials}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {item.no_of_contacts}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {item.gross_transfer}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {item.net_transfer}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {item.no_of_contacts
                      ? `${(
                          (100 * item.gross_transfer) /
                          item.no_of_contacts
                        ).toFixed(2)}`
                      : "0.00"}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => redirectUploadShow(item.id)}
                        className="p-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-100 transition-all duration-300"
                      >
                        <FaEye size={14} className="block" />
                      </button>
                      <button
                        onClick={() => redirectUploadEdit(item.id)}
                        className="p-2 text-green-500 border border-green-500 rounded hover:bg-green-100 transition-all duration-300"
                      >
                        <FaEdit size={14} className="block" />
                      </button>
                      <button
                        onClick={() => handleDeleteOperation(item.id)}
                        className="p-2 text-red-500 border border-red-500 rounded hover:bg-red-100 transition-all duration-300"
                      >
                        <FaTrash size={14} className="block" />
                      </button>
                    </div>
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

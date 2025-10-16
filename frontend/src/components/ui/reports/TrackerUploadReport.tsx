import { apiClient } from "@/lib/axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Pagination from "@/components/form/Pagination";
import { TrackerData } from "@/types/trackerData";
import { FaPhoneAlt, FaDownload } from "react-icons/fa";

interface UploadedData {
  id: number;
  customer_name: string;
  phone_number: string;
  status: string;
  createdAt: string;
}

export default function TrackerUploadReport({ clientList, clientIdFromUrl }) {
  const [data, setData] = useState<UploadedData[]>([]);
  const [lgData, setLgData] = useState<TrackerData>();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const handleFetch = async () => {
    if (!clientIdFromUrl) {
      toast.error("Please select a client");
      return;
    }

    try {
      setLoading(true);

      const res = await apiClient.post(`/report/tracker/uploaded-data`, {
        lg_tracker_id: clientIdFromUrl,
        page: currentPage, // pagination
        perPage: 20, // you can make this dynamic if needed
      });

      const lgResponse = res.data.lgData;

      setLgData({
        id: lgResponse.id,
        client_name: lgResponse.client?.name || "", // extract nested client name
        no_of_dials: lgResponse.no_of_dials,
        no_of_contacts: lgResponse.no_of_contacts,
        gross_transfer: lgResponse.gross_transfer,
        net_transfer: lgResponse.net_transfer,
        date: lgResponse.date,
      });

      setData(res.data.data || []);
      setTotalPages(res.data.meta.totalPages || 0);
      setTotal(res.data.meta.total || 0);
    } catch (err) {
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    handleFetch();
  }, [currentPage]);

  const handleUploadDownload = () => {
    const queryList = new URLSearchParams({
      lg_tracker_id: clientIdFromUrl.toString(),
    }).toString();

    window.open(
      `${process.env.NEXT_PUBLIC_ADMIN_BASE_URL}/tracker/uploaded-data-download?${queryList}`,
      "_blank"
    );
  };

  return (
    <div className="uploaded_data_report mb-12">
      <h3 className="text-2xl font-semibold mb-4">Uploaded Data Report</h3>
      {/* Display LgTracker summary */}
      {lgData && (
        <div className="mb-4 p-4 bg-surface rounded shadow-sm grid grid-cols-6 gap-4 text-sm">
          <div>
            <strong>Client Name:</strong> {lgData.client_name}
          </div>
          <div>
            <strong>No of Dials:</strong> {lgData.no_of_dials}
          </div>
          <div>
            <strong>No of Contacts:</strong> {lgData.no_of_contacts}
          </div>
          <div>
            <strong>Gross Transfer:</strong> {lgData.gross_transfer}
          </div>
          <div>
            <strong>Net Transfer:</strong> {lgData.net_transfer}
          </div>
          <div>
            <strong>Date:</strong> {lgData.date}
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-primary text-white border border-primary rounded-md hover:text-primary hover:bg-transparent transition-all duration-300"
            onClick={handleUploadDownload}
          >
            <FaDownload />
            {"Download"}
          </button>
        </div>
      )}

      {data.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full text-sm text-left">
            <thead className="uppercase">
              <tr>
                <th className="p-4 bg-surface">#</th>
                <th className="p-4 bg-surface">Customer Name</th>
                <th className="p-4 bg-surface">Phone Number</th>
                <th className="p-4 bg-surface">Status</th>
                <th className="p-4 bg-surface">Created At</th>
              </tr>
            </thead>
            <tbody className="text-gray-500 dark:text-gray-300">
              {data.map((item, i) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {item.customer_name}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    <p className="flex items-center gap-2">
                      <FaPhoneAlt size={14} className="block text-primary" />
                      <span className="block">{item.phone_number}</span>
                    </p>
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    <span
                      className={`inline-block text-sm leading-none font-medium px-2 py-1 rounded-xl border ${
                        item.status === "Inactive"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-700"
                          : item.status === "Active"
                          ? "bg-green-100 text-green-700 border-green-700"
                          : ""
                      }`.trim()}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && data.length > 0 && (
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
          {loading ? "" : "No data found."}
        </p>
      )}
    </div>
  );
}

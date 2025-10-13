import { apiClient } from "@/lib/axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Pagination from "@/components/form/Pagination";
import { TrackerData } from "@/types/trackerData";

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
  return (
    <div className="uploaded_data_report mb-12">
      <h3 className="text-2xl font-semibold mb-4">Uploaded Data Report</h3>
      {/* Display LgTracker summary */}
      {lgData && (
        <div className="mb-4 p-4 bg-white rounded shadow-sm grid grid-cols-6 gap-4 text-sm">
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
        </div>
      )}

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

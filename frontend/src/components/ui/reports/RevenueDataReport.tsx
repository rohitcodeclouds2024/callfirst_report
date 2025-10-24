"use client";

import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Card from "../card/Card";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaCloudDownloadAlt,
  FaSpinner,
} from "react-icons/fa";
import Pagination from "@/components/form/Pagination";
import { RevenueData } from "@/types/revenueData";
import MySwal from "@/lib/swal";
import {
  DateFilter,
  formatDateMDY,
  formatYMD,
  getDateRange,
} from "@/lib/helperFunction";

interface Props {
  clientList: { id: number; name: string }[];
  appliedClientId: number | "";
  appliedDateFilter: DateFilter;
  appliedCustomRange?: { start: string; end: string };
}

export default function RevenueDataReport({
  clientList,
  appliedClientId,
  appliedDateFilter,
  appliedCustomRange,
}: Props) {
  const router = useRouter();
  const [trackerData, setTrackerData] = useState<RevenueData[]>([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [trackerClient, setTrackerClient] = useState<number | "">("");
  const [trackerStart, setTrackerStart] = useState<string>("");
  const [trackerEnd, setTrackerEnd] = useState<string>("");

  // Set dates based on filter logic
  useEffect(() => {
    if (!appliedClientId) return;

    const { startDate, endDate } = getDateRange(
      appliedDateFilter,
      appliedCustomRange
    );

    setTrackerStart(formatYMD(new Date(startDate)));
    setTrackerEnd(formatYMD(new Date(endDate)));
    setTrackerClient(appliedClientId);
  }, [appliedClientId, appliedDateFilter, appliedCustomRange]);

  // Fetch tracker data
  const getTrackerData = async () => {
    if (!trackerClient) return;

    try {
      setTrackerLoading(true);
      const body = {
        client_id: trackerClient,
        start_date: trackerStart,
        end_date: trackerEnd,
        page: currentPage,
        perPage: 20,
      };
      const res = await apiClient.post(`/report/revenue-data`, body);

      setTrackerData(res.data.data || []);
      setTotalPages(res.data.meta.totalPages || 0);
      setTotal(res.data.meta.total || 0);
    } catch (err) {
      toast.error("Failed to fetch revenue report");
    } finally {
      setTrackerLoading(false);
    }
  };

  useEffect(() => {
    getTrackerData();
  }, [trackerClient, trackerStart, trackerEnd, currentPage]);

  return (
    <>
      <h3 className="text-2xl font-semibold mb-4">Revenue Data Report</h3>
      {trackerData.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full text-sm text-left">
            <thead className="uppercase">
              <tr>
                <th className="p-4 bg-surface">#</th>
                <th className="p-4 bg-surface">Client</th>
                <th className="p-4 bg-surface">Date</th>
                <th className="p-4 bg-surface">Gross Transfer</th>
                <th className="p-4 bg-surface">Net Transfer</th>
                <th className="p-4 bg-surface">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {trackerData.map((item, i) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 border-t">{i + 1}</td>
                  <td className="px-4 py-3 border-t">{item.client_name}</td>
                  <td className="px-4 py-3 border-t">
                    {formatDateMDY(item.date)}
                  </td>
                  <td className="px-4 py-3 border-t">{item.gross_transfer}</td>
                  <td className="px-4 py-3 border-t">{item.net_transfer}</td>
                  <td className="px-4 py-3 border-t">{item.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <p className="text-gray-500 mt-4">
          {trackerLoading ? "" : "No data found."}
        </p>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { FaSearch, FaTrash, FaPlus, FaEdit, FaEye } from "react-icons/fa";
import Pagination from "../../../components/form/Pagination";
import RowSkeleton from "../../../components/skeleton/RowSkeleton";
import CheckboxInput from "../../../components/form/CheckboxInput";
import TextInput from "../../../components/form/TextInput";
import { apiClient } from "../../../lib/axios";
import MySwal from "@/lib/swal";
import Link from "next/link";

// Define Revenue type
interface Revenue {
  id: number;
  client_id: number;
  revenue_per_conversion: number;
  special_offer: boolean;
  special_offer_revenue?: number | null;
  special_offer_begin_date?: string | null;
  special_offer_valid_till?: string | null;
  client?: {
    name: string;
  };
}

// Define meta type
interface Meta {
  total: number;
  totalPages: number;
}

export default function RevenueList() {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // Fetch revenues whenever search or page changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRevenues(currentPage, search);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, currentPage]);

  /** 🔹 Fetch revenue list */
  const fetchRevenues = async (page = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{
        data: Revenue[];
        meta: Meta;
      }>("/revenue", {
        params: { page, keyword: searchTerm },
      });

      setRevenues(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      console.error("Failed to fetch revenue data", err);
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Select toggle */
  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  /** 🔹 Delete single revenue record */
  const handleDelete = async (id: number) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This will delete the revenue record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(`/revenue/${id}`);
      setRevenues((prev) => prev.filter((r) => r.id !== id));
      setSelected((prev) => prev.filter((rid) => rid !== id));
      MySwal.fire(
        "Deleted!",
        "Revenue record deleted successfully.",
        "success"
      );
    } catch (err: any) {
      console.error(
        "Failed to delete revenue",
        err.response?.data || err.message
      );
      MySwal.fire("Error!", "Something went wrong while deleting.", "error");
    }
  };

  /** 🔹 Bulk delete */
  const handleBulkDelete = async () => {
    const result = await MySwal.fire({
      title: `Delete ${selected.length} selected records?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete all!",
    });

    if (!result.isConfirmed) return;
    try {
      await apiClient.post("/revenue/bulk-delete", { ids: selected });
      setRevenues((prev) => prev.filter((r) => !selected.includes(r.id)));
      setSelected([]);
      MySwal.fire("Deleted!", "Selected records removed.", "success");
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };

  return (
    <div className="revenue-wrapper">
      <h3 className="text-2xl font-semibold mb-4">Revenue List</h3>

      <div className="flex justify-between gap-4 mb-4">
        <div className="relative w-72">
          <TextInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search ..."
            showLabel={false}
            iconLeft={<FaSearch size={14} className="block" />}
            className="bg-white dark:bg-surface !pl-[40px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/revenue/1/0"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white border border-primary rounded-md hover:text-primary hover:bg-transparent transition-all duration-300"
          >
            <FaPlus size={14} />
            <span>Create Revenue</span>
          </Link>
          {selected.length > 0 && (
            <button
              className="p-3 text-red-500 border border-red-500 rounded-md"
              onClick={handleBulkDelete}
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full text-sm text-left">
          <thead className="uppercase">
            <tr>
              <th className="p-4 bg-surface w-[50px]">
                <CheckboxInput
                  checked={
                    selected.length === revenues.length && revenues.length > 0
                  }
                  onChange={(e) =>
                    e.target.checked
                      ? setSelected(revenues.map((r) => r.id))
                      : setSelected([])
                  }
                />
              </th>
              <th className="p-4 bg-surface">#</th>
              <th className="p-4 bg-surface">Client</th>
              <th className="p-4 bg-surface">Revenue / Conversion</th>
              <th className="p-4 bg-surface">Special Offer</th>
              <th className="p-4 bg-surface">Offer Revenue</th>
              <th className="p-4 bg-surface">Valid Dates</th>
              <th className="p-4 bg-surface">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 dark:text-gray-300">
            {loading ? (
              <RowSkeleton count={5} columns={7} withCheckbox />
            ) : revenues.length > 0 ? (
              revenues.map((rev, loop) => (
                <tr key={rev.id}>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    <CheckboxInput
                      checked={selected.includes(rev.id)}
                      onChange={() => toggleSelect(rev.id)}
                      label=""
                    />
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {loop + 1}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {rev.client?.name || `Client #${rev.client_id}`}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    ${rev.revenue_per_conversion.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {rev.special_offer ? "Enable" : "Not Enable"}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {rev.special_offer
                      ? `$${rev.special_offer_revenue?.toFixed(2) || 0}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    {rev.special_offer_begin_date
                      ? `${rev.special_offer_begin_date} → ${rev.special_offer_valid_till}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 bg-surface border-t border-border">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/revenue/3/${rev.id}`}
                        className="p-2 text-blue-500 border border-blue-500 rounded hover:bg-blue-100 transition-all duration-300"
                      >
                        <FaEye size={14} />
                      </Link>
                      <Link
                        href={`/admin/revenue/2/${rev.id}`}
                        className="p-2 text-green-500 border border-green-500 rounded hover:bg-green-100 transition-all duration-300"
                      >
                        <FaEdit size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="p-2 text-red-500 border border-red-500 rounded hover:bg-red-100 transition-all duration-300"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-3 border-t border-border text-center"
                >
                  No revenue records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {!loading && revenues.length > 0 && (
          <Pagination
            total={total}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}

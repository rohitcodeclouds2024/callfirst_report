"use client";

import { useEffect, useState } from "react";
import {
  FaUsers,
  FaSearch,
  FaTrash,
  FaPlus,
  FaEdit,
  FaEye,
} from "react-icons/fa";
import Pagination from "../../../components/form/Pagination"; // adjust path
import RowSkeleton from "../../../components/skeleton/RowSkeleton";
import CheckboxInput from "../../../components/form/CheckboxInput";
import FormButton from "../../../components/form/FormButton";
import TextInput from "../../../components/form/TextInput";
import { apiClient } from "../../../lib/axios";
import MySwal from "@/lib/swal";
import Link from "next/link";

// Define user type (based on API response)
interface User {
  id: number;
  email: string;
  contact_number: string;
}

// Define meta type (pagination info)
interface Meta {
  total: number;
  totalPages: number;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // Fetch users whenever search or page changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(currentPage, search);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, currentPage]);

  /** 🔹 Fetch users list */
  const fetchUsers = async (page = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{
        data: User[];
        meta: Meta;
      }>("/users", {
        params: { page, keyword: searchTerm },
      });

      setUsers(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Select toggle */
  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  /** 🔹 Delete single user */
  const handleDelete = async (id: number) => {
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
      await apiClient.delete(`/users/${id}`); // ✅ correct call

      // update state
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelected((prev) => prev.filter((uid) => uid !== id));

      MySwal.fire("Deleted!", "User has been deleted.", "success");
    } catch (err: any) {
      console.error("Failed to delete user", err.response?.data || err.message);
      MySwal.fire(
        "Error!",
        err.response?.data?.error || "Something went wrong.",
        "error"
      );
    }
  };

  /** 🔹 Bulk delete */
  const handleBulkDelete = async () => {
    const result = await MySwal.fire({
      title: `Delete ${selected.length} selected users?`,
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
      await apiClient.post("/users/bulk-delete", { ids: selected });
      setUsers((prev) => prev.filter((u) => !selected.includes(u.id)));
      setSelected([]);
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-neutral px-6 py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header and Search Bar */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold flex items-center gap-2 text-primary-dark">
            <FaUsers className="text-accent" /> Users
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/admin/users/1/0">
              <FormButton
                icon={<FaPlus />}
                label="Create User"
                showLabel
                variant="primary"
              />
            </Link>
            {selected.length > 0 && (
              <FormButton
                icon={<FaTrash className="text-error text-xl text-primary" />}
                iconOnly
                showLabel={false}
                variant="deleteAll"
                label={`Delete Selected (${selected.length})`}
                onClick={handleBulkDelete}
              />
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-72 mb-4">
          <TextInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search user..."
            showLabel={false}
            iconLeft={<FaSearch className="text-muted" />}
            className="py-2 pl-10 pr-4 rounded-md bg-surface text-neutral border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>

        {/* Data Table */}
        <div className="overflow-auto rounded-lg shadow bg-surface transition-colors">
          <table className="min-w-full text-sm text-neutral">
            <thead className="uppercase text-xs bg-surface border-b border-border text-muted">
              <tr>
                <th className="px-6 py-3">
                  <div className="flex items-center justify-center">
                    <CheckboxInput
                      checked={
                        selected.length === users.length && users.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected(users.map((u) => u.id));
                        } else {
                          setSelected([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Contact Number</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <RowSkeleton count={5} columns={5} withCheckbox />
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-background transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center">
                        <CheckboxInput
                          checked={selected.includes(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          label=""
                          className="checkbox"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3">{user.id}</td>
                    <td className="px-6 py-3">{user.email}</td>
                    <td className="px-6 py-3">{user.contact_number}</td>
                    <td className="px-6 py-4 flex items-center gap-4">
                      <Link href={`/admin/users/3/${user.id}`}>
                        <FaEye className="cursor-pointer text-blue-500" />
                      </Link>
                      <Link href={`/admin/users/2/${user.id}`}>
                        <FaEdit className="cursor-pointer text-green-500" />
                      </Link>
                      <FaTrash
                        className="cursor-pointer text-red-500"
                        onClick={() => handleDelete(user.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {!loading && users.length > 0 && (
            <Pagination
              total={total}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

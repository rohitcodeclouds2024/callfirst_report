"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";

interface Permission {
  id: number;
  name: string;
}
interface PermissionGroup {
  name: string;
  data: Permission[];
}
interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
}

export default function RoleFormPage() {
  const params = useParams();
  const router = useRouter();
  const type = Number(params?.type); // 1=create, 2=edit, 3=show
  const id = Number(params?.id);

  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<PermissionGroup[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    permission_ids: [] as number[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
    if (type === 2 || type === 3) fetchRole();
    else setLoading(false);
  }, [id, type]);

  const fetchPermissions = async () => {
    const { data } = await apiClient.get<PermissionGroup[]>(
      "/permissions/grouped"
    );
    setPermissions(data);
  };

  const fetchRole = async () => {
    const { data } = await apiClient.get<Role>(`/roles/${id}`);
    setRole(data);
    setFormData({
      name: data.name,
      permission_ids: data.permissions?.map((p) => p.id) || [],
    });
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePermissionToggle = (pid: number) => {
    setFormData((prev) => {
      const exists = prev.permission_ids.includes(pid);
      return {
        ...prev,
        permission_ids: exists
          ? prev.permission_ids.filter((id) => id !== pid)
          : [...prev.permission_ids, pid],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 1) {
      await apiClient.post("/roles", formData);
    } else if (type === 2) {
      await apiClient.put(`/roles/${id}`, formData);
    }
    router.push("/admin/roles");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (type === 3 && role) {
    return (
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold">👀 Role Details</h2>
        <p>
          <strong>ID:</strong> {role.id}
        </p>
        <p>
          <strong>Name:</strong> {role.name}
        </p>
        <p>
          <strong>Permissions:</strong>
        </p>
        <ul className="list-disc ml-6">
          {role.permissions?.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold mb-4">
        {type === 1 ? "🔹 Create Role" : "✏️ Edit Role"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Role Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Assign Permissions</label>
          {permissions.map((group) => (
            <div key={group.name} className="mb-4 border p-3 rounded">
              <h3 className="font-semibold mb-2">{group.name}</h3>
              <div className="grid grid-cols-2 gap-2">
                {group.data.map((perm) => (
                  <label key={perm.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.permission_ids.includes(perm.id)}
                      onChange={() => handlePermissionToggle(perm.id)}
                    />
                    <span>{perm.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {type === 1 ? "Create Role" : "Update Role"}
        </button>
      </form>
    </div>
  );
}

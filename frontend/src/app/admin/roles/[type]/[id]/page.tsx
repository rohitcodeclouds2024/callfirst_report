"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import Card from "@/components/ui/card/Card";

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
      <div className="role-details-wrapper">
        <h3 className="text-2xl font-semibold mb-4">Role Details</h3>
        <Card>
          <ul className="flex flex-col gap-4">
            <li>
              <strong>ID:</strong> {role.id}
            </li>
            <li>
              <strong>Name:</strong> {role.name}
            </li>
            <li>
              <strong>Permissions:</strong>
            </li>
          </ul>
        </Card>
        <ul className="list-disc ml-6">
          {role.permissions?.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="role-wrapper">
      <h3 className="text-xl font-bold mb-4">
        {type === 1 ? "Create Role" : "Edit Role"}
      </h3>
      <Card>
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <label className="block text-sm font-medium mb-2">Role Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div className="col-span-12">
            <h4 className="text-lg font-semibold pb-2 border-b border-border mb-4">
              Assign Permissions
            </h4>
            <div className="flex flex-col gap-6">
              {permissions.map((group) => (
                <div key={group.name}>
                  <label className="block text-sm font-medium capitalize mb-2">
                    {group.name}
                  </label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {group.data.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permission_ids.includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                        />
                        <span className="block">{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white border border-primary rounded-md hover:text-primary hover:bg-transparent transition-all duration-300"
            >
              {type === 1 ? "Create Role" : "Update Role"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

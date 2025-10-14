"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useApi from "@/lib/useApi";
import { apiClient } from "@/lib/axios";
import Card from "@/components/ui/card/Card";

interface User {
  id: number;
  name: string;
  email: string;
  contact_number: string;
  role_id?: number[];
}

interface Role {
  id: number;
  name: string;
}

interface Meta {
  total: number;
  totalPages: number;
}

export default function UserFormPage() {
  const params = useParams();
  const router = useRouter();
  const type = Number(params?.type); // 1=create, 2=edit, 3=show
  const id = Number(params?.id);

  const api = useApi();

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role_id: [],
  });

  useEffect(() => {
    fetchRoles();

    if (type === 2 || type === 3) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [id, type]);

  const fetchRoles = async () => {
    try {
      const { data } = await apiClient.get<{ data: Role[]; meta: Meta }>(
        "/roles"
      );
      setRoles(data.data);
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await api.get<User>(`/users/${id}`);
      setUser(data);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.contact_number,
        password: "",
        confirmPassword: "",
        role_id: data.role_id || [],
      });
    } catch (err) {
      console.error("Failed to fetch user", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, multiple, selectedOptions } =
      e.target as HTMLSelectElement;

    if (multiple) {
      // collect all selected values into number[]
      const values = Array.from(selectedOptions).map((opt) =>
        Number(opt.value)
      );
      setFormData((prev) => ({ ...prev, [name.replace("[]", "")]: values }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      if (type === 1) {
        await api.post("/users", {
          name: formData.name,
          email: formData.email,
          contact_number: formData.phone,
          password: formData.password,
          role_id: formData.role_id,
        });
      } else if (type === 2 && user) {
        await api.put(`/users/${id}`, {
          name: formData.name,
          email: formData.email,
          contact_number: formData.phone,
          password: formData.password || undefined, // allow empty password (no change)
          role_id: formData.role_id,
        });
      }

      router.push("/admin/users");
    } catch (err) {
      console.error("Failed to save user", err);
      alert("Something went wrong!");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (type === 3 && user) {
    return (
      <div className="user-details-wrapper">
        <h2 className="text-2xl font-semibold mb-4">User Details</h2>
        <Card>
          <ul className="flex flex-col gap-4">
            <li>
              <strong>ID:</strong> {user.id}
            </li>
            <li>
              <strong>Name:</strong> {user.name}
            </li>
            <li>
              <strong>Email:</strong> {user.email}
            </li>
            <li>
              <strong>Phone:</strong> {user.contact_number}
            </li>
          </ul>
        </Card>
      </div>
    );
  }

  return (
    <div className="user-wrapper">
      <h3 className="text-2xl font-semibold mb-4">{ type === 1 ? "Create User" : "Edit User" }</h3>
      <Card>
        <form onSubmit={ handleSubmit } className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input type="text" name="name" value={ formData.name } onChange={ handleChange } className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary" required />
          </div>
          <div className="col-span-6">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" name="email" value={ formData.email } onChange={ handleChange } className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary" required />
          </div>
          <div className="col-span-6">
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input type="text" name="phone" value={ formData.phone } onChange={ handleChange } className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary" />
          </div>
          <div className="col-span-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input type="password" name="password" value={ formData.password } onChange={ handleChange } className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary" placeholder={ type === 2 ? "Leave blank to keep current password" : "" } {...( type === 1 ? { required: true } : {} ) } />
          </div>
          <div className="col-span-6">
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input type="password" name="confirmPassword" value={ formData.confirmPassword } onChange={ handleChange } className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary" { ...( type === 1 ? { required: true } : {} ) } />
          </div>
          <div className="col-span-12">
            <label className="block text-sm font-medium mb-2">Assign Role</label>
            <select name="role_id[]" value={ formData.role_id.map( String ) } onChange={ handleChange } className="w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none focus:border-primary" required multiple>
              <option value="">Select Role</option>
              { roles.map( ( role ) => (
                <option key={ role.id } value={ role.id }>
                  { role.name }
                </option>
              ) ) }
            </select>
          </div>
          <div className="flex justify-end col-span-12">
            <button type="submit" className="px-4 py-2 bg-primary text-white border border-primary rounded-md hover:text-primary hover:bg-transparent transition-all duration-300">
              { type === 1 ? "Create User" : "Update User" }
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

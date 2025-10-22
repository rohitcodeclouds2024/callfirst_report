"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import Card from "@/components/ui/card/Card";
import Select from "react-select";
import { toast } from "react-hot-toast";

interface Client {
  id: number;
  name: string;
}

interface RevenueData {
  client_id: number;
  revenue_per_conversion: number;
  special_offer: boolean;
  special_offer_revenue: number;
  special_offer_begin_date: string;
  special_offer_valid_till: string;
  client?: {
    name: string;
  };
}

export default function RevenueFormPage() {
  const params = useParams();
  const router = useRouter();
  const type = Number(params?.type); // 1=create, 2=edit, 3=show
  const id = Number(params?.id);

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<RevenueData>({
    client_id: 0,
    revenue_per_conversion: 0,
    special_offer: false,
    special_offer_revenue: 0,
    special_offer_begin_date: "",
    special_offer_valid_till: "",
  });

  useEffect(() => {
    fetchClients();
    if (type === 2 || type === 3) {
      fetchRevenue();
    } else {
      setLoading(false);
    }
  }, [id, type]);

  const fetchClients = async () => {
    try {
      const { data } = await apiClient.get("/clients");
      setClients(data.data || []);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    }
  };

  const fetchRevenue = async () => {
    try {
      const { data } = await apiClient.get(`/revenue/${id}`);
      setFormData({
        client_id: data.client_id,
        revenue_per_conversion: data.revenue_per_conversion,
        special_offer: data.special_offer,
        special_offer_revenue: data.special_offer_revenue,
        special_offer_begin_date: data.special_offer_begin_date || "",
        special_offer_valid_till: data.special_offer_valid_till || "",
        client: data.client ? { name: data.client.name } : undefined,
      });
    } catch (err) {
      console.error("Failed to fetch revenue record", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? target.checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (type === 1) {
        await apiClient.post("/revenue", formData);
      } else if (type === 2) {
        await apiClient.put(`/revenue/${id}`, formData);
      }

      toast.success("Revenue details saved successfully!");
      router.push("/admin/revenue");
    } catch (err) {
      console.error("Failed to save revenue", err);
      alert("Something went wrong!");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  if (type === 3 && formData) {
    return (
      <div className="user-details-wrapper">
        <h3 className="text-2xl font-semibold mb-4">User Details</h3>
        <Card>
          <ul className="flex flex-col gap-4">
            <li>
              <strong>Clients Name:</strong> {formData.client?.name}
            </li>
            <li>
              <strong>Revenue per Conversion:</strong>{" "}
              {formData.revenue_per_conversion}
            </li>
            <li>
              <strong>Special Offer:</strong>{" "}
              {formData.special_offer ? "Enabled" : "Disabled"}
            </li>
            {formData.special_offer && (
              <>
                <li>
                  <strong>Special Offer Revenue:</strong>{" "}
                  {formData.special_offer_revenue}
                </li>
                <li>
                  <strong>Offer Start Date:</strong>{" "}
                  {formData.special_offer_begin_date}
                </li>
                <li>
                  <strong>Offer Valid Till:</strong>{" "}
                  {formData.special_offer_valid_till}
                </li>
              </>
            )}
          </ul>
        </Card>
      </div>
    );
  }

  return (
    <div className="user-wrapper">
      <h3 className="text-2xl font-semibold mb-4">
        {type === 1 ? "Add Revenue Details" : "Edit Revenue Details"}
      </h3>

      <Card>
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
          {/* Client */}
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-2">Client</label>
            <Select
              name="client_id"
              options={clients.map((client) => ({
                value: client.id,
                label: client.name,
              }))}
              className="custom-select"
              classNamePrefix="select"
              value={
                clients
                  .filter((c) => c.id === formData.client_id)
                  .map((c) => ({ value: c.id, label: c.name }))[0] || null
              }
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  client_id: selected?.value || 0,
                }))
              }
            />
          </div>

          {/* Revenue per Conversion */}
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-2">
              Revenue per Conversion
            </label>
            <input
              type="number"
              name="revenue_per_conversion"
              value={formData.revenue_per_conversion}
              onChange={handleChange}
              placeholder="Enter revenue per conversion"
              className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Special Offer Toggle */}
          <div className="col-span-12 md:col-span-6 flex items-center gap-3">
            <input
              type="checkbox"
              name="special_offer"
              checked={formData.special_offer}
              onChange={handleChange}
              id="special_offer"
            />
            <label htmlFor="special_offer" className="text-sm font-medium">
              Enable Special Offer
            </label>
          </div>

          {formData.special_offer && (
            <>
              <br />
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm font-medium mb-2">
                  Special Offer Revenue
                </label>
                <input
                  type="number"
                  name="special_offer_revenue"
                  value={formData.special_offer_revenue}
                  onChange={handleChange}
                  placeholder="Enter special offer revenue"
                  className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:border-primary"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm font-medium mb-2">
                  Offer Start Date
                </label>
                <input
                  type="date"
                  name="special_offer_begin_date"
                  value={formData.special_offer_begin_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:border-primary"
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm font-medium mb-2">
                  Offer Valid Till
                </label>
                <input
                  type="date"
                  name="special_offer_valid_till"
                  value={formData.special_offer_valid_till}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-md focus:outline-none focus:border-primary"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="col-span-12 flex justify-end mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white border border-primary rounded-md hover:bg-transparent hover:text-primary transition-all duration-300"
            >
              {type === 1 ? "Create Revenue" : "Update Revenue"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import Card from "@/components/ui/card/Card";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { FaTimes, FaPlus } from "react-icons/fa";

interface Client {
  id: number;
  name: string;
}
interface RevenueOffer {
  offer_percentage: number;
  start_date: string;
  end_date: string;
}
interface RevenueData {
  client_id: number;
  revenue_per_conversion: number;
  special_offer: boolean;
  offers: RevenueOffer[];
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
    offers: [{ offer_percentage: 10, start_date: "", end_date: "" }], // default
  });

  useEffect(() => {
    fetchClients();
    if (type === 2 || type === 3) fetchRevenue();
    else setLoading(false);
  }, [id, type]);

  const fetchClients = async () => {
    try {
      const { data } = await apiClient.get("/clients");
      setClients(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRevenue = async () => {
    try {
      const { data } = await apiClient.get(`/revenue/${id}`);
      setFormData({
        client_id: data.client_id,
        revenue_per_conversion: data.revenue_per_conversion,
        special_offer: data.special_offer,
        offers: data.offers?.length
          ? data.offers
          : [{ offer_percentage: 10, start_date: "", end_date: "" }],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOfferChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedOffers = [...formData.offers];
    updatedOffers[index][field] = value;
    setFormData((prev) => ({ ...prev, offers: updatedOffers }));
  };

  const addOffer = () => {
    setFormData((prev) => ({
      ...prev,
      offers: [
        ...prev.offers,
        { offer_percentage: 10, start_date: "", end_date: "" },
      ],
    }));
  };

  const removeOffer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      offers: prev.offers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id) {
      toast.error("Please select a client");
      return;
    }

    if (
      !formData.revenue_per_conversion ||
      formData.revenue_per_conversion <= 0
    ) {
      toast.error("Please enter a valid revenue per conversion");
      return;
    }
    if (formData.special_offer) {
      if (!formData.offers || formData.offers.length === 0) {
        toast.error("Please add at least one offer");
        return;
      }

      formData.offers.forEach((offer, index) => {
        if (!offer.offer_percentage || offer.offer_percentage <= 0) {
          toast.error(`Offer ${index + 1}: Enter a valid offer percentage`);
          throw new Error("Validation failed");
        }

        if (!offer.start_date) {
          toast.error(`Offer ${index + 1}: Start date is required`);
          throw new Error("Validation failed");
        }

        if (!offer.end_date) {
          toast.error(`Offer ${index + 1}: End date is required`);
          throw new Error("Validation failed");
        }

        if (new Date(offer.end_date) < new Date(offer.start_date)) {
          toast.error(
            `Offer ${index + 1}: End date cannot be before start date`
          );
          throw new Error("Validation failed");
        }
      });

      const offers = formData.offers.map((o) => ({
        start: new Date(o.start_date),
        end: new Date(o.end_date),
      }));

      for (let i = 0; i < offers.length; i++) {
        for (let j = i + 1; j < offers.length; j++) {
          const a = offers[i];
          const b = offers[j];

          // Check if ranges overlap
          if (a.start <= b.end && b.start <= a.end) {
            toast.error(
              `Offer ${i + 1} and Offer ${j + 1} have overlapping dates`
            );
            throw new Error("Validation failed");
          }
        }
      }
    }
    try {
      if (type === 1) await apiClient.post("/revenue", formData);
      else if (type === 2) await apiClient.put(`/revenue/${id}`, formData);

      toast.success("Revenue details saved successfully!");
      router.push("/admin/revenue");
    } catch (err) {
      console.error(err);
      toast.error("Revenue already exists for this client");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="user-wrapper">
      <h3 className="text-2xl font-semibold mb-4">
        {type === 1 ? "Add Revenue Details" : "Edit Revenue Details"}
      </h3>

      <Card>
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
          {/* First Row: Client & Revenue per Conversion */}
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-2">Client</label>
            <Select
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
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
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium mb-2">
              Revenue per Conversion
            </label>
            <input
              type="number"
              name="revenue_per_conversion"
              value={formData.revenue_per_conversion}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-md"
            />
          </div>

          {/* Second Row: Special Offer Toggle */}
          <div className="col-span-12 flex items-center gap-3">
            <input
              type="checkbox"
              name="special_offer"
              checked={formData.special_offer}
              onChange={handleChange}
            />
            <label className="text-sm font-medium">Enable Special Offer</label>
          </div>

          {/* Third Row: Multiple Offers */}
          {formData.special_offer && (
            <div className="col-span-12 space-y-4 mt-2">
              {formData.offers.map((offer, index) => (
                <div
                  key={index}
                  className="relative border border-border rounded-md p-4 grid grid-cols-12 gap-4 items-end bg-white shadow-sm"
                >
                  {/* Remove Button in Top-Right */}
                  <button
                    title="Remove Offer"
                    type="button"
                    onClick={() => removeOffer(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>

                  {/* Offer % */}
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-sm font-medium mb-2">
                      Offer %
                    </label>
                    <input
                      type="number"
                      value={offer.offer_percentage}
                      onChange={(e) =>
                        handleOfferChange(
                          index,
                          "offer_percentage",
                          Number(e.target.value)
                        )
                      }
                      className="w-full px-4 py-3 border border-border rounded-md"
                    />
                  </div>

                  {/* Start Date */}
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-sm font-medium mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={offer.start_date}
                      onChange={(e) =>
                        handleOfferChange(index, "start_date", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-border rounded-md"
                    />
                  </div>

                  {/* End Date */}
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-sm font-medium mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={offer.end_date}
                      onChange={(e) =>
                        handleOfferChange(index, "end_date", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-border rounded-md"
                    />
                  </div>
                </div>
              ))}
              <button
                title="Add Offer"
                type="button"
                onClick={addOffer}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-medium rounded-md shadow hover:bg-green-600 transition-colors duration-200"
              >
                <FaPlus size={14} />
              </button>
            </div>
          )}

          <div className="col-span-12 flex justify-end mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-md"
            >
              {type === 1 ? "Create Revenue" : "Update Revenue"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

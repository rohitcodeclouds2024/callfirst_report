"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Card from "@/components/ui/card/Card";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";
import toast from "react-hot-toast";
import { GraphProps } from "@/types/graphProps";

interface LeadUploadData {
  [key: string]: string | number;
  name: string;
  value: number;
}

export default function LeadUploadPieGraph({
  selectedClientId,
  dateFilter,
  customRange,
}: GraphProps) {
  const [leadUpload, setLeadUploadData] = useState<LeadUploadData[]>([]);

  useEffect(() => {
    if (!selectedClientId) return;

    const fetchConversion = async () => {
      try {
        const res = await apiClient.post(`/uploads-report`, {
          clientId: selectedClientId,
          dateFilter,
          customRange,
        });
        setLeadUploadData(res.data);
      } catch (err) {
        toast.error("Failed to fetch conversion data");
      }
    };

    fetchConversion();
  }, [selectedClientId]);

  return (
    <Card className="col-span-4" title="Number of Lead Uploads">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie
            data={leadUpload}
            dataKey="value"
            nameKey="name"
            cx="50%"
            innerRadius={80}
            outerRadius={96}
            fill="currentColor"
            className="text-primary"
            label={({ value }) => `${value}`}
          />
          <Tooltip
            formatter={(value, name, props) => [
              `${value}`,
              `${props.payload.name}`,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

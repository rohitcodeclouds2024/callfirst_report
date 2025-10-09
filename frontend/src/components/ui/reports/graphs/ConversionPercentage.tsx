"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "@/components/ui/card/Card";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";
import toast from "react-hot-toast";
import { GraphProps } from "@/types/graphProps";

interface ConversionData {
  name: string;
  conversion: number;
}

export default function ConversionPercentage({
  selectedClientId,
  dateFilter,
  customRange,
}: GraphProps) {
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);

  useEffect(() => {
    if (!selectedClientId) return;

    const fetchConversion = async () => {
      try {
        const res = await apiClient.post(`/conversion-percentage`, {
          clientId: selectedClientId,
          dateFilter,
          customRange,
        });
        setConversionData(res.data);
      } catch (err) {
        toast.error("Failed to fetch conversion data");
      }
    };

    fetchConversion();
  }, [selectedClientId]);

  return (
    <Card className="col-span-6" title="Conversion Percentage">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={conversionData}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `${value}%`} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey="conversion" fill="#ef4444" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

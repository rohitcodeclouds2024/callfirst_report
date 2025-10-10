"use client";

import {
  Area,
  AreaChart,
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

interface DialedNumberData {
  name: string;
  dials: number;
}

export default function DialedNumber({
  selectedClientId,
  dateFilter,
  customRange,
}: GraphProps) {
  const [numberOfDial, setNumberOfDial] = useState<DialedNumberData[]>([]);

  useEffect(() => {
    if (!selectedClientId) return;

    const fetchConversion = async () => {
      try {
        const res = await apiClient.post(`/dials-number`, {
          clientId: selectedClientId,
          dateFilter,
          customRange,
        });
        setNumberOfDial(res.data);
      } catch (err) {
        toast.error("Failed to fetch conversion data");
      }
    };

    fetchConversion();
  }, [selectedClientId, dateFilter, customRange]);

  return (
    <Card className="col-span-12 md:col-span-6 lg:col-span-8" title="Number of Dials">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={numberOfDial}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="dials"
            stroke="currentColor"
            className="text-primary"
            fill="#0c3c604d"
            name="Dials"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

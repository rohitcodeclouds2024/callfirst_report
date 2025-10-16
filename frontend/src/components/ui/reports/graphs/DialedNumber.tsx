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
    <Card
      className="col-span-12 md:col-span-6"
      title="Number of Dials"
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={numberOfDial}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          className="text-primary"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{
              fill: "var(--color-text)",
              fontStyle: "italic",
              fontSize: 10,
            }}
            angle={-55}
            textAnchor="end"
            height={110}
          />
          <YAxis
            tick={{
              fill: "var(--color-text)",
              fontSize: 10,
            }}
          />
          <Tooltip
            contentStyle={{
              fontSize: 14,
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
              border: 0,
              borderRadius: "0.5rem",
              boxShadow: "0px 2px 4px 0px rgb(0 0 0 / 30%)",
            }}
          />
          <Area
            type="monotone"
            dataKey="dials"
            stroke="#8bc34a"
            fill="#8bc34a80"
            name="Dials"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

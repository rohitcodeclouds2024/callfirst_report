"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import Card from "@/components/ui/card/Card";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/axios";
import toast from "react-hot-toast";
import { GraphProps } from "@/types/graphProps";
import CustomTooltip from "./tooltip/CustomTooltip";

interface RevenueGraphData {
  name: string;
  gross_transfer: number;
  net_transfer: number;
  revenue: number;
}

export default function RevenueGraph({
  selectedClientId,
  dateFilter,
  customRange,
}: GraphProps) {
  const [graphData, setGraphData] = useState<RevenueGraphData[]>([]);

  useEffect(() => {
    if (!selectedClientId) return;

    const fetchGraphData = async () => {
      try {
        const res = await apiClient.post(`/revenue-graph-data`, {
          clientId: selectedClientId,
          dateFilter,
          customRange,
        });
        setGraphData(res.data);
      } catch (err) {
        toast.error("Failed to fetch graph data");
      }
    };

    fetchGraphData();
  }, [selectedClientId, dateFilter, customRange]);

  return (
    <Card
      className="col-span-12 md:col-span-6 lg:col-span-8"
      title="Revenue Overview"
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={graphData}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
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
            height={100}
          />
          <YAxis
            tick={{
              fill: "var(--color-text)",
              fontSize: 10,
            }}
          />
          {/* <Tooltip
            content={
              <CustomTooltip
                selectedClientId={selectedClientId}
                viewBtnColor="#673ab7"
                type="1"
              />
            }
            cursor={{ fill: "transparent" }}
          /> */}
          <Legend />

          {/* 3 Lines */}
          <Line
            type="monotone"
            dataKey="gross_transfer"
            stroke="#2196F3" // blue
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Gross Transfer"
          />
          <Line
            type="monotone"
            dataKey="net_transfer"
            stroke="#4CAF50" // green
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Net Transfer"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#FF9800" // orange
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

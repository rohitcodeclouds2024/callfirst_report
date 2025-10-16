"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
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
  }, [selectedClientId, dateFilter, customRange]);
  const COLORS = [ "#f44336", "#3f51b5", "#009688", "#ff9800", "#ff5722", "#00bcd4", "#673ab7", "#9c27b0", ];
  return (
    <Card
      className="col-span-12 md:col-span-6 lg:col-span-4"
      title="Number of Lead Uploads"
    >
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
            stroke="0"
            label={({ x, y, value }) => (
              <text
                x={x}
                y={y}
                textAnchor={x > 150 ? "start" : "end"}
                dominantBaseline="central"
                fill="var(--color-text)"
                dx={x > 150 ? 10 : -10}
                style={{
                  fontStyle: "italic",
                  fontSize: 10,
                }}
              >
                {String(value)}
              </text>
            )}
            labelLine={{ stroke: "var(--color-text)" }}
          >
            { leadUpload.map(( entry, index ) => (
              <Cell key={ `cell-${ index }` } fill={ COLORS[ index % COLORS.length ] } />
            ) ) }
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [
              `${value}`,
              `${props.payload.name}`,
            ]}
            contentStyle={{
              fontSize: 14,
              backgroundColor: "var(--color-bg)",
              border: 0,
              borderRadius: "0.5rem",
              boxShadow: "0px 2px 4px 0px rgb(0 0 0 / 30%)",
            }}
            itemStyle={{ color: "var(--color-text)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

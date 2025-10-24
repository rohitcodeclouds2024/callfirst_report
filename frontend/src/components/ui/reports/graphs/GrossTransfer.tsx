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
import CustomTooltip from "./tooltip/CustomTooltip";
import ChartSettingsMenu from "./ChartSettingsMenu";

interface GrossTransferData {
  name: string;
  value: number;
}

export default function GrossTransfer({
  selectedClientId,
  dateFilter,
  customRange,
}: GraphProps) {
  const [grossTransferData, setGrossTransferData] = useState<
    GrossTransferData[]
  >([]);

  useEffect(() => {
    if (!selectedClientId) return;

    const fetchConversion = async () => {
      try {
        const res = await apiClient.post(`/grossTransfer-data`, {
          clientId: selectedClientId,
          dateFilter,
          customRange,
        });
        setGrossTransferData(res.data);
      } catch (err) {
        toast.error("Failed to fetch conversion data");
      }
    };

    fetchConversion();
  }, [selectedClientId, dateFilter, customRange]);

  // console.log(netTransferData);

  return (
    <Card
      className="col-span-12 md:col-span-6 lg:col-span-8"
      title={
        <div className="flex justify-between items-center">
          <span>Gross Transfer</span>
          <ChartSettingsMenu
            selectedClientId={selectedClientId}
            dateFilter={dateFilter}
            customRange={customRange}
          />
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={grossTransferData}
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
            tickFormatter={(value) => `${value}`}
            tick={{
              fill: "var(--color-text)",
              fontSize: 10,
            }}
          />
          <Tooltip
            content={
              <CustomTooltip
                selectedClientId={selectedClientId}
                viewBtnColor="#a7e6eeff"
                type="1"
              />
            }
            cursor={{ fill: "transparent" }}
            wrapperStyle={{ pointerEvents: "none" }}
          />
          {/* <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={{
              fontSize: 14,
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
              border: 0,
              borderRadius: "0.5rem",
              boxShadow: "0px 2px 4px 0px rgb(0 0 0 / 30%)",
            }}
            cursor={{ fill: "transparent" }}
          /> */}
          <Bar dataKey="value" fill="#a7e6eeff" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

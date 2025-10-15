"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
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

interface NumberContactsData {
  name: string;
  contacts: number;
}

export default function NumberContacts({
  selectedClientId,
  dateFilter,
  customRange,
}: GraphProps) {
  const [numberOfContacts, setNumberOfContacts] = useState<
    NumberContactsData[]
  >([]);

  useEffect(() => {
    if (!selectedClientId) return;

    const fetchConversion = async () => {
      try {
        const res = await apiClient.post(`/contacts-number`, {
          clientId: selectedClientId,
          dateFilter,
          customRange,
        });
        setNumberOfContacts(res.data);
      } catch (err) {
        toast.error("Failed to fetch conversion data");
      }
    };

    fetchConversion();
  }, [selectedClientId, dateFilter, customRange]);

  return (
    <Card className="col-span-12 md:col-span-6" title="Number of Contacts">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={numberOfContacts}
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
              fontFamily: "sans-serif",
            }}
            angle={-55}
            textAnchor="end"
            height={110}
          />

          <YAxis
            tick={{
              fill: "var(--color-text)",
              fontSize: 10,
              fontFamily: "sans-serif",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
              border: 0,
              borderRadius: "0.5rem",
              boxShadow: "0px 2px 4px 0px rgb(0 0 0 / 30%)",
            }}
          />
          <Line
            type="monotone"
            dataKey="contacts"
            stroke="#673ab7"
            // className="text-primary"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

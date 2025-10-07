"use client";

import { apiClient } from "@/lib/axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
} from "recharts";
import { Client } from "@/types/client";

export default function Dashboard() {
  const [clientList, setClientList] = useState<Client[]>([]);

  // Fetch client list on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await apiClient.get("/clients");
        setClientList(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load clients");
      }
    };
    fetchClients();
  }, []);

  const conversionPercentage = [
    { name: "Oct 1", conversion: 25 },
    { name: "Oct 2", conversion: 35 },
    { name: "Oct 3", conversion: 20 },
    { name: "Oct 4", conversion: 40 },
    { name: "Oct 5", conversion: 30 },
    { name: "Oct 6", conversion: 50 },
    { name: "Oct 7", conversion: 10 },
    { name: "Oct 8", conversion: 15 },
  ];
  const numberOfContacts = [
    { name: "Oct 1", contacts: 200 },
    { name: "Oct 2", contacts: 300 },
    { name: "Oct 3", contacts: 250 },
    { name: "Oct 4", contacts: 400 },
    { name: "Oct 5", contacts: 350 },
    { name: "Oct 6", contacts: 450 },
    { name: "Oct 7", contacts: 150 },
    { name: "Oct 8", contacts: 120 },
  ];
  const numberOfDial = [
    { name: "Oct 1", dials: 500 },
    { name: "Oct 2", dials: 700 },
    { name: "Oct 3", dials: 600 },
    { name: "Oct 4", dials: 800 },
    { name: "Oct 5", dials: 750 },
    { name: "Oct 6", dials: 900 },
    { name: "Oct 7", dials: 400 },
    { name: "Oct 8", dials: 350 },
  ];
  const numberOfUploads = [
    { name: "Oct 1", value: 400 },
    { name: "Oct 2", value: 300 },
    { name: "Oct 3", value: 300 },
    { name: "Oct 4", value: 200 },
    { name: "Oct 5", value: 278 },
    { name: "Oct 6", value: 189 },
    { name: "Oct 7", value: 239 },
    { name: "Oct 8", value: 339 },
  ];

  return (
    <div className="dashboard-content">
      <h3 className="text-2xl font-semibold mb-4">Dashboard</h3>
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-6" title="Conversion Percentage">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={conversionPercentage}
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
        <Card className="col-span-6" title="Number of Contacts">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={numberOfContacts}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="contacts"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="col-span-8" title="Number of Dials">
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
                stroke="#ef4444"
                fill="#ef444433"
                name="Dials"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="col-span-4" title="Number of Uploads">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie
                data={numberOfUploads}
                dataKey="value"
                nameKey="name"
                cx="50%"
                innerRadius={80}
                outerRadius={96}
                fill="#ef4444"
                label={({ name, value }) => `${value}`}
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
      </div>
    </div>
  );
}

"use client";

import { apiClient } from "@/lib/axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Card from "@/components/ui/card/Card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie } from "recharts";

interface Client {
  id: number;
  name: string;
}

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
    { name: "Jan", conversion: 25 },
    { name: "Feb", conversion: 35 },
    { name: "Mar", conversion: 20 },
    { name: "Apr", conversion: 40 },
    { name: "May", conversion: 30 },
    { name: "Jun", conversion: 50 },
    { name: "Jul", conversion: 10 },
    { name: "Aug", conversion: 60 }
  ];
  const numberOfContacts = [
    { name: "Jan", contacts: 200 },
    { name: "Feb", contacts: 300 },
    { name: "Mar", contacts: 250 },
    { name: "Apr", contacts: 400 },
    { name: "May", contacts: 350 },
    { name: "Jun", contacts: 450 },
    { name: "Jul", contacts: 150 },
    { name: "Aug", contacts: 500 }
  ];
  const numberOfDial = [
    { name: "Jan", dials: 500 },
    { name: "Feb", dials: 700 },
    { name: "Mar", dials: 600 },
    { name: "Apr", dials: 800 },
    { name: "May", dials: 750 },
    { name: "Jun", dials: 900 },
    { name: "Jul", dials: 400 },
    { name: "Aug", dials: 950 }
  ];
  const numberOfUploads = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 300 },
    { name: "Apr", value: 200 },
    { name: "May", value: 278 },
    { name: "Jun", value: 189 },
    { name: "Jul", value: 239 },
    { name: "Aug", value: 349 }
  ];

  return (
    <div className="dashboard-content">
      <h3 className="text-2xl font-semibold mb-4">Dashboard</h3>
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-6" title="Conversion Percentage">
          <ResponsiveContainer width="100%" height={ 260 }>
            <BarChart data={ conversionPercentage } margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={ ( value ) => `${ value }%` } />
              <Tooltip formatter={ ( value ) => `${ value }%` } />
              <Bar dataKey="conversion" fill="#ef4444" radius={ [ 8, 8, 0, 0 ] } />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="col-span-12 lg:col-span-6" title="Number of Contacts">
          <ResponsiveContainer width="100%" height={ 260 }>
            <LineChart data={ numberOfContacts } margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="contacts" stroke="#ef4444" strokeWidth={ 2 } dot={ { r: 4 } } activeDot={ { r: 6 } } />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="col-span-12 lg:col-span-6 xl:col-span-8" title="Number of Dials">
          <ResponsiveContainer width="100%" height={ 260 }>
            <AreaChart data={ numberOfDial } margin={ { top: 0, right: 0, left: 0, bottom: 0 } }>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="dials" stroke="#ef4444" fill="#ef444433" name="Dials" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="col-span-12 lg:col-span-6 xl:col-span-4" title="Number of Uploads">
          <ResponsiveContainer width="100%" height={ 260 }>
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Tooltip />
              <Pie data={ numberOfUploads } dataKey="value" nameKey="name" cx="50%" innerRadius={ 80 } outerRadius={ 96 } fill="#ef4444" label />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

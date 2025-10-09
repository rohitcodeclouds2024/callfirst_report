"use client";

import { apiClient } from "@/lib/axios";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/app/context/AppProvider";
import ConversionPercentage from "@/components/ui/reports/graphs/ConversionPercentage";
import NumberContacts from "@/components/ui/reports/graphs/NumberContacts";
import DialedNumber from "@/components/ui/reports/graphs/DialedNumber";
import LeadUploadPieGraph from "@/components/ui/reports/graphs/LeadUploadPieGraph";

export default function Dashboard() {
  const { clients } = useAppContext();

  // Filter states
  const [selectedClientId, setSelectedClientId] = useState<number | "">("");
  const [dateFilter, setDateFilter] = useState<
    "last7" | "previousWeek" | "custom"
  >("last7");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // Applied states (used for charts)
  const [appliedClientId, setAppliedClientId] = useState<number | "">("");
  const [appliedDateFilter, setAppliedDateFilter] = useState<
    "last7" | "previousWeek" | "custom"
  >("last7");
  const [appliedCustomRange, setAppliedCustomRange] = useState({
    start: "",
    end: "",
  });

  // Handle Apply button click
  const handleApply = () => {
    setAppliedClientId(selectedClientId);
    setAppliedDateFilter(dateFilter);
    setAppliedCustomRange(customRange);
  };

  useEffect(() => {
    if (clients.length > 0 && selectedClientId === "") {
      const firstValidClient = clients.find(
        (client) => client.id !== 0 && client.id !== null
      );
      if (firstValidClient) {
        setSelectedClientId(firstValidClient.id);
        setAppliedClientId(firstValidClient.id);
      }
    }
  }, [clients, selectedClientId]);

  return (
    <div className="dashboard-content">
      {/* Header with title and filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold mb-3 md:mb-0">Dashboard</h3>
        <div className="flex flex-wrap items-center gap-3">
          {/* Client Select */}
          <select
            className="w-full md:w-[220px] rounded-lg border border-border px-3 py-2 bg-background focus:outline-none focus:ring focus:ring-primary"
            value={selectedClientId}
            onChange={(e) =>
              setSelectedClientId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          {/* Date Filter Select */}
          <select
            className="w-full md:w-[180px] rounded-lg border border-border px-3 py-2 bg-background focus:outline-none focus:ring focus:ring-primary"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(
                e.target.value as "last7" | "previousWeek" | "custom"
              )
            }
          >
            <option value="last7">Last 7 Days</option>
            <option value="previousWeek">Previous Week</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Custom Date Range Pickers */}
          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="rounded-lg border border-border px-3 py-2 bg-background focus:outline-none focus:ring focus:ring-primary"
                value={customRange.start}
                onChange={(e) =>
                  setCustomRange({ ...customRange, start: e.target.value })
                }
              />
              <span>to</span>
              <input
                type="date"
                className="rounded-lg border border-border px-3 py-2 bg-background focus:outline-none focus:ring focus:ring-primary"
                value={customRange.end}
                onChange={(e) =>
                  setCustomRange({ ...customRange, end: e.target.value })
                }
              />
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Dashboard Charts */}
      <div className="grid grid-cols-12 gap-6">
        <ConversionPercentage
          selectedClientId={appliedClientId}
          dateFilter={appliedDateFilter}
          customRange={appliedCustomRange}
        />
        <NumberContacts
          selectedClientId={appliedClientId}
          dateFilter={appliedDateFilter}
          customRange={appliedCustomRange}
        />
        <DialedNumber
          selectedClientId={appliedClientId}
          dateFilter={appliedDateFilter}
          customRange={appliedCustomRange}
        />
        <LeadUploadPieGraph
          selectedClientId={appliedClientId}
          dateFilter={appliedDateFilter}
          customRange={appliedCustomRange}
        />
      </div>
    </div>
  );
}

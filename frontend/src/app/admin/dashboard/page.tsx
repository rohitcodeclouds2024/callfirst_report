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
    // console.log("clicked");
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-x-4 mb-6">
        <h3 className="text-2xl font-semibold mb-4 lg:mb-0">Dashboard</h3>
        <div className="grow flex flex-col sm:flex-row gap-2 items-center justify-end">
          <div className="w-full lg:w-1/5 xl:w-1/6">
            <select className="w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary" value={ selectedClientId } onChange={ ( e ) => setSelectedClientId( e.target.value ? Number( e.target.value ) : "" ) }>
              <option value="">Select Client</option>
              { clients.map( ( client ) => (
                <option key={ client.id } value={ client.id }>
                  { client.name }
                </option>
              ) ) }
            </select>
          </div>
          <div className="w-full lg:w-1/5 xl:w-1/6">
            <select className="w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary" value={ dateFilter } onChange={ ( e ) => setDateFilter( e.target.value as "last7" | "previousWeek" | "custom" ) }>
              <option value="last7">Last 7 Days</option>
              <option value="previousWeek">Previous Week</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          { dateFilter === "custom" && (
            <>
              <div className="w-full lg:w-1/5 xl:w-1/6">
                <input type="date" className="w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary" value={ customRange.start } onChange={ ( e ) => setCustomRange( { ...customRange, start: e.target.value } ) } />
              </div>
              <span className="block w-auto">to</span>
              <div className="w-full lg:w-1/5 xl:w-1/6">
                <input type="date" className="w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary" value={ customRange.end } onChange={ ( e ) => setCustomRange( { ...customRange, end: e.target.value } ) } />
              </div>
            </>
          ) }
          <button onClick={ handleApply } className="px-4 py-2 bg-primary text-white border border-primary rounded-md hover:text-primary hover:bg-transparent transition-all duration-300">Apply</button>
        </div>
      </div>
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

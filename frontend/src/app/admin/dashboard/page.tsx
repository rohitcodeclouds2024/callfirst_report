"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useApi from "../../../lib/useApi";

import {
  FaSyncAlt,
  FaExclamationTriangle,
  FaPhoneAlt,
  FaClock,
  FaClipboardList,
} from "react-icons/fa";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Agent-focused stats (mocked here; replace with API/socket)
  const [stats, setStats] = useState({
    totalCallsToday: 128,
    activeCalls: 2,
    avgHandleSeconds: 320,
    missedCalls: 4,
    syncErrors: 2,
    pendingCallbacks: 3,
    agentsOnline: 6,
    wrapUpTasks: 5,
  });

  const api = useApi();
  const [agents, setAgents] = useState<any[]>([]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark to-background">
        <p className="text-neutral text-lg">Loading...</p>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // action handlers (replace with real routes/modals)
  const openCalls = () => router.push("/admin/calls");
  const openAHTReport = () => router.push("/admin/reports/aht");
  const openLivePanel = () => router.push("/admin/call-panel");
  const openLogs = () => router.push("/admin/logs");
  const openCallbacks = () => router.push("/admin/callbacks");
  const openMissed = () => router.push("/admin/missed");
  const openAgentsPanel = () => router.push("/admin/agents");
  const openWrapUp = () => router.push("/admin/wrapups");

  return (
    <div className="min-h-screen bg-background text-neutral px-6 py-10 transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Greeting + status */}
        <section className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Welcome {session?.user?.name || "Admin"}!!!
          </h2>
        </section>

        {/* Primary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            icon={<FaPhoneAlt className="text-2xl" />}
            color="bg-emerald-500/20 text-emerald-400"
            title="Total Calls (Today)"
            value={stats.totalCallsToday}
            lines={[
              `Active: ${stats.activeCalls}`,
              `Missed: ${stats.missedCalls}`,
            ]}
            action={{
              label: "View Calls",
              color: "bg-emerald-500 hover:bg-emerald-600",
              onClick: openCalls,
            }}
          />

          <DashboardCard
            icon={<FaClock className="text-2xl" />}
            color="bg-indigo-500/20 text-indigo-400"
            title="Avg Handle Time"
            value={formatTime(stats.avgHandleSeconds)}
            lines={[`Pending Callbacks: ${stats.pendingCallbacks}`]}
            action={{
              label: "View AHT",
              color: "bg-indigo-500 hover:bg-indigo-600",
              onClick: openAHTReport,
            }}
          />

          <DashboardCard
            icon={<FaSyncAlt className="text-2xl" />}
            color="bg-yellow-500/20 text-yellow-400"
            title="Active Calls"
            value={stats.activeCalls}
            lines={["Click to join / monitor"]}
            action={{
              label: "Open Call Panel",
              color: "bg-yellow-500 hover:bg-yellow-600",
              onClick: openLivePanel,
            }}
          />

          <DashboardCard
            icon={<FaExclamationTriangle className="text-2xl" />}
            color="bg-red-500/20 text-red-400"
            title="Sync Errors"
            value={stats.syncErrors}
            lines={[`${stats.syncErrors} failed orders`]}
            action={{
              label: "View Logs",
              color: "bg-red-500 hover:bg-red-600",
              onClick: openLogs,
            }}
          />
        </section>

        {/* Secondary quick actions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard
            title="Pending Callbacks"
            count={stats.pendingCallbacks}
            colorClass="bg-amber-50 text-amber-700"
            onClick={openCallbacks}
          />
          <ActionCard
            title="Missed Calls"
            count={stats.missedCalls}
            colorClass="bg-rose-50 text-rose-700"
            onClick={openMissed}
          />
          <ActionCard
            title="Agents Online"
            count={stats.agentsOnline}
            colorClass="bg-green-50 text-green-700"
            onClick={openAgentsPanel}
          />
          <ActionCard
            title="Wrap Up Tasks"
            count={stats.wrapUpTasks}
            colorClass="bg-sky-50 text-sky-700"
            onClick={openWrapUp}
          />
        </section>
      </div>
    </div>
  );
}

function DashboardCard({
  icon,
  color,
  title,
  lines,
  action,
  value,
}: {
  icon: JSX.Element;
  color: string;
  title: string;
  lines: string[];
  action?: { label: string; color: string; onClick?: () => void };
  value?: string | number;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border">
      <div className={`p-4 rounded-full inline-block ${color} mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {value !== undefined && (
        <div className="text-3xl font-bold mb-2">{value}</div>
      )}
      <div className="text-sm text-slate-500">
        {lines.map((l: string, i: number) => (
          <div key={i} className="mb-1">
            {l}
          </div>
        ))}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className={`${action.color} text-white px-4 py-2 rounded mt-4`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

function ActionCard({ title, count, colorClass, onClick }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border flex items-center justify-between">
      <div>
        <div className="text-sm text-slate-500">{title}</div>
        <div className="text-2xl font-bold">{count}</div>
      </div>
      <div>
        <button onClick={onClick} className={`px-3 py-1 rounded ${colorClass}`}>
          Open
        </button>
      </div>
    </div>
  );
}


import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

import StatsCard from "../../components/dashboard/StatsCard";
import SystemStatus from "../../components/dashboard/SystemStatus";
import RecentIncidents from "../../components/dashboard/RecentIncidents";
import IncidentSeverityChart from "../../components/dashboard/IncidentSeverityChart";

import { getIncidents } from "../../services/incidentService";

const DEFAULT_REFRESH_INTERVAL = 30;

function getRefreshInterval() {
  try {
    const saved = localStorage.getItem("devopspilot_preferences");

    if (!saved) return DEFAULT_REFRESH_INTERVAL;

    const preferences = JSON.parse(saved);
    const interval = Number(preferences.refreshInterval);

    return [15, 30, 60, 300].includes(interval)
      ? interval
      : DEFAULT_REFRESH_INTERVAL;
  } catch {
    return DEFAULT_REFRESH_INTERVAL;
  }
}

function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval] = useState(getRefreshInterval);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async (initialLoad = false) => {
      try {
        if (initialLoad && isMounted) {
          setLoading(true);
        }

        const response = await getIncidents({
          limit: 100,
          page: 1,
        });

        if (isMounted) {
          setIncidents(response?.incidents || []);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);

        if (initialLoad && isMounted) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load dashboard data"
          );
        }
      } finally {
        if (initialLoad && isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial data fetch
    fetchDashboardData(true);

    // Automatically refresh incidents
    const intervalId = setInterval(() => {
      fetchDashboardData(false);
    }, refreshInterval * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [refreshInterval]);

  const totalIncidents = incidents.length;

  const openIncidents = incidents.filter(
    (incident) => incident.status === "open"
  ).length;

  const investigatingIncidents = incidents.filter(
    (incident) => incident.status === "investigating"
  ).length;

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "resolved"
  ).length;

  const stats = [
    {
      title: "Total Incidents",
      value: totalIncidents,
      icon: AlertCircle,
      description: "Recorded incidents",
    },
    {
      title: "Open Incidents",
      value: openIncidents,
      icon: Activity,
      description: "Awaiting investigation",
    },
    {
      title: "Investigating",
      value: investigatingIncidents,
      icon: Clock,
      description: "Currently being investigated",
    },
    {
      title: "Resolved Incidents",
      value: resolvedIncidents,
      icon: CheckCircle2,
      description: "Successfully resolved",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Overview
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Monitor your infrastructure and manage incidents.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          <span className="text-xs font-medium text-cyan-400">
            Auto-refresh: {refreshInterval >= 60
              ? `${refreshInterval / 60} minute${refreshInterval > 60 ? "s" : ""}`
              : `${refreshInterval} seconds`}
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            {...stat}
            value={loading ? "..." : stat.value}
          />
        ))}
      </div>

      {/* Charts and System Health */}
      <div className="grid gap-6 xl:grid-cols-2">
        <IncidentSeverityChart incidents={incidents} />
        <SystemStatus />
      </div>

      {/* Recent Incidents */}
      <RecentIncidents
        incidents={incidents}
        loading={loading}
      />
    </div>
  );
}

export default Dashboard;

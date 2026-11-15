
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  Server,
  Database,
  Wifi,
  Bot,
} from "lucide-react";

import {
  getBackendHealth,
  getDatabaseHealth,
  getRedisHealth,
  getWorkerHealth,
} from "../../services/healthService";

const serviceConfig = [
  {
    name: "Backend API",
    key: "backend",
    icon: Server,
    check: getBackendHealth,
  },
  {
    name: "MongoDB",
    key: "database",
    icon: Database,
    check: getDatabaseHealth,
  },
  {
    name: "Redis",
    key: "redis",
    icon: Wifi,
    check: getRedisHealth,
  },
  {
    name: "AI Worker",
    key: "worker",
    icon: Bot,
    check: getWorkerHealth,
  },
];

const normalizeStatus = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    ["healthy", "connected", "operational", "running"].includes(value)
  ) {
    return "Operational";
  }

  if (
    ["unhealthy", "disconnected", "failed", "error"].includes(value)
  ) {
    return "Unavailable";
  }

  return "Unknown";
};

const getRefreshInterval = () => {
  try {
    const saved = localStorage.getItem("devopspilot_preferences");

    if (!saved) return 30;

    const preferences = JSON.parse(saved);
    const interval = Number(preferences.refreshInterval);

    return [15, 30, 60, 300].includes(interval) ? interval : 30;
  } catch {
    return 30;
  }
};

function SystemStatus() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [refreshInterval] = useState(getRefreshInterval);

  const fetchSystemStatus = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const results = await Promise.all(
        serviceConfig.map(async (service) => {
          try {
            const response = await service.check();
            const data = response?.data;

            return {
              ...service,
              status: normalizeStatus(data?.status),
              detail: data?.status || "Unknown",
            };
          } catch (error) {
            const data = error.response?.data?.data;

            return {
              ...service,
              status: normalizeStatus(data?.status),
              detail:
                data?.status ||
                error.response?.data?.message ||
                "Health check failed",
            };
          }
        })
      );

      setServices(results);
      setLastChecked(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemStatus();

    const intervalId = setInterval(() => {
      fetchSystemStatus(true);
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [fetchSystemStatus, refreshInterval]);

  const operationalCount = services.filter(
    (service) => service.status === "Operational"
  ).length;

  return (
    <section className="panel p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">System Health</h3>
          <p className="mt-1 text-xs text-slate-500">
            Live infrastructure service status
          </p>
        </div>

        <button
          onClick={() => fetchSystemStatus(true)}
          disabled={loading || refreshing}
          title="Refresh system health"
          className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-500 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />
        </button>
      </div>

      {!loading && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" />
            <span className="text-xs text-slate-400">
              Services operational
            </span>
          </div>

          <span className="text-sm font-semibold text-white">
            {operationalCount}/{serviceConfig.length}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
            <LoaderCircle size={18} className="animate-spin" />
            Checking system health...
          </div>
        ) : (
          services.map((service) => {
            const Icon = service.icon;
            const isOperational = service.status === "Operational";
            const isUnknown = service.status === "Unknown";

            return (
              <div
                key={service.key}
                className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      isOperational
                        ? "bg-green-500/10"
                        : isUnknown
                          ? "bg-yellow-500/10"
                          : "bg-red-500/10"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={
                        isOperational
                          ? "text-green-400"
                          : isUnknown
                            ? "text-yellow-400"
                            : "text-red-400"
                      }
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {service.name}
                    </p>

                    <p
                      className={`mt-1 flex items-center gap-1 text-xs ${
                        isOperational
                          ? "text-green-400"
                          : isUnknown
                            ? "text-yellow-400"
                            : "text-red-400"
                      }`}
                    >
                      {isOperational ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <AlertCircle size={12} />
                      )}

                      {service.status}
                    </p>
                  </div>
                </div>

                <span
                  className="max-w-[120px] truncate text-right text-xs text-slate-500"
                  title={service.detail}
                >
                  {service.detail}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500">
          {lastChecked
            ? `Last checked: ${lastChecked.toLocaleTimeString()}`
            : "Waiting for health check..."}
        </p>

        <p className="text-[11px] text-slate-500">
          Auto-refresh: {refreshInterval >= 60
            ? `${refreshInterval / 60} min`
            : `${refreshInterval} sec`}
        </p>
      </div>
    </section>
  );
}

export default SystemStatus;

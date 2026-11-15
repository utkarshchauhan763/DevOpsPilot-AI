
import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Server,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LoaderCircle,
  Wifi,
} from "lucide-react";

import {
  getBackendHealth,
  getDatabaseHealth,
  getRedisHealth,
  getWorkerHealth,
} from "../../services/healthService";

const initialServices = [
  {
    name: "Backend API",
    description: "Node.js and Express server",
    status: "Checking",
    responseTime: "—",
    error: null,
    icon: Server,
    check: getBackendHealth,
    validate: (response) =>
      response?.success === true &&
      response?.data?.status === "healthy",
  },
  {
    name: "MongoDB",
    description: "Primary database",
    status: "Checking",
    responseTime: "—",
    error: null,
    icon: Database,
    check: getDatabaseHealth,
    validate: (response) =>
      response?.success === true &&
      response?.data?.status === "connected" &&
      response?.data?.readyState === 1,
  },
  {
    name: "Redis",
    description: "Cache and queue management",
    status: "Checking",
    responseTime: "—",
    error: null,
    icon: Activity,
    check: getRedisHealth,
    validate: (response) =>
      response?.success === true &&
      response?.data?.status === "connected" &&
      response?.data?.response === "PONG",
  },
  {
    name: "AI Worker",
    description: "AI incident analysis service",
    status: "Checking",
    responseTime: "—",
    error: null,
    icon: Cpu,
    check: getWorkerHealth,
    validate: (response) =>
      response?.success === true &&
      response?.data?.status === "healthy",
  },
];

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

function SystemHealth() {
  const [services, setServices] = useState(initialServices);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [refreshInterval] = useState(getRefreshInterval);

  const checkServicesHealth = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const results = await Promise.all(
        initialServices.map(async (service) => {
          const startTime = performance.now();

          try {
            const response = await service.check();
            const responseTime = Math.round(
              performance.now() - startTime
            );

            const healthy = service.validate(response);

            return {
              ...service,
              status: healthy ? "Operational" : "Degraded",
              responseTime: `${responseTime} ms`,
              error: healthy
                ? null
                : response?.message || "Health check failed",
            };
          } catch (error) {
            return {
              ...service,
              status: "Unavailable",
              responseTime: "—",
              error:
                error.response?.data?.message ||
                error.message ||
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
    let isMounted = true;
    let isChecking = false;

    const runHealthCheck = async (manual = false) => {
      if (isChecking || !isMounted) return;

      isChecking = true;

      try {
        await checkServicesHealth(manual);
      } finally {
        isChecking = false;
      }
    };

    runHealthCheck();

    const intervalId = setInterval(() => {
      runHealthCheck();
    }, refreshInterval * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [checkServicesHealth, refreshInterval]);

  const operationalCount = services.filter(
    (service) => service.status === "Operational"
  ).length;

  const issueCount = services.filter(
    (service) =>
      service.status === "Unavailable" ||
      service.status === "Degraded"
  ).length;

  const allOperational = operationalCount === services.length;
  const hasIssues = issueCount > 0;

  const overallStatus = hasIssues
    ? "Service Issues Detected"
    : allOperational
      ? "All Systems Operational"
      : "Checking System Health";

  const getStatusStyle = (status) => {
    switch (status) {
      case "Operational":
        return "bg-emerald-500/10 text-emerald-400";

      case "Checking":
        return "bg-blue-500/10 text-blue-400";

      case "Unavailable":
      case "Degraded":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  const formatRefreshInterval = () => {
    return refreshInterval >= 60
      ? `${refreshInterval / 60} minute${refreshInterval > 60 ? "s" : ""}`
      : `${refreshInterval} seconds`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            System Health
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Monitor the availability and performance of your services.
          </p>
        </div>

        <button
          onClick={() => checkServicesHealth(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading || refreshing ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {/* Overall System Status */}
      <div className="panel flex items-center gap-4 p-5">
        <div
          className={`rounded-xl p-3 ${
            hasIssues ? "bg-red-500/10" : "bg-emerald-500/10"
          }`}
        >
          {hasIssues ? (
            <AlertTriangle className="h-7 w-7 text-red-400" />
          ) : (
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          )}
        </div>

        <div>
          <h2 className="font-semibold text-white">
            {overallStatus}
          </h2>

          <p className="text-sm text-slate-400">
            {hasIssues
              ? `${issueCount} service(s) require attention.`
              : `${operationalCount} of ${services.length} services operational.`}
          </p>
        </div>

        <span
          className={`ml-auto hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-block ${
            hasIssues
              ? "bg-red-500/10 text-red-400"
              : allOperational
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-blue-500/10 text-blue-400"
          }`}
        >
          {hasIssues
            ? "Issues"
            : allOperational
              ? "Healthy"
              : "Checking"}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          icon={Activity}
          label="Total Services"
          value={services.length}
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Operational"
          value={operationalCount}
        />

        <SummaryCard
          icon={AlertTriangle}
          label="Service Issues"
          value={issueCount}
        />
      </div>

      {/* Individual Service Status */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Service Status
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.name}
                className="panel panel-hover p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-slate-800 p-3">
                      <Icon className="h-5 w-5 text-cyan-400" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        {service.name}
                      </h3>

                      <p className="text-sm text-slate-400">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${getStatusStyle(
                      service.status
                    )}`}
                  >
                    {service.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Availability
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {service.status}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Response Time
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {service.responseTime}
                    </p>
                  </div>
                </div>

                {service.error && (
                  <p className="mt-3 break-words text-xs text-red-400">
                    {service.error}
                  </p>
                )}

                <p className="mt-3 text-xs text-cyan-400">
                  Live API monitoring
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monitoring Information */}
      <div className="panel flex items-start gap-3 p-4">
        {loading || refreshing ? (
          <LoaderCircle className="h-5 w-5 animate-spin text-cyan-400" />
        ) : (
          <Wifi className="h-5 w-5 text-cyan-400" />
        )}

        <div>
          <p className="text-sm text-slate-300">
            Backend API, MongoDB, Redis, and AI Worker are monitored
            through live health checks.
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Automatic refresh every {formatRefreshInterval()}.
            {lastChecked &&
              ` Last checked: ${lastChecked.toLocaleTimeString()}`}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>

      <p className="mt-3 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

export default SystemHealth;

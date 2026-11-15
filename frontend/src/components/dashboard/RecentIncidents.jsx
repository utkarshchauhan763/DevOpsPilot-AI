import { AlertTriangle, Clock } from "lucide-react";

const severityStyles = {
  critical: "bg-red-500/10 text-red-400",
  high: "bg-orange-500/10 text-orange-400",
  medium: "bg-yellow-500/10 text-yellow-400",
  low: "bg-cyan-500/10 text-cyan-400",
};

const statusStyles = {
  open: "text-red-400",
  investigating: "text-cyan-400",
  resolved: "text-green-400",
};

function RecentIncidents({ incidents = [], loading = false }) {
  const recentIncidents = [...incidents]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  return (
    <section className="panel p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">
            Recent Incidents
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Latest infrastructure alerts
          </p>
        </div>

        <AlertTriangle size={20} className="text-cyan-400" />
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">
          Loading incidents...
        </p>
      ) : recentIncidents.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          No incidents reported yet.
        </p>
      ) : (
        <div className="space-y-4">
          {recentIncidents.map((incident) => {
            const severity = incident.severity?.toLowerCase();
            const status = incident.status?.toLowerCase();

            return (
              <div
                key={incident._id}
                className="rounded-lg border border-slate-800 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      {incident._id}
                    </p>

                    <h4 className="mt-1 text-sm font-medium text-white">
                      {incident.title}
                    </h4>
                  </div>

                  <span
                    className={`rounded-md px-2 py-1 text-xs ${
                      severityStyles[severity] ||
                      "bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {severity || "Unknown"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`text-xs ${
                      statusStyles[status] || "text-slate-400"
                    }`}
                  >
                    {status || "Unknown"}
                  </span>

                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={12} />
                    {incident.createdAt
                      ? new Date(incident.createdAt).toLocaleString()
                      : "Date unavailable"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RecentIncidents;
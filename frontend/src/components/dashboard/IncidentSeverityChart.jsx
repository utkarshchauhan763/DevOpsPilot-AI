import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#06b6d4",
};

function IncidentSeverityChart({ incidents = [] }) {
  const data = ["critical", "high", "medium", "low"].map((severity) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: incidents.filter(
      (incident) => incident.severity?.toLowerCase() === severity
    ).length,
  }));

  const hasData = data.some((item) => item.value > 0);

  return (
    <section className="panel p-5">
      <h3 className="font-semibold text-white">
        Incident Severity
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        Distribution of reported incidents
      </p>

      <div className="mt-5 h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name]}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "1px solid #263449",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No incident data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[item.name] }}
            />

            <span className="text-xs text-slate-400">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default IncidentSeverityChart;
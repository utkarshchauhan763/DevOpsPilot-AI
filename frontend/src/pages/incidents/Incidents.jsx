
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";

import IncidentForm from "../../components/incidents/IncidentForm";
import IncidentDetails from "../../components/incidents/IncidentDetails";

import {
  getIncidents,
  getIncidentById,
  createIncident as createIncidentAPI,
  updateIncident,
} from "../../services/incidentService";

const severityStyles = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

const statusStyles = {
  open: "bg-red-500/10 text-red-400",
  investigating: "bg-cyan-500/10 text-cyan-400",
  resolved: "bg-green-500/10 text-green-400",
};

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleString();
};

function Incidents() {
  const [incidents, setIncidents] = useState([]);

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");

  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [updatingIncidentId, setUpdatingIncidentId] = useState(null);

  const requestIdRef = useRef(0);

  // Fetch incidents from backend
  const fetchIncidents = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);

      const params = {
        limit: 100,
        page: 1,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (severity !== "All") {
        params.severity = severity;
      }

      if (status !== "All") {
        params.status = status;
      }

      const data = await getIncidents(params);

      // Ignore outdated search/filter responses.
      if (requestId !== requestIdRef.current) return;

      const records = Array.isArray(data)
        ? data
        : data?.incidents || [];

      setIncidents(records);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      toast.error(
        error.response?.data?.message || "Failed to fetch incidents"
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [search, severity, status]);

  // Debounced search and filter changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchIncidents();
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchIncidents]);

  // Create incident
  const handleCreateIncident = async (formData) => {
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        service: formData.service,
        severity: String(formData.severity || "medium").toLowerCase(),
        status: "open",
        logs: formData.logs || "",
      };

      await createIncidentAPI(payload);

      toast.success("Incident created successfully");
      setShowCreateForm(false);

      await fetchIncidents();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create incident"
      );
    }
  };

  // Update incident status
  const handleStatusChange = async (incidentId, newStatus) => {
    if (updatingIncidentId) return;

    const previousIncident = incidents.find(
      (incident) => incident._id === incidentId
    );

    if (!previousIncident || previousIncident.status === newStatus) return;

    try {
      setUpdatingIncidentId(incidentId);

      const updatedIncident = await updateIncident(incidentId, {
        status: newStatus,
      });

      setIncidents((previous) =>
        previous.map((incident) =>
          incident._id === incidentId
            ? { ...incident, ...updatedIncident }
            : incident
        )
      );

      toast.success("Incident status updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update status"
      );
    } finally {
      setUpdatingIncidentId(null);
    }
  };

  // Fetch incident details
  const handleViewIncident = async (incidentId) => {
    try {
      const incident = await getIncidentById(incidentId);
      setSelectedIncident(incident);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch incident details"
      );
    }
  };

  // Summary counts reflect the currently displayed results.
  const summary = [
    {
      label: "Total Incidents",
      value: incidents.length,
    },
    {
      label: "Open",
      value: incidents.filter((item) => item.status === "open").length,
    },
    {
      label: "Investigating",
      value: incidents.filter((item) => item.status === "investigating").length,
    },
    {
      label: "Resolved",
      value: incidents.filter((item) => item.status === "resolved").length,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Incident Management
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Monitor, investigate and manage infrastructure incidents.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={18} />
          Create Incident
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="panel p-5">
            <p className="text-sm text-slate-400">{item.label}</p>

            <h2 className="mt-3 text-3xl font-bold text-white">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Filters */}
      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-cyan-400" />
          <h3 className="font-semibold text-white">
            Filter Incidents
          </h3>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3">
            <Search size={17} className="text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search incidents..."
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500"
          >
            <option value="All">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-300 outline-none focus:border-cyan-500"
          >
            <option value="All">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </section>

      {/* Incidents Table */}
      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <h3 className="font-semibold text-white">
              All Incidents
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {incidents.length} incidents found
            </p>
          </div>

          <AlertTriangle size={20} className="text-cyan-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-900/70 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Incident</th>
                <th className="px-5 py-4 font-medium">Service</th>
                <th className="px-5 py-4 font-medium">Severity</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Created</th>
                <th className="px-5 py-4 font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    Loading incidents...
                  </td>
                </tr>
              ) : (
                <>
                  {incidents.map((incident) => (
                    <tr
                      key={incident._id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <p className="text-xs text-slate-500">
                          {incident._id}
                        </p>

                        <p className="mt-1 text-sm font-medium text-white">
                          {incident.title}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {incident.service || "N/A"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-md border px-2 py-1 text-xs ${
                            severityStyles[incident.severity] ||
                            "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}
                        >
                          {incident.severity || "N/A"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={incident.status}
                          disabled={updatingIncidentId === incident._id}
                          onChange={(event) =>
                            handleStatusChange(
                              incident._id,
                              event.target.value
                            )
                          }
                          className={`rounded-md border-0 px-2 py-1.5 text-xs outline-none disabled:cursor-wait disabled:opacity-50 ${
                            statusStyles[incident.status] ||
                            "bg-slate-500/10 text-slate-400"
                          }`}
                        >
                          <option value="open">Open</option>
                          <option value="investigating">Investigating</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock size={13} />
                          {formatDate(incident.createdAt)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleViewIncident(incident._id)}
                          title="View incident"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                        >
                          <Eye size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {incidents.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-12 text-center text-sm text-slate-400"
                      >
                        No incidents match your filters.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create Incident Modal */}
      {showCreateForm && (
        <IncidentForm
          onClose={() => setShowCreateForm(false)}
          onCreate={handleCreateIncident}
        />
      )}

      {/* Incident Details Modal */}
      {selectedIncident && (
        <IncidentDetails
          incident={{
            ...selectedIncident,
            id: selectedIncident._id,
            createdAt: formatDate(selectedIncident.createdAt),
            severity: selectedIncident.severity
              ? selectedIncident.severity.charAt(0).toUpperCase() +
                selectedIncident.severity.slice(1)
              : "N/A",
            status: selectedIncident.status
              ? selectedIncident.status.charAt(0).toUpperCase() +
                selectedIncident.status.slice(1)
              : "N/A",
          }}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}

export default Incidents;

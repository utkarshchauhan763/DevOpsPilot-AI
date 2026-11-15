import { useState } from "react";
import { X } from "lucide-react";

function IncidentForm({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    service: "Backend API",
    severity: "Medium",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      service: formData.service,
      severity: formData.severity,
    };

    if (!payload.title || !payload.description) {
      setError("Please enter an incident title and description.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await onCreate(payload);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create incident");

      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incident-form-title"
    >
      <div className="panel w-full max-w-lg p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2
              id="incident-form-title"
              className="text-xl font-bold text-white"
            >
              Create Incident
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Report a new infrastructure incident.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close form"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="incident-title"
              className="mb-2 block text-sm text-slate-300"
            >
              Incident Title
            </label>

            <input
              id="incident-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Database Connection Timeout"
              required
              maxLength={150}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="incident-description"
              className="mb-2 block text-sm text-slate-300"
            >
              Description
            </label>

            <textarea
              id="incident-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the incident..."
              rows={4}
              required
              maxLength={2000}
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-50"
            />
          </div>

          {/* Service */}
          <div>
            <label
              htmlFor="incident-service"
              className="mb-2 block text-sm text-slate-300"
            >
              Affected Service
            </label>

            <select
              id="incident-service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-50"
            >
              <option value="Backend API">Backend API</option>
              <option value="MongoDB">MongoDB</option>
              <option value="Redis">Redis</option>
              <option value="AI Worker">AI Worker</option>
              <option value="Frontend">Frontend</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label
              htmlFor="incident-severity"
              className="mb-2 block text-sm text-slate-300"
            >
              Severity
            </label>

            <select
              id="incident-severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-50"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IncidentForm;

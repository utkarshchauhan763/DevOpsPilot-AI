
import { useEffect, useState } from "react";
import {
  X,
  AlertTriangle,
  Clock,
  Server,
  Brain,
  CheckCircle,
  LoaderCircle,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

import { getIncidentAnalysis } from "../../services/incidentService";

function IncidentDetails({ incident, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState("");
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    const incidentId = incident?._id || incident?.id;

    if (!incidentId) {
      setAnalysisLoading(false);
      return;
    }

    let isMounted = true;
    let timeoutId;

    const fetchAnalysis = async () => {
      try {
        const data = await getIncidentAnalysis(incidentId);

        if (!isMounted) return;

        setAnalysis(data);
        setAnalysisError("");
        setAnalysisLoading(false);

        const status = data?.analysisStatus || "pending";

        // Continue polling while AI worker is processing.
        if (status === "pending" || status === "processing") {
          timeoutId = setTimeout(fetchAnalysis, 3000);
        }
      } catch (error) {
        if (!isMounted) return;

        setAnalysisError(
          error.response?.data?.message ||
            "Unable to fetch AI analysis."
        );

        setAnalysisLoading(false);
      }
    };

    setAnalysisLoading(true);
    setAnalysisError("");

    fetchAnalysis();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [incident?._id, incident?.id, retryAttempt]);

  if (!incident) return null;

  const analysisStatus = analysis?.analysisStatus || "pending";

  const statusConfig = {
    pending: {
      label: "Pending",
      color: "text-yellow-400",
      icon: Clock,
    },
    processing: {
      label: "Analyzing",
      color: "text-cyan-400",
      icon: LoaderCircle,
    },
    completed: {
      label: "Completed",
      color: "text-green-400",
      icon: CheckCircle,
    },
    failed: {
      label: "Failed",
      color: "text-red-400",
      icon: AlertCircle,
    },
  };

  const currentStatus =
    statusConfig[analysisStatus] || statusConfig.pending;

  const StatusIcon = currentStatus.icon;
  const aiData = analysis?.aiAnalysis;

  const hasAnalysis =
    aiData &&
    typeof aiData === "object" &&
    (aiData.rootCause ||
      aiData.impact ||
      (Array.isArray(aiData.troubleshootingSteps) &&
        aiData.troubleshootingSteps.length > 0) ||
      (Array.isArray(aiData.prevention) &&
        aiData.prevention.length > 0));

  const handleRetry = () => {
    setAnalysis(null);
    setAnalysisError("");
    setAnalysisLoading(true);
    setRetryAttempt((previous) => previous + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incident-details-title"
    >
      <div className="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs text-cyan-400">
              {incident.id || incident._id}
            </p>

            <h2
              id="incident-details-title"
              className="mt-2 text-xl font-bold text-white"
            >
              {incident.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Close incident details"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Incident Description */}
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">
              Description
            </p>

            <p className="text-sm leading-6 text-slate-300">
              {incident.description || "No description provided."}
            </p>
          </div>

          {/* Incident Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-900 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <AlertTriangle size={16} />
                <span className="text-xs">Severity</span>
              </div>

              <p className="font-medium text-white">
                {incident.severity || "N/A"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-900 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <Server size={16} />
                <span className="text-xs">Affected Service</span>
              </div>

              <p className="font-medium text-white">
                {incident.service || "N/A"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-900 p-4">
              <p className="mb-2 text-xs text-slate-400">
                Current Status
              </p>

              <p className="font-medium text-cyan-400">
                {incident.status || "N/A"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-900 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <Clock size={16} />
                <span className="text-xs">Created</span>
              </div>

              <p className="text-sm font-medium text-white">
                {incident.createdAt || "N/A"}
              </p>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="border-t border-slate-800 pt-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Brain size={21} className="text-cyan-400" />

                <h3 className="text-lg font-semibold text-white">
                  AI Incident Analysis
                </h3>
              </div>

              <div
                className={`flex items-center gap-2 text-xs font-medium ${currentStatus.color}`}
              >
                <StatusIcon
                  size={15}
                  className={
                    analysisStatus === "processing"
                      ? "animate-spin"
                      : ""
                  }
                />

                {currentStatus.label}
              </div>
            </div>

            {/* Loading */}
            {analysisLoading && (
              <div className="rounded-lg bg-slate-900 p-6 text-center">
                <LoaderCircle
                  size={28}
                  className="mx-auto animate-spin text-cyan-400"
                />

                <p className="mt-3 text-sm text-slate-300">
                  Fetching AI analysis...
                </p>
              </div>
            )}

            {/* Pending / Processing */}
            {!analysisLoading &&
              !analysisError &&
              (analysisStatus === "pending" ||
                analysisStatus === "processing") && (
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-6 text-center">
                  <Brain
                    size={30}
                    className="mx-auto text-cyan-400"
                  />

                  <h4 className="mt-3 font-semibold text-white">
                    {analysisStatus === "pending"
                      ? "Waiting for AI Worker"
                      : "Analyzing Your Incident"}
                  </h4>

                  <p className="mt-2 text-sm text-slate-400">
                    {analysisStatus === "pending"
                      ? "Your incident is waiting in the analysis queue."
                      : "The AI worker is investigating the incident and generating recommendations."}
                  </p>

                  <p className="mt-3 text-xs text-slate-500">
                    This section refreshes automatically.
                  </p>
                </div>
              )}

            {/* Analysis Failed */}
            {!analysisLoading &&
              !analysisError &&
              analysisStatus === "failed" && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-5">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle size={19} />

                    <h4 className="font-semibold">
                      Analysis Failed
                    </h4>
                  </div>

                  <p className="mt-3 text-sm text-slate-300">
                    {analysis?.analysisError ||
                      "The AI worker could not complete the analysis."}
                  </p>
                </div>
              )}

            {/* Completed Analysis */}
            {!analysisLoading &&
              !analysisError &&
              analysisStatus === "completed" && (
                <div className="space-y-4">
                  {hasAnalysis ? (
                    <>
                      {/* Root Cause */}
                      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                          <AlertTriangle
                            size={17}
                            className="text-orange-400"
                          />
                          Root Cause
                        </h4>

                        <p className="text-sm leading-6 text-slate-300">
                          {aiData.rootCause || "Not available."}
                        </p>
                      </div>

                      {/* Impact */}
                      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                          <AlertCircle
                            size={17}
                            className="text-yellow-400"
                          />
                          Impact Assessment
                        </h4>

                        <p className="text-sm leading-6 text-slate-300">
                          {aiData.impact || "Not available."}
                        </p>
                      </div>

                      {/* Troubleshooting */}
                      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                          <Lightbulb
                            size={17}
                            className="text-cyan-400"
                          />
                          Troubleshooting Steps
                        </h4>

                        {Array.isArray(aiData.troubleshootingSteps) &&
                        aiData.troubleshootingSteps.length > 0 ? (
                          <ol className="list-inside list-decimal space-y-2 text-sm leading-6 text-slate-300">
                            {aiData.troubleshootingSteps.map(
                              (step, index) => (
                                <li key={index}>{step}</li>
                              )
                            )}
                          </ol>
                        ) : (
                          <p className="text-sm text-slate-400">
                            No troubleshooting steps available.
                          </p>
                        )}
                      </div>

                      {/* Prevention */}
                      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                        <h4 className="mb-3 flex items-center gap-2 font-semibold text-white">
                          <ShieldCheck
                            size={17}
                            className="text-green-400"
                          />
                          Prevention Recommendations
                        </h4>

                        {Array.isArray(aiData.prevention) &&
                        aiData.prevention.length > 0 ? (
                          <ul className="list-inside list-disc space-y-2 text-sm leading-6 text-slate-300">
                            {aiData.prevention.map(
                              (item, index) => (
                                <li key={index}>{item}</li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-400">
                            No prevention recommendations available.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg bg-slate-900 p-5 text-sm text-slate-400">
                      The analysis completed, but no analysis details were returned.
                    </div>
                  )}

                  {analysis?.analysisCompletedAt && (
                    <p className="text-xs text-slate-500">
                      Completed at:{" "}
                      {new Date(
                        analysis.analysisCompletedAt
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

            {/* API Error */}
            {analysisError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm text-red-400">
                  {analysisError}
                </p>

                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-3 flex items-center gap-2 text-xs text-cyan-400 transition hover:text-cyan-300"
                >
                  <RefreshCw size={14} />
                  Retry AI Analysis
                </button>
              </div>
            )}

            {/* Retry completed/failed analysis */}
            {!analysisLoading &&
              !analysisError &&
              (analysisStatus === "failed" ||
                analysisStatus === "completed") && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-4 flex items-center gap-2 text-xs text-cyan-400 transition hover:text-cyan-300"
                >
                  <RefreshCw size={14} />
                  Refresh Analysis
                </button>
              )}
          </div>
        </div>

        {/* Footer */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-slate-800 py-3 text-sm text-white transition hover:bg-slate-700"
        >
          Close Details
        </button>
      </div>
    </div>
  );
}

export default IncidentDetails;

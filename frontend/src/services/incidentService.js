
import api from "./api";

// Fetch all incidents with optional filters and pagination
export const getIncidents = async (params = {}) => {
  const response = await api.get("/incidents", { params });
  return response.data.data;
};

// Fetch a single incident by ID
export const getIncidentById = async (id) => {
  const response = await api.get(`/incidents/${id}`);
  return response.data.data;
};

// Create a new incident
export const createIncident = async (incidentData) => {
  const response = await api.post("/incidents", incidentData);
  return response.data.data;
};

// Update an existing incident
export const updateIncident = async (id, updateData) => {
  const response = await api.patch(`/incidents/${id}`, updateData);
  return response.data.data;
};

// Delete an incident
export const deleteIncident = async (id) => {
  const response = await api.delete(`/incidents/${id}`);
  return response.data.data;
};

// Fetch AI analysis for an incident
export const getIncidentAnalysis = async (id) => {
  const response = await api.get(`/incidents/${id}/analysis`);
  return response.data.data;
};

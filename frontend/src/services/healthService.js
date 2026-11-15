import api from "./api";

export const getBackendHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

export const getDatabaseHealth = async () => {
  const response = await api.get("/health/database");
  return response.data;
};

export const getRedisHealth = async () => {
  const response = await api.get("/health/redis");
  return response.data;
};

export const getWorkerHealth = async () => {
  const response = await api.get("/health/worker");
  return response.data;
};
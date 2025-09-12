import { apiClient } from "../api-client"

export interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded"
  timestamp: string
  version: string
  uptime: number
}

export class HealthService {
  async getHealth(): Promise<HealthStatus> {
    return apiClient.get<HealthStatus>("/api/Health")
  }

  async ping(): Promise<{ message: string; timestamp: string }> {
    return apiClient.get("/api/Health/ping")
  }

  async ready(): Promise<HealthStatus> {
    return apiClient.get<HealthStatus>("/api/Health/ready")
  }

  async live(): Promise<HealthStatus> {
    return apiClient.get<HealthStatus>("/api/Health/live")
  }
}

export const healthService = new HealthService()

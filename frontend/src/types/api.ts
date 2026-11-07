/** Shape returned by GET /api/health */
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

/** Standard API error envelope */
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

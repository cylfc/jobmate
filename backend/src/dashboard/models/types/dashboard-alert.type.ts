/**
 * Dashboard Alert Response Type
 */
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface DashboardAlert {
  id: string;
  type: string;
  message: string;
  actionUrl: string;
  severity: AlertSeverity;
}

export interface DashboardAlertsResponse {
  alerts: DashboardAlert[];
}


/**
 * Dashboard Activity Response Type
 */
export type ActivityType = 'cv_uploaded' | 'job_saved' | 'matching_completed' | 'interview_scheduled';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  occurredAt: string; // ISO string
  meta?: Record<string, unknown>;
}

export interface DashboardActivitiesResponse {
  events: ActivityEvent[];
  nextCursor?: string | null;
  hasMore?: boolean;
}



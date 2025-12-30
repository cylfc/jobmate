/**
 * Active Job Response Type
 */
export type JobStatusForDashboard = 'published' | 'draft' | 'closed';

export interface ActiveJob {
  id: string;
  title: string;
  status: JobStatusForDashboard;
  candidatesCount: number;
  topMatchScore: number | null;
  lastActivityAt: string; // ISO string
  lastMatchingRunAt: string | null; // ISO string
}

export interface ActiveJobsResponse {
  jobs: ActiveJob[];
}



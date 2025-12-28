import { Job } from '../../entities/job.entity';

export type JobResponse = Job;

export type JobListResponse = {
  items: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};


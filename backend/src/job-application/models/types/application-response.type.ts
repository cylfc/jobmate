import { JobApplication } from '../../entities/job-application.entity';

export type ApplicationResponse = JobApplication;

export type ApplicationListResponse = {
  items: JobApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};


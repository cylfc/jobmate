/**
 * Job Transformer
 * Transforms backend Job entities to frontend Job types
 */

import type { Job } from "@job/types/job";
import { BaseTransformer } from "./base-transformer";

/**
 * Backend Job type (from API response)
 */
export interface BackendJob {
  id: string;
  title: string;
  description?: string;
  company: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType: string;
  status: string; // DRAFT, PUBLISHED, CLOSED
  requirements: string[];
  benefits: string[];
  postedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  applications?: Array<{ id: string; status: string }>;
}

export class JobTransformer extends BaseTransformer<BackendJob, Job> {
  /**
   * Transform backend job to frontend job
   */
  transform(backend: BackendJob): Job {
    return {
      id: backend.id,
      title: backend.title,
      description: backend.description || "",
      company: backend.company,
      location: backend.location || "",
      requirements: backend.requirements || [],
      salary:
        backend.salaryMin && backend.salaryMax
          ? {
              min: Number(backend.salaryMin),
              max: Number(backend.salaryMax),
              currency: "USD", // Default currency, backend might not have this field
            }
          : undefined,
      status: backend.status.toLowerCase() as Job["status"], // DRAFT -> draft, PUBLISHED -> published, etc.
      candidates: backend.applications
        ? {
            active: backend.applications.filter(
              (app) => app.status === "PENDING" || app.status === "REVIEWING",
            ).length,
            total: backend.applications.length,
          }
        : undefined,
      createdAt: new Date(backend.createdAt),
      updatedAt: new Date(backend.updatedAt),
    };
  }
}

// Export singleton instance
export const jobTransformer = new JobTransformer();

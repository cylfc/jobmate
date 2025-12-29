import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Job, JobStatus } from '../../job/entities/job.entity';
import { JobApplication } from '../../job-application/entities/job-application.entity';
import { KpiService } from './kpi.service';
import { PipelineService } from './pipeline.service';
import { ActivityService } from './activity.service';
import { ActiveJob, ActiveJobsResponse } from '../models/types/active-job.type';
import { DashboardAlertsResponse, DashboardAlert, AlertSeverity } from '../models/types/dashboard-alert.type';
import { DashboardMatchingHealthResponse } from '../models/types/dashboard-matching-health.type';

/**
 * Dashboard Service
 * Main service orchestrating dashboard data aggregation
 */
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
    private readonly kpiService: KpiService,
    private readonly pipelineService: PipelineService,
    private readonly activityService: ActivityService,
  ) {}

  /**
   * Get active jobs with statistics
   */
  async getActiveJobs(userId: string, limit: number = 10): Promise<ActiveJobsResponse> {
    const jobs = await this.jobRepository.find({
      where: {
        createdById: userId,
      },
      order: { updatedAt: 'DESC' },
      take: limit,
      relations: ['applications'],
    });

    const activeJobs: ActiveJob[] = await Promise.all(
      jobs.map(async (job) => {
        // Count applications for this job
        const candidatesCount = await this.applicationRepository.count({
          where: { job: { id: job.id } },
        });

        // Get top match score (placeholder - will be null until matching is implemented)
        const topMatchScore = null; // TODO: Implement when match scores are available

        // Get last activity (most recent application or job update)
        const lastApplication = await this.applicationRepository.findOne({
          where: { job: { id: job.id } },
          order: { createdAt: 'DESC' },
        });

        const lastActivityAt = lastApplication
          ? lastApplication.createdAt.toISOString()
          : job.updatedAt.toISOString();

        // Get last matching run (placeholder - will be null until matching is implemented)
        const lastMatchingRunAt = null; // TODO: Implement when matching runs are tracked

        // Map job status to dashboard status
        const status: 'published' | 'draft' | 'closed' =
          job.status === JobStatus.PUBLISHED
            ? 'published'
            : job.status === JobStatus.DRAFT
              ? 'draft'
              : 'closed';

        return {
          id: job.id,
          title: job.title,
          status,
          candidatesCount,
          topMatchScore,
          lastActivityAt,
          lastMatchingRunAt,
        };
      }),
    );

    return { jobs: activeJobs };
  }

  /**
   * Get dashboard alerts
   */
  async getAlerts(userId: string): Promise<DashboardAlertsResponse> {
    const alerts: DashboardAlert[] = [];

    // Check for jobs without applications
    const jobsWithoutApplications = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoin('job.applications', 'application')
      .where('job.createdById = :userId', { userId })
      .andWhere('job.status = :status', { status: JobStatus.PUBLISHED })
      .andWhere('application.id IS NULL')
      .getCount();

    if (jobsWithoutApplications > 0) {
      alerts.push({
        id: 'jobs-without-applications',
        type: 'jobs_without_applications',
        message: `${jobsWithoutApplications} published job(s) have no applications yet`,
        actionUrl: '/jobs',
        severity: 'warning' as AlertSeverity,
      });
    }

    // Check for expired jobs
    const now = new Date();
    const expiredJobs = await this.jobRepository.count({
      where: {
        createdById: userId,
        status: JobStatus.PUBLISHED,
        expiresAt: LessThan(now),
      },
    });

    if (expiredJobs > 0) {
      alerts.push({
        id: 'expired-jobs',
        type: 'expired_jobs',
        message: `${expiredJobs} job(s) have expired`,
        actionUrl: '/jobs',
        severity: 'critical' as AlertSeverity,
      });
    }

    // Check for high number of pending applications
    const pendingApplications = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .where('job.createdById = :userId', { userId })
      .andWhere("application.status = 'PENDING'")
      .getCount();

    if (pendingApplications > 10) {
      alerts.push({
        id: 'high-pending-applications',
        type: 'high_pending_applications',
        message: `You have ${pendingApplications} pending applications to review`,
        actionUrl: '/candidates',
        severity: 'info' as AlertSeverity,
      });
    }

    return { alerts };
  }

  /**
   * Get matching health metrics
   * TODO: Implement when match scores are available
   */
  async getMatchingHealth(userId: string): Promise<DashboardMatchingHealthResponse> {
    // Placeholder implementation
    // Will be implemented when match scores are stored in database
    return {
      scoreDistribution: [
        { label: '0-20', ratio: 0, count: 0 },
        { label: '20-40', ratio: 0, count: 0 },
        { label: '40-60', ratio: 0, count: 0 },
        { label: '60-80', ratio: 0, count: 0 },
        { label: '80-100', ratio: 0, count: 0 },
      ],
      highQualityRatio: 0,
      lowQualityRatio: 0,
    };
  }
}


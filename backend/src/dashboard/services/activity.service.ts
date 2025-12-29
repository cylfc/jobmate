import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Candidate } from '../../candidate/entities/candidate.entity';
import { JobApplication, ApplicationStatus } from '../../job-application/entities/job-application.entity';
import { Job } from '../../job/entities/job.entity';
import {
  DashboardActivitiesResponse,
  ActivityEvent,
  ActivityType,
} from '../models/types/dashboard-activity.type';

/**
 * Activity Service
 * Handles aggregation of recent activities from multiple sources
 */
@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  /**
   * Get recent activities with cursor-based pagination
   */
  async getRecentActivities(
    userId: string,
    limit: number = 20,
    cursor?: string,
  ): Promise<DashboardActivitiesResponse> {
    const cursorDate = cursor ? new Date(cursor) : new Date();

    // Fetch activities from different sources
    const [candidateActivities, jobActivities, applicationActivities] = await Promise.all([
      this.getCandidateActivities(userId, cursorDate, limit),
      this.getJobActivities(userId, cursorDate, limit),
      this.getApplicationActivities(userId, cursorDate, limit),
    ]);

    // Combine and sort by date
    const allActivities: ActivityEvent[] = [
      ...candidateActivities,
      ...jobActivities,
      ...applicationActivities,
    ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    // Apply limit
    const events = allActivities.slice(0, limit);

    // Determine pagination
    const hasMore = allActivities.length > limit;
    const nextCursor = hasMore && events.length > 0 ? events[events.length - 1].occurredAt : null;

    return {
      events,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Get activities from candidate creation (cv_uploaded)
   */
  private async getCandidateActivities(
    userId: string,
    beforeDate: Date,
    limit: number,
  ): Promise<ActivityEvent[]> {
    const candidates = await this.candidateRepository.find({
      where: {
        userId,
        createdAt: LessThan(beforeDate),
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return candidates.map((candidate) => ({
      id: `candidate-${candidate.id}`,
      type: 'cv_uploaded' as ActivityType,
      occurredAt: candidate.createdAt.toISOString(),
      meta: {
        candidateId: candidate.id,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
      },
    }));
  }

  /**
   * Get activities from job creation/update (job_saved)
   */
  private async getJobActivities(
    userId: string,
    beforeDate: Date,
    limit: number,
  ): Promise<ActivityEvent[]> {
    const jobs = await this.jobRepository.find({
      where: {
        createdById: userId,
        updatedAt: LessThan(beforeDate),
      },
      order: { updatedAt: 'DESC' },
      take: limit,
    });

    return jobs.map((job) => ({
      id: `job-${job.id}`,
      type: 'job_saved' as ActivityType,
      occurredAt: job.updatedAt.toISOString(),
      meta: {
        jobId: job.id,
        jobTitle: job.title,
        jobStatus: job.status,
      },
    }));
  }

  /**
   * Get activities from applications (matching_completed, interview_scheduled)
   */
  private async getApplicationActivities(
    userId: string,
    beforeDate: Date,
    limit: number,
  ): Promise<ActivityEvent[]> {
    const applications = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .innerJoin('application.candidate', 'candidate')
      .where('job.createdById = :userId', { userId })
      .andWhere('application.createdAt < :beforeDate', { beforeDate })
      .orderBy('application.createdAt', 'DESC')
      .take(limit)
      .getMany();

    const activities: ActivityEvent[] = [];

    for (const application of applications) {
      // matching_completed: when application is created
      activities.push({
        id: `application-${application.id}-match`,
        type: 'matching_completed' as ActivityType,
        occurredAt: application.createdAt.toISOString(),
        meta: {
          applicationId: application.id,
          jobId: application.job.id,
          candidateId: application.candidate.id,
        },
      });

      // interview_scheduled: when status changes to INTERVIEWED
      if (application.status === ApplicationStatus.INTERVIEWED) {
        activities.push({
          id: `application-${application.id}-interview`,
          type: 'interview_scheduled' as ActivityType,
          occurredAt: application.updatedAt.toISOString(),
          meta: {
            applicationId: application.id,
            jobId: application.job.id,
            candidateId: application.candidate.id,
          },
        });
      }
    }

    return activities;
  }
}


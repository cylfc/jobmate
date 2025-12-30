import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../../job/entities/job.entity';
import { JobApplication } from '../../job-application/entities/job-application.entity';
import { Candidate } from '../../candidate/entities/candidate.entity';
import { DashboardKpisResponse } from '../models/types/dashboard-kpis.type';

/**
 * KPI Service
 * Handles calculation of Key Performance Indicators for dashboard
 */
@Injectable()
export class KpiService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  /**
   * Get dashboard KPIs for a user
   */
  async getKpis(userId: string): Promise<DashboardKpisResponse> {
    // Get open jobs count
    const openJobs = await this.getOpenJobsCount(userId);

    // Get candidates in pipeline
    const candidatesInPipeline = await this.getCandidatesInPipelineCount(userId);

    // Get matches this week
    const matchesThisWeek = await this.getMatchesThisWeekCount(userId);

    // Get average match score (placeholder - will be 0 until matching is implemented)
    const averageMatchScore = await this.getAverageMatchScore(userId);

    // Get time to shortlist (average days)
    const timeToShortlist = await this.getTimeToShortlist(userId);

    return {
      openJobs,
      candidatesInPipeline,
      matchesThisWeek,
      averageMatchScore,
      timeToShortlist,
    };
  }

  /**
   * Count open (published) jobs for user
   */
  private async getOpenJobsCount(userId: string): Promise<number> {
    const count = await this.jobRepository.count({
      where: {
        createdById: userId,
        status: JobStatus.PUBLISHED,
      },
    });
    return count;
  }

  /**
   * Count distinct candidates in pipeline (candidates with applications)
   */
  private async getCandidatesInPipelineCount(userId: string): Promise<number> {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .where('job.createdById = :userId', { userId })
      .select('COUNT(DISTINCT application.candidate)', 'count')
      .getRawOne();

    return parseInt(result?.count || '0', 10);
  }

  /**
   * Count applications created this week
   */
  private async getMatchesThisWeekCount(userId: string): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const count = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .where('job.createdById = :userId', { userId })
      .andWhere('application.createdAt >= :oneWeekAgo', { oneWeekAgo })
      .getCount();

    return count;
  }

  /**
   * Get average match score
   * TODO: Implement when matching algorithm is available
   * For now, returns 0
   */
  private async getAverageMatchScore(userId: string): Promise<number> {
    // Placeholder: Will be implemented when match scores are stored
    // This might require a new table or column to store match scores
    return 0;
  }

  /**
   * Calculate average time to shortlist (days)
   * Time between job creation and first application with status SHORTLISTED
   */
  private async getTimeToShortlist(userId: string): Promise<number> {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .where('job.createdById = :userId', { userId })
      .andWhere("application.status = 'SHORTLISTED'")
      .select('AVG(EXTRACT(EPOCH FROM (application.createdAt - job.createdAt)) / 86400)', 'avgDays')
      .getRawOne();

    const avgDays = parseFloat(result?.avgDays || '0');
    return Math.round(avgDays) || 0;
  }
}



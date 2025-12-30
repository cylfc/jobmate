import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../../candidate/entities/candidate.entity';
import { JobApplication, ApplicationStatus } from '../../job-application/entities/job-application.entity';
import { Job } from '../../job/entities/job.entity';
import { DashboardPipelineResponse, PipelineStage } from '../models/types/dashboard-pipeline.type';

/**
 * Pipeline Service
 * Handles candidate pipeline aggregations
 */
@Injectable()
export class PipelineService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  /**
   * Get pipeline stages with counts for a user
   */
  async getPipelineStages(userId: string): Promise<DashboardPipelineResponse> {
    // Get all counts in parallel
    const [uploaded, matched, contacted, interviewing, offer] = await Promise.all([
      this.getUploadedCount(userId),
      this.getMatchedCount(userId),
      this.getContactedCount(userId),
      this.getInterviewingCount(userId),
      this.getOfferCount(userId),
    ]);

    const stages: PipelineStage[] = [
      { id: 'uploaded', count: uploaded },
      { id: 'matched', count: matched },
      { id: 'contacted', count: contacted },
      { id: 'interviewing', count: interviewing },
      { id: 'offer', count: offer },
    ];

    return { stages };
  }

  /**
   * Count candidates uploaded by user
   */
  private async getUploadedCount(userId: string): Promise<number> {
    const count = await this.candidateRepository.count({
      where: { userId },
    });
    return count;
  }

  /**
   * Count candidates with at least one application
   */
  private async getMatchedCount(userId: string): Promise<number> {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .where('job.createdById = :userId', { userId })
      .select('COUNT(DISTINCT application.candidate)', 'count')
      .getRawOne();

    return parseInt(result?.count || '0', 10);
  }

  /**
   * Count candidates contacted (status: REVIEWING or SHORTLISTED)
   */
  private async getContactedCount(userId: string): Promise<number> {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .where('job.createdById = :userId', { userId })
      .andWhere('application.status IN (:...statuses)', {
        statuses: [ApplicationStatus.REVIEWING, ApplicationStatus.SHORTLISTED],
      })
      .select('COUNT(DISTINCT application.candidate)', 'count')
      .getRawOne();

    return parseInt(result?.count || '0', 10);
  }

  /**
   * Count candidates in interviewing stage (status: INTERVIEWED)
   */
  private async getInterviewingCount(userId: string): Promise<number> {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .where('job.createdById = :userId', { userId })
      .andWhere('application.status = :status', { status: ApplicationStatus.INTERVIEWED })
      .select('COUNT(DISTINCT application.candidate)', 'count')
      .getRawOne();

    return parseInt(result?.count || '0', 10);
  }

  /**
   * Count candidates with offer (status: ACCEPTED)
   */
  private async getOfferCount(userId: string): Promise<number> {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .where('job.createdById = :userId', { userId })
      .andWhere('application.status = :status', { status: ApplicationStatus.ACCEPTED })
      .select('COUNT(DISTINCT application.candidate)', 'count')
      .getRawOne();

    return parseInt(result?.count || '0', 10);
  }
}



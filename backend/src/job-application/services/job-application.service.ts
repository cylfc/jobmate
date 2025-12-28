import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobApplication, ApplicationStatus } from '../entities/job-application.entity';
import { CreateApplicationDto } from '../models/dto/create-application.dto';
import { UpdateApplicationDto } from '../models/dto/update-application.dto';
import { QueryApplicationDto } from '../models/dto/query-application.dto';
import { Job } from '../../job/entities/job.entity';
import { Candidate } from '../../candidate/entities/candidate.entity';

@Injectable()
export class JobApplicationService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  async createApplication(createDto: CreateApplicationDto, userId: string): Promise<JobApplication> {
    const job = await this.jobRepository.findOne({ where: { id: createDto.jobId } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${createDto.jobId} not found`);
    }

    const candidate = await this.candidateRepository.findOne({
      where: { userId },
    });
    if (!candidate) {
      throw new NotFoundException('Candidate profile not found. Please create your candidate profile first.');
    }

    const existingApplication = await this.checkDuplicate(createDto.jobId, candidate.id);
    if (existingApplication) {
      throw new ConflictException('Application already exists for this job');
    }

    const application = this.applicationRepository.create({
      job,
      candidate,
      status: createDto.status || ApplicationStatus.PENDING,
      coverLetter: createDto.coverLetter,
      resumeUrl: createDto.resumeUrl,
      notes: createDto.notes,
    });

    return this.applicationRepository.save(application);
  }

  async findAll(queryDto: QueryApplicationDto, userId?: string, userRole?: string) {
    const { page = 1, limit = 10, jobId, candidateId, status, sortBy = 'appliedAt', sortOrder = 'DESC' } = queryDto;
    const offset = (page - 1) * limit;

    const qb = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.candidate', 'candidate');

    if (userId && userRole !== 'admin') {
      if (jobId) {
        const job = await this.jobRepository.findOne({ where: { id: jobId } });
        if (!job || (job.createdById && job.createdById !== userId)) {
          throw new NotFoundException('Job not found or access denied');
        }
        qb.where('application.job_id = :jobId', { jobId });
      } else if (candidateId) {
        const candidate = await this.candidateRepository.findOne({ where: { id: candidateId } });
        if (!candidate || (candidate.userId && candidate.userId !== userId)) {
          throw new NotFoundException('Candidate not found or access denied');
        }
        qb.where('application.candidate_id = :candidateId', { candidateId });
      } else {
        qb.leftJoin('candidate', 'c', 'application.candidate_id = c.id');
        qb.where('c.user_id = :userId', { userId });
      }
    } else {
      if (jobId) {
        qb.where('application.job_id = :jobId', { jobId });
      }
      if (candidateId) {
        if (jobId) {
          qb.andWhere('application.candidate_id = :candidateId', { candidateId });
        } else {
          qb.where('application.candidate_id = :candidateId', { candidateId });
        }
      }
    }

    if (status) {
      if (qb.expressionMap.wheres.length > 0) {
        qb.andWhere('application.status = :status', { status });
      } else {
        qb.where('application.status = :status', { status });
      }
    }

    qb.orderBy(`application.${sortBy}`, sortOrder);
    qb.limit(limit);
    qb.offset(offset);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string, userRole?: string): Promise<JobApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'candidate'],
    });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    if (userId && userRole !== 'admin') {
      const candidate = await this.candidateRepository.findOne({
        where: { id: application.candidate.id },
      });
      const isOwner = candidate?.userId === userId;
      const isJobOwner = application.job.createdById === userId;
      if (!isOwner && !isJobOwner) {
        throw new NotFoundException('Application not found or access denied');
      }
    }
    return application;
  }

  async findByJob(jobId: string, userId?: string) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }
    if (userId && job.createdById && job.createdById !== userId) {
      throw new NotFoundException('Job not found or access denied');
    }
    return this.applicationRepository.find({
      where: { job: { id: jobId } },
      relations: ['candidate'],
      order: {
        appliedAt: 'DESC',
      },
    });
  }

  async findByCandidate(candidateId: string, userId?: string) {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }
    if (userId && candidate.userId && candidate.userId !== userId) {
      throw new NotFoundException('Candidate not found or access denied');
    }
    return this.applicationRepository.find({
      where: { candidate: { id: candidateId } },
      relations: ['job'],
      order: {
        appliedAt: 'DESC',
      },
    });
  }

  async checkDuplicate(jobId: string, candidateId: string): Promise<JobApplication | null> {
    return this.applicationRepository.findOne({
      where: {
        job: { id: jobId },
        candidate: { id: candidateId },
      },
    });
  }

  async updateApplication(id: string, updateDto: UpdateApplicationDto, userId?: string, userRole?: string): Promise<JobApplication> {
    const application = await this.findOne(id, userId, userRole);
    if (userId && userRole !== 'admin') {
      const isJobOwner = application.job.createdById === userId;
      if (!isJobOwner) {
        throw new ForbiddenException('Only job owner can update application status');
      }
    }
    Object.assign(application, updateDto);
    return this.applicationRepository.save(application);
  }

  async removeApplication(id: string, userId?: string, userRole?: string): Promise<void> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'candidate'],
    });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    if (userId && userRole !== 'admin') {
      const candidate = await this.candidateRepository.findOne({
        where: { id: application.candidate.id },
      });
      const isOwner = candidate?.userId === userId;
      const isJobOwner = application.job.createdById === userId;
      if (!isOwner && !isJobOwner) {
        throw new ForbiddenException('You can only delete your own applications or as job owner');
      }
    }
    await this.applicationRepository.remove(application);
  }
}


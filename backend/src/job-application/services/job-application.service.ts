import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

  async createApplication(createDto: CreateApplicationDto): Promise<JobApplication> {
    const existingApplication = await this.checkDuplicate(createDto.jobId, createDto.candidateId);
    if (existingApplication) {
      throw new ConflictException('Application already exists for this job and candidate');
    }

    const job = await this.jobRepository.findOne({ where: { id: createDto.jobId } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${createDto.jobId} not found`);
    }

    const candidate = await this.candidateRepository.findOne({ where: { id: createDto.candidateId } });
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${createDto.candidateId} not found`);
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

  async findAll(queryDto: QueryApplicationDto) {
    const { page = 1, limit = 10, jobId, candidateId, status, sortBy = 'appliedAt', sortOrder = 'DESC' } = queryDto;
    const offset = (page - 1) * limit;

    const qb = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .leftJoinAndSelect('application.candidate', 'candidate');

    if (jobId) {
      qb.andWhere('application.job_id = :jobId', { jobId });
    }

    if (candidateId) {
      qb.andWhere('application.candidate_id = :candidateId', { candidateId });
    }

    if (status) {
      qb.andWhere('application.status = :status', { status });
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

  async findOne(id: string): Promise<JobApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['job', 'candidate'],
    });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  async findByJob(jobId: string) {
    return this.applicationRepository.find({
      where: { job: { id: jobId } },
      relations: ['candidate'],
      order: {
        appliedAt: 'DESC',
      },
    });
  }

  async findByCandidate(candidateId: string) {
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

  async updateApplication(id: string, updateDto: UpdateApplicationDto): Promise<JobApplication> {
    const application = await this.findOne(id);
    Object.assign(application, updateDto);
    return this.applicationRepository.save(application);
  }

  async removeApplication(id: string): Promise<void> {
    const application = await this.findOne(id);
    await this.applicationRepository.remove(application);
  }
}


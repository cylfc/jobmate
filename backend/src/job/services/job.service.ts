import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from '@shared/exceptions/custom-exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '@job/entities/job.entity';
import { CreateJobDto } from '@job/models/dto/create-job.dto';
import { UpdateJobDto } from '@job/models/dto/update-job.dto';
import { QueryJobDto } from '@job/models/dto/query-job.dto';
import { verifyOwnership, executePaginatedQuery, applySearchFilter, applySorting, applyEnumFilter } from '@shared/utils';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async createJob(createDto: CreateJobDto, userId?: string): Promise<Job> {
    const job = this.jobRepository.create({
      ...createDto,
      createdById: userId,
    });
    if (createDto.postedAt) {
      job.postedAt = new Date(createDto.postedAt);
    }
    if (createDto.expiresAt) {
      job.expiresAt = new Date(createDto.expiresAt);
    }
    return this.jobRepository.save(job);
  }

  async findAll(queryDto: QueryJobDto) {
    const { page = 1, limit = 10, search, status, employmentType, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;

    const qb = this.jobRepository.createQueryBuilder('job');

    // Apply search filter
    if (search) {
      applySearchFilter(qb, {
        search,
        searchFields: ['title', 'description', 'company'],
      });
    }

    // Apply enum filters
    applyEnumFilter(qb, 'status', status);
    applyEnumFilter(qb, 'employmentType', employmentType);

    // Apply sorting
    applySorting(qb, { sortBy, sortOrder });

    // Execute paginated query
    return executePaginatedQuery(qb, { page, limit });
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new EntityNotFoundException('Job', id);
    }
    return job;
  }

  async findPublished() {
    return this.jobRepository.find({
      where: {
        status: JobStatus.PUBLISHED,
      },
      order: {
        postedAt: 'DESC',
      },
    });
  }

  async findByStatus(status: JobStatus) {
    return this.jobRepository.find({
      where: { status },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateJob(id: string, updateDto: UpdateJobDto, userId?: string): Promise<Job> {
    // Verify ownership nếu userId provided
    if (userId) {
      await verifyOwnership(this.jobRepository, id, userId, {
        ownerField: 'createdById',
        entityName: 'Job',
      });
    }

    const job = await this.findOne(id);
    Object.assign(job, updateDto);
    if (updateDto.postedAt) {
      job.postedAt = new Date(updateDto.postedAt);
    }
    if (updateDto.expiresAt) {
      job.expiresAt = new Date(updateDto.expiresAt);
    }
    return this.jobRepository.save(job);
  }

  async removeJob(id: string, userId?: string): Promise<void> {
    // Verify ownership nếu userId provided
    if (userId) {
      await verifyOwnership(this.jobRepository, id, userId, {
        ownerField: 'createdById',
        entityName: 'Job',
      });
    }

    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
  }
}


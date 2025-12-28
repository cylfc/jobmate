import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job, JobStatus } from '../entities/job.entity';
import { CreateJobDto } from '../models/dto/create-job.dto';
import { UpdateJobDto } from '../models/dto/update-job.dto';
import { QueryJobDto } from '../models/dto/query-job.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async createJob(createDto: CreateJobDto): Promise<Job> {
    const job = this.jobRepository.create(createDto);
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
    const offset = (page - 1) * limit;

    const qb = this.jobRepository.createQueryBuilder('job');

    if (search) {
      qb.where(
        '(job.title ILIKE :search OR job.description ILIKE :search OR job.company ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      qb.andWhere('job.status = :status', { status });
    }

    if (employmentType) {
      qb.andWhere('job.employmentType = :employmentType', { employmentType });
    }

    qb.orderBy(`job.${sortBy}`, sortOrder);
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

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
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

  async updateJob(id: string, updateDto: UpdateJobDto): Promise<Job> {
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

  async removeJob(id: string): Promise<void> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
  }
}


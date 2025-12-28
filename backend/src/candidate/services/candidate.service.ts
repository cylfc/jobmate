import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { CreateCandidateDto } from '../models/dto/create-candidate.dto';
import { UpdateCandidateDto } from '../models/dto/update-candidate.dto';
import { QueryCandidateDto } from '../models/dto/query-candidate.dto';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  async createCandidate(createDto: CreateCandidateDto): Promise<Candidate> {
    const candidate = this.candidateRepository.create(createDto);
    return this.candidateRepository.save(candidate);
  }

  async findAll(queryDto: QueryCandidateDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;
    const offset = (page - 1) * limit;

    const qb = this.candidateRepository.createQueryBuilder('candidate');

    if (search) {
      qb.where(
        '(candidate.firstName ILIKE :search OR candidate.lastName ILIKE :search OR candidate.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy(`candidate.${sortBy}`, sortOrder);
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

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({ where: { id } });
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
    return candidate;
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    return this.candidateRepository.findOne({ where: { email } });
  }

  async updateCandidate(id: string, updateDto: UpdateCandidateDto): Promise<Candidate> {
    const candidate = await this.findOne(id);
    Object.assign(candidate, updateDto);
    return this.candidateRepository.save(candidate);
  }

  async removeCandidate(id: string): Promise<void> {
    const candidate = await this.findOne(id);
    await this.candidateRepository.remove(candidate);
  }
}


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

  async createCandidate(createDto: CreateCandidateDto, userId?: string): Promise<Candidate> {
    const candidateData: Partial<Candidate> = {
      email: createDto.email,
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      userId,
    };
    
    // Only set optional fields if they are explicitly provided
    if (createDto.phone !== undefined) candidateData.phone = createDto.phone;
    if (createDto.resumeUrl !== undefined) candidateData.resumeUrl = createDto.resumeUrl;
    if (createDto.currentCompany !== undefined) candidateData.currentCompany = createDto.currentCompany;
    if (createDto.currentSalary !== undefined) candidateData.currentSalary = createDto.currentSalary;
    if (createDto.expectedSalary !== undefined) candidateData.expectedSalary = createDto.expectedSalary;
    if (createDto.skills !== undefined) candidateData.skills = createDto.skills;
    if (createDto.experience !== undefined) candidateData.experience = createDto.experience;
    if (createDto.education !== undefined) candidateData.education = createDto.education;
    
    const candidate = this.candidateRepository.create(candidateData);
    return this.candidateRepository.save(candidate);
  }

  async findAll(queryDto: QueryCandidateDto, userId?: string) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;
    const offset = (page - 1) * limit;

    const qb = this.candidateRepository.createQueryBuilder('candidate');

    if (userId) {
      qb.where('candidate.userId = :userId', { userId });
    }

    if (search) {
      if (userId) {
        qb.andWhere(
          '(candidate.firstName ILIKE :search OR candidate.lastName ILIKE :search OR candidate.email ILIKE :search)',
          { search: `%${search}%` },
        );
      } else {
        qb.where(
          '(candidate.firstName ILIKE :search OR candidate.lastName ILIKE :search OR candidate.email ILIKE :search)',
          { search: `%${search}%` },
        );
      }
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

  async findOne(id: string, userId?: string): Promise<Candidate> {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }
    const candidate = await this.candidateRepository.findOne({ where });
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
    // Only update fields that are explicitly provided
    if (updateDto.email !== undefined) candidate.email = updateDto.email;
    if (updateDto.firstName !== undefined) candidate.firstName = updateDto.firstName;
    if (updateDto.lastName !== undefined) candidate.lastName = updateDto.lastName;
    if (updateDto.phone !== undefined) candidate.phone = updateDto.phone;
    if (updateDto.resumeUrl !== undefined) candidate.resumeUrl = updateDto.resumeUrl;
    if (updateDto.currentCompany !== undefined) candidate.currentCompany = updateDto.currentCompany;
    if (updateDto.currentSalary !== undefined) candidate.currentSalary = updateDto.currentSalary;
    if (updateDto.expectedSalary !== undefined) candidate.expectedSalary = updateDto.expectedSalary;
    if (updateDto.skills !== undefined) candidate.skills = updateDto.skills;
    if (updateDto.experience !== undefined) {
      // Ensure experience is an array
      candidate.experience = Array.isArray(updateDto.experience) ? updateDto.experience : [];
    }
    if (updateDto.education !== undefined) candidate.education = updateDto.education;
    return this.candidateRepository.save(candidate);
  }

  async removeCandidate(id: string): Promise<void> {
    const candidate = await this.findOne(id);
    await this.candidateRepository.remove(candidate);
  }
}


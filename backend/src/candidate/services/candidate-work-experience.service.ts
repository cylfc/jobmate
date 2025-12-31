import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateWorkExperience } from '../entities/candidate-work-experience.entity';
import { Candidate } from '../entities/candidate.entity';
import { CreateWorkExperienceDto } from '../models/dto/create-work-experience.dto';
import { UpdateWorkExperienceDto } from '../models/dto/update-work-experience.dto';

@Injectable()
export class CandidateWorkExperienceService {
  constructor(
    @InjectRepository(CandidateWorkExperience)
    private readonly workExperienceRepository: Repository<CandidateWorkExperience>,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  async createWorkExperience(
    candidateId: string,
    createDto: CreateWorkExperienceDto,
    userId?: string,
  ): Promise<CandidateWorkExperience> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }

    if (userId && candidate.userId !== userId) {
      throw new ForbiddenException('You can only add work experience to your own candidate profile');
    }

    const workExperience = this.workExperienceRepository.create({
      candidate,
      companyName: createDto.companyName,
      position: createDto.position,
      role: createDto.role,
      startDate: new Date(createDto.startDate),
      endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
      isCurrent: createDto.isCurrent ?? false,
      employmentType: createDto.employmentType,
      location: createDto.location,
      description: createDto.description,
      achievements: createDto.achievements ?? [],
      technologiesUsed: createDto.technologiesUsed ?? [],
      orderIndex: createDto.orderIndex ?? 0,
    });

    return this.workExperienceRepository.save(workExperience);
  }

  async findAllByCandidate(candidateId: string, userId?: string): Promise<CandidateWorkExperience[]> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }

    if (userId && candidate.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.workExperienceRepository.find({
      where: { candidate: { id: candidateId } },
      order: { orderIndex: 'ASC', startDate: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<CandidateWorkExperience> {
    const workExperience = await this.workExperienceRepository.findOne({
      where: { id },
      relations: ['candidate'],
    });

    if (!workExperience) {
      throw new NotFoundException(`Work experience with ID ${id} not found`);
    }

    if (userId && workExperience.candidate.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return workExperience;
  }

  async updateWorkExperience(
    id: string,
    updateDto: UpdateWorkExperienceDto,
    userId?: string,
  ): Promise<CandidateWorkExperience> {
    const workExperience = await this.findOne(id, userId);

    if (updateDto.startDate) {
      workExperience.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      workExperience.endDate = updateDto.endDate ? new Date(updateDto.endDate) : undefined;
    }
    if (updateDto.companyName !== undefined) workExperience.companyName = updateDto.companyName;
    if (updateDto.position !== undefined) workExperience.position = updateDto.position;
    if (updateDto.role !== undefined) workExperience.role = updateDto.role;
    if (updateDto.isCurrent !== undefined) workExperience.isCurrent = updateDto.isCurrent;
    if (updateDto.employmentType !== undefined) workExperience.employmentType = updateDto.employmentType;
    if (updateDto.location !== undefined) workExperience.location = updateDto.location;
    if (updateDto.description !== undefined) workExperience.description = updateDto.description;
    if (updateDto.achievements !== undefined) workExperience.achievements = updateDto.achievements;
    if (updateDto.technologiesUsed !== undefined) workExperience.technologiesUsed = updateDto.technologiesUsed;
    if (updateDto.orderIndex !== undefined) workExperience.orderIndex = updateDto.orderIndex;

    return this.workExperienceRepository.save(workExperience);
  }

  async deleteWorkExperience(id: string, userId?: string): Promise<void> {
    const workExperience = await this.findOne(id, userId);
    await this.workExperienceRepository.remove(workExperience);
  }
}


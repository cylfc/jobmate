import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsOrder } from 'typeorm';
import { CandidateWorkExperience } from '@candidate/entities/candidate-work-experience.entity';
import { Candidate } from '@candidate/entities/candidate.entity';
import { CreateWorkExperienceDto } from '@candidate/models/dto/create-work-experience.dto';
import { UpdateWorkExperienceDto } from '@candidate/models/dto/update-work-experience.dto';
import { BaseCandidateEntityService } from '@shared/services/base-candidate-entity.service';

@Injectable()
export class CandidateWorkExperienceService extends BaseCandidateEntityService<
  CandidateWorkExperience,
  CreateWorkExperienceDto,
  UpdateWorkExperienceDto
> {
  constructor(
    @InjectRepository(CandidateWorkExperience)
    private readonly _workExperienceRepository: Repository<CandidateWorkExperience>,
    @InjectRepository(Candidate)
    private readonly _candidateRepository: Repository<Candidate>,
  ) {
    super();
  }

  protected get entityRepository(): Repository<CandidateWorkExperience> {
    return this._workExperienceRepository;
  }

  protected get candidateRepository(): Repository<Candidate> {
    return this._candidateRepository;
  }

  protected get entityName(): string {
    return 'Work experience';
  }

  async create(
    candidateId: string,
    createDto: CreateWorkExperienceDto,
    userId?: string,
  ): Promise<CandidateWorkExperience> {
    const candidate = await this.verifyCandidateOwnership(candidateId, {
      userId,
      errorMessage: 'You can only add work experience to your own candidate profile',
    });

    const workExperience = this.entityRepository.create({
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

    return this.entityRepository.save(workExperience);
  }

  async update(
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

    return this.entityRepository.save(workExperience);
  }

  // Override findAllByCandidate để use custom order
  async findAllByCandidate(
    candidateId: string,
    userId?: string,
  ): Promise<CandidateWorkExperience[]> {
    return this.findAllByCandidateWithOwnershipCheck(
      candidateId,
      { userId },
      { orderIndex: 'ASC', startDate: 'DESC' } as FindOptionsOrder<CandidateWorkExperience>,
    );
  }

  // Keep old method names for backward compatibility
  async createWorkExperience(
    candidateId: string,
    createDto: CreateWorkExperienceDto,
    userId?: string,
  ): Promise<CandidateWorkExperience> {
    return this.create(candidateId, createDto, userId);
  }

  async updateWorkExperience(
    id: string,
    updateDto: UpdateWorkExperienceDto,
    userId?: string,
  ): Promise<CandidateWorkExperience> {
    return this.update(id, updateDto, userId);
  }

  async deleteWorkExperience(id: string, userId?: string): Promise<void> {
    return this.delete(id, userId);
  }
}


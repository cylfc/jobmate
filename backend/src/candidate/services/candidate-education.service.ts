import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsOrder } from 'typeorm';
import { CandidateEducation } from '@candidate/entities/candidate-education.entity';
import { Candidate } from '@candidate/entities/candidate.entity';
import { CreateEducationDto } from '@candidate/models/dto/create-education.dto';
import { UpdateEducationDto } from '@candidate/models/dto/update-education.dto';
import { BaseCandidateEntityService } from '@shared/services/base-candidate-entity.service';

@Injectable()
export class CandidateEducationService extends BaseCandidateEntityService<
  CandidateEducation,
  CreateEducationDto,
  UpdateEducationDto
> {
  constructor(
    @InjectRepository(CandidateEducation)
    private readonly _educationRepository: Repository<CandidateEducation>,
    @InjectRepository(Candidate)
    private readonly _candidateRepository: Repository<Candidate>,
  ) {
    super();
  }

  protected get entityRepository(): Repository<CandidateEducation> {
    return this._educationRepository;
  }

  protected get candidateRepository(): Repository<Candidate> {
    return this._candidateRepository;
  }

  protected get entityName(): string {
    return 'Education';
  }

  async create(
    candidateId: string,
    createDto: CreateEducationDto,
    userId?: string,
  ): Promise<CandidateEducation> {
    const candidate = await this.verifyCandidateOwnership(candidateId, {
      userId,
      errorMessage: 'You can only add education to your own candidate profile',
    });

    const education = this.entityRepository.create({
      candidate,
      institution: createDto.institution,
      major: createDto.major,
      degreeType: createDto.degreeType,
      startDate: createDto.startDate ? new Date(createDto.startDate) : undefined,
      endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
      gpa: createDto.gpa,
      gpaScale: createDto.gpaScale ?? 4.0,
      description: createDto.description,
      orderIndex: createDto.orderIndex ?? 0,
    });

    return this.entityRepository.save(education);
  }

  async update(
    id: string,
    updateDto: UpdateEducationDto,
    userId?: string,
  ): Promise<CandidateEducation> {
    const education = await this.findOne(id, userId);

    if (updateDto.startDate) {
      education.startDate = new Date(updateDto.startDate);
    }
    if (updateDto.endDate) {
      education.endDate = new Date(updateDto.endDate);
    }
    if (updateDto.institution !== undefined) education.institution = updateDto.institution;
    if (updateDto.major !== undefined) education.major = updateDto.major;
    if (updateDto.degreeType !== undefined) education.degreeType = updateDto.degreeType;
    if (updateDto.gpa !== undefined) education.gpa = updateDto.gpa;
    if (updateDto.gpaScale !== undefined) education.gpaScale = updateDto.gpaScale;
    if (updateDto.description !== undefined) education.description = updateDto.description;
    if (updateDto.orderIndex !== undefined) education.orderIndex = updateDto.orderIndex;

    return this.entityRepository.save(education);
  }

  // Override findAllByCandidate để use custom order
  async findAllByCandidate(
    candidateId: string,
    userId?: string,
  ): Promise<CandidateEducation[]> {
    return this.findAllByCandidateWithOwnershipCheck(
      candidateId,
      { userId },
      { orderIndex: 'ASC', startDate: 'DESC' } as FindOptionsOrder<CandidateEducation>,
    );
  }

  // Keep old method names for backward compatibility
  async createEducation(
    candidateId: string,
    createDto: CreateEducationDto,
    userId?: string,
  ): Promise<CandidateEducation> {
    return this.create(candidateId, createDto, userId);
  }

  async updateEducation(
    id: string,
    updateDto: UpdateEducationDto,
    userId?: string,
  ): Promise<CandidateEducation> {
    return this.update(id, updateDto, userId);
  }

  async deleteEducation(id: string, userId?: string): Promise<void> {
    return this.delete(id, userId);
  }

  async reorderEducation(
    candidateId: string,
    orderIds: string[],
    userId?: string,
  ): Promise<CandidateEducation[]> {
    return this.reorder(candidateId, orderIds, userId);
  }
}


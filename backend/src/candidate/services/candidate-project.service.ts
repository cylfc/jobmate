import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsOrder } from 'typeorm';
import { CandidateProject } from '@candidate/entities/candidate-project.entity';
import { Candidate } from '@candidate/entities/candidate.entity';
import { CreateProjectDto } from '@candidate/models/dto/create-project.dto';
import { UpdateProjectDto } from '@candidate/models/dto/update-project.dto';
import { BaseCandidateEntityService } from '@shared/services/base-candidate-entity.service';

@Injectable()
export class CandidateProjectService extends BaseCandidateEntityService<
  CandidateProject,
  CreateProjectDto,
  UpdateProjectDto
> {
  constructor(
    @InjectRepository(CandidateProject)
    private readonly _projectRepository: Repository<CandidateProject>,
    @InjectRepository(Candidate)
    private readonly _candidateRepository: Repository<Candidate>,
  ) {
    super();
  }

  protected get entityRepository(): Repository<CandidateProject> {
    return this._projectRepository;
  }

  protected get candidateRepository(): Repository<Candidate> {
    return this._candidateRepository;
  }

  protected get entityName(): string {
    return 'Project';
  }

  async create(
    candidateId: string,
    createDto: CreateProjectDto,
    userId?: string,
  ): Promise<CandidateProject> {
    const candidate = await this.verifyCandidateOwnership(candidateId, {
      userId,
      errorMessage: 'You can only add projects to your own candidate profile',
    });

    const project = this.entityRepository.create({
      candidate,
      name: createDto.name,
      company: createDto.company,
      startDate: createDto.startDate ? new Date(createDto.startDate) : undefined,
      endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
      isCurrent: createDto.isCurrent ?? false,
      position: createDto.position,
      role: createDto.role,
      description: createDto.description,
      achievements: createDto.achievements ?? [],
      technologiesUsed: createDto.technologiesUsed ?? [],
      projectUrl: createDto.projectUrl,
      orderIndex: createDto.orderIndex ?? 0,
    });

    return this.entityRepository.save(project);
  }

  async update(
    id: string,
    updateDto: UpdateProjectDto,
    userId?: string,
  ): Promise<CandidateProject> {
    const project = await this.findOne(id, userId);

    if (updateDto.startDate) {
      project.startDate = updateDto.startDate ? new Date(updateDto.startDate) : undefined;
    }
    if (updateDto.endDate) {
      project.endDate = updateDto.endDate ? new Date(updateDto.endDate) : undefined;
    }
    if (updateDto.name !== undefined) project.name = updateDto.name;
    if (updateDto.company !== undefined) project.company = updateDto.company;
    if (updateDto.isCurrent !== undefined) project.isCurrent = updateDto.isCurrent;
    if (updateDto.position !== undefined) project.position = updateDto.position;
    if (updateDto.role !== undefined) project.role = updateDto.role;
    if (updateDto.description !== undefined) project.description = updateDto.description;
    if (updateDto.achievements !== undefined) project.achievements = updateDto.achievements;
    if (updateDto.technologiesUsed !== undefined) project.technologiesUsed = updateDto.technologiesUsed;
    if (updateDto.projectUrl !== undefined) project.projectUrl = updateDto.projectUrl;
    if (updateDto.orderIndex !== undefined) project.orderIndex = updateDto.orderIndex;

    return this.entityRepository.save(project);
  }

  // Override findAllByCandidate để use custom order
  async findAllByCandidate(
    candidateId: string,
    userId?: string,
  ): Promise<CandidateProject[]> {
    return this.findAllByCandidateWithOwnershipCheck(
      candidateId,
      { userId },
      { orderIndex: 'ASC', startDate: 'DESC' } as FindOptionsOrder<CandidateProject>,
    );
  }

  // Keep old method names for backward compatibility
  async createProject(
    candidateId: string,
    createDto: CreateProjectDto,
    userId?: string,
  ): Promise<CandidateProject> {
    return this.create(candidateId, createDto, userId);
  }

  async updateProject(
    id: string,
    updateDto: UpdateProjectDto,
    userId?: string,
  ): Promise<CandidateProject> {
    return this.update(id, updateDto, userId);
  }

  async deleteProject(id: string, userId?: string): Promise<void> {
    return this.delete(id, userId);
  }
}


import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateProject } from '../entities/candidate-project.entity';
import { Candidate } from '../entities/candidate.entity';
import { CreateProjectDto } from '../models/dto/create-project.dto';
import { UpdateProjectDto } from '../models/dto/update-project.dto';

@Injectable()
export class CandidateProjectService {
  constructor(
    @InjectRepository(CandidateProject)
    private readonly projectRepository: Repository<CandidateProject>,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  async createProject(candidateId: string, createDto: CreateProjectDto, userId?: string): Promise<CandidateProject> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }

    if (userId && candidate.userId !== userId) {
      throw new ForbiddenException('You can only add projects to your own candidate profile');
    }

    const project = this.projectRepository.create({
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

    return this.projectRepository.save(project);
  }

  async findAllByCandidate(candidateId: string, userId?: string): Promise<CandidateProject[]> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }

    if (userId && candidate.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.projectRepository.find({
      where: { candidate: { id: candidateId } },
      order: { orderIndex: 'ASC', startDate: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<CandidateProject> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['candidate'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (userId && project.candidate.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return project;
  }

  async updateProject(id: string, updateDto: UpdateProjectDto, userId?: string): Promise<CandidateProject> {
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

    return this.projectRepository.save(project);
  }

  async deleteProject(id: string, userId?: string): Promise<void> {
    const project = await this.findOne(id, userId);
    await this.projectRepository.remove(project);
  }
}


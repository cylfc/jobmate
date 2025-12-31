import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateSkill } from '../entities/candidate-skill.entity';
import { Candidate } from '../entities/candidate.entity';
import { CreateSkillDto } from '../models/dto/create-skill.dto';
import { UpdateSkillDto } from '../models/dto/update-skill.dto';

@Injectable()
export class CandidateSkillService {
  constructor(
    @InjectRepository(CandidateSkill)
    private readonly skillRepository: Repository<CandidateSkill>,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  async createSkill(candidateId: string, createDto: CreateSkillDto, userId?: string): Promise<CandidateSkill> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }

    if (userId && candidate.userId !== userId) {
      throw new ForbiddenException('You can only add skills to your own candidate profile');
    }

    // Check if skill already exists for this candidate
    const existingSkill = await this.skillRepository.findOne({
      where: { candidate: { id: candidateId }, name: createDto.name },
    });

    if (existingSkill) {
      throw new ForbiddenException(`Skill "${createDto.name}" already exists for this candidate`);
    }

    const skill = this.skillRepository.create({
      candidate,
      name: createDto.name,
      skillType: createDto.skillType ?? 'technical',
      level: createDto.level,
      yearsOfExperience: createDto.yearsOfExperience,
      proficiencyPercentage: createDto.proficiencyPercentage,
      lastUsedDate: createDto.lastUsedDate ? new Date(createDto.lastUsedDate) : undefined,
      description: createDto.description,
      orderIndex: createDto.orderIndex ?? 0,
    });

    return this.skillRepository.save(skill);
  }

  async findAllByCandidate(candidateId: string, userId?: string): Promise<CandidateSkill[]> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }

    if (userId && candidate.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.skillRepository.find({
      where: { candidate: { id: candidateId } },
      order: { orderIndex: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<CandidateSkill> {
    const skill = await this.skillRepository.findOne({
      where: { id },
      relations: ['candidate'],
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }

    if (userId && skill.candidate.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return skill;
  }

  async updateSkill(id: string, updateDto: UpdateSkillDto, userId?: string): Promise<CandidateSkill> {
    const skill = await this.findOne(id, userId);

    if (updateDto.name !== undefined) skill.name = updateDto.name;
    if (updateDto.skillType !== undefined) skill.skillType = updateDto.skillType;
    if (updateDto.level !== undefined) skill.level = updateDto.level;
    if (updateDto.yearsOfExperience !== undefined) skill.yearsOfExperience = updateDto.yearsOfExperience;
    if (updateDto.proficiencyPercentage !== undefined) skill.proficiencyPercentage = updateDto.proficiencyPercentage;
    if (updateDto.lastUsedDate) {
      skill.lastUsedDate = new Date(updateDto.lastUsedDate);
    }
    if (updateDto.description !== undefined) skill.description = updateDto.description;
    if (updateDto.orderIndex !== undefined) skill.orderIndex = updateDto.orderIndex;

    return this.skillRepository.save(skill);
  }

  async deleteSkill(id: string, userId?: string): Promise<void> {
    const skill = await this.findOne(id, userId);
    await this.skillRepository.remove(skill);
  }
}


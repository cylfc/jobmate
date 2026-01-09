import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsOrder } from 'typeorm';
import { CandidateSkill } from '@candidate/entities/candidate-skill.entity';
import { Candidate } from '@candidate/entities/candidate.entity';
import { CreateSkillDto } from '@candidate/models/dto/create-skill.dto';
import { UpdateSkillDto } from '@candidate/models/dto/update-skill.dto';
import { BaseCandidateEntityService } from '@shared/services/base-candidate-entity.service';

@Injectable()
export class CandidateSkillService extends BaseCandidateEntityService<
  CandidateSkill,
  CreateSkillDto,
  UpdateSkillDto
> {
  constructor(
    @InjectRepository(CandidateSkill)
    private readonly _skillRepository: Repository<CandidateSkill>,
    @InjectRepository(Candidate)
    private readonly _candidateRepository: Repository<Candidate>,
  ) {
    super();
  }

  protected get entityRepository(): Repository<CandidateSkill> {
    return this._skillRepository;
  }

  protected get candidateRepository(): Repository<Candidate> {
    return this._candidateRepository;
  }

  protected get entityName(): string {
    return 'Skill';
  }

  async create(
    candidateId: string,
    createDto: CreateSkillDto,
    userId?: string,
  ): Promise<CandidateSkill> {
    const candidate = await this.verifyCandidateOwnership(candidateId, {
      userId,
      errorMessage: 'You can only add skills to your own candidate profile',
    });

    // Check if skill already exists for this candidate
    const existingSkill = await this.entityRepository.findOne({
      where: { candidate: { id: candidateId }, name: createDto.name },
    });

    if (existingSkill) {
      throw new ForbiddenException(`Skill "${createDto.name}" already exists for this candidate`);
    }

    const skill = this.entityRepository.create({
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

    return this.entityRepository.save(skill);
  }

  async update(
    id: string,
    updateDto: UpdateSkillDto,
    userId?: string,
  ): Promise<CandidateSkill> {
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

    return this.entityRepository.save(skill);
  }

  // Override findAllByCandidate để use custom order
  async findAllByCandidate(
    candidateId: string,
    userId?: string,
  ): Promise<CandidateSkill[]> {
    return this.findAllByCandidateWithOwnershipCheck(
      candidateId,
      { userId },
      { orderIndex: 'ASC', name: 'ASC' } as FindOptionsOrder<CandidateSkill>,
    );
  }

  // Keep old method names for backward compatibility
  async createSkill(
    candidateId: string,
    createDto: CreateSkillDto,
    userId?: string,
  ): Promise<CandidateSkill> {
    return this.create(candidateId, createDto, userId);
  }

  async updateSkill(
    id: string,
    updateDto: UpdateSkillDto,
    userId?: string,
  ): Promise<CandidateSkill> {
    return this.update(id, updateDto, userId);
  }

  async deleteSkill(id: string, userId?: string): Promise<void> {
    return this.delete(id, userId);
  }
}


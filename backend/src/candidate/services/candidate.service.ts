import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { CreateCandidateDto } from '../models/dto/create-candidate.dto';
import { UpdateCandidateDto } from '../models/dto/update-candidate.dto';
import { QueryCandidateDto } from '../models/dto/query-candidate.dto';
import { CandidateEducationService } from './candidate-education.service';
import { CandidateSkillService } from './candidate-skill.service';
import { CandidateWorkExperienceService } from './candidate-work-experience.service';
import { CandidateProjectService } from './candidate-project.service';
import { CreateEducationDto } from '../models/dto/create-education.dto';
import { CreateSkillDto } from '../models/dto/create-skill.dto';
import { CreateWorkExperienceDto } from '../models/dto/create-work-experience.dto';
import { CreateProjectDto } from '../models/dto/create-project.dto';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    private readonly educationService: CandidateEducationService,
    private readonly skillService: CandidateSkillService,
    private readonly workExperienceService: CandidateWorkExperienceService,
    private readonly projectService: CandidateProjectService,
  ) {}

  // Helper function to convert date from frontend format (string | CalendarDate) to Date string
  private convertDate(date: unknown): string | undefined {
    if (!date) return undefined;
    if (typeof date === 'string') return date;
    if (typeof date === 'object' && date !== null) {
      // Handle CalendarDate object from @internationalized/date
      if ('year' in date && 'month' in date && 'day' in date) {
        const year = (date as { year: number }).year;
        const month = String((date as { month: number }).month).padStart(2, '0');
        const day = String((date as { day: number }).day).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    return undefined;
  }

  // Helper function to convert education entry to CreateEducationDto
  private convertEducationEntry(entry: unknown): CreateEducationDto | null {
    if (!entry || typeof entry !== 'object') return null;
    const e = entry as Record<string, unknown>;
    const gpaScale = (e.gpaScale as number) ?? 4.0;
    let gpa = e.gpa as number | undefined;
    
    // Validate and clamp GPA to be within reasonable bounds
    // GPA should not exceed gpaScale, and should be between 0 and 100 (to support various scales)
    if (gpa !== undefined && gpa !== null) {
      if (gpa < 0) gpa = 0;
      if (gpa > 100) gpa = 100; // Cap at 100 to prevent overflow
      // Also ensure gpa doesn't exceed gpaScale if gpaScale is reasonable
      if (gpaScale > 0 && gpaScale <= 100 && gpa > gpaScale) {
        gpa = gpaScale; // Clamp to scale if it exceeds
      }
    }
    
    return {
      institution: (e.institution as string) || '',
      major: e.major as string | undefined,
      degreeType: e.degreeType as string | undefined,
      startDate: this.convertDate(e.startDate),
      endDate: this.convertDate(e.endDate),
      gpa,
      gpaScale,
      description: e.description as string | undefined,
      orderIndex: (e.orderIndex as number) ?? 0,
    };
  }

  // Helper function to convert skill entry to CreateSkillDto
  private convertSkillEntry(entry: unknown): CreateSkillDto | null {
    if (!entry || typeof entry !== 'object') return null;
    const e = entry as Record<string, unknown>;
    return {
      name: (e.name as string) || '',
      skillType: (e.skillType as string) ?? 'technical',
      level: e.level as string | undefined,
      yearsOfExperience: e.yearsOfExperience as number | undefined,
      proficiencyPercentage: e.proficiencyPercentage as number | undefined,
      lastUsedDate: this.convertDate(e.lastUsedDate),
      description: e.description as string | undefined,
      orderIndex: (e.orderIndex as number) ?? 0,
    };
  }

  // Helper function to convert work experience entry to CreateWorkExperienceDto
  private convertWorkExperienceEntry(entry: unknown): CreateWorkExperienceDto | null {
    if (!entry || typeof entry !== 'object') return null;
    const e = entry as Record<string, unknown>;
    const startDate = this.convertDate(e.startDate);
    if (!startDate) return null; // startDate is required
    
    return {
      companyName: (e.companyName as string) || '',
      position: (e.position as string) || '',
      role: e.role as string | undefined,
      startDate,
      endDate: this.convertDate(e.endDate),
      isCurrent: (e.isCurrent as boolean) ?? false,
      employmentType: e.employmentType as string | undefined,
      location: e.location as string | undefined,
      description: e.description as string | undefined,
      achievements: (e.achievements as string[]) ?? [],
      technologiesUsed: (e.technologiesUsed as string[]) ?? [],
      orderIndex: (e.orderIndex as number) ?? 0,
    };
  }

  // Helper function to convert project entry to CreateProjectDto
  private convertProjectEntry(entry: unknown): CreateProjectDto | null {
    if (!entry || typeof entry !== 'object') return null;
    const e = entry as Record<string, unknown>;
    return {
      name: (e.name as string) || '',
      company: e.company as string | undefined,
      startDate: this.convertDate(e.startDate),
      endDate: this.convertDate(e.endDate),
      isCurrent: (e.isCurrent as boolean) ?? false,
      position: e.position as string | undefined,
      role: e.role as string | undefined,
      description: e.description as string | undefined,
      achievements: (e.achievements as string[]) ?? [],
      technologiesUsed: (e.technologiesUsed as string[]) ?? [],
      projectUrl: e.projectUrl as string | undefined,
      orderIndex: (e.orderIndex as number) ?? 0,
    };
  }

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
    const savedCandidate = await this.candidateRepository.save(candidate);

    // Sync detailed fields if provided
    if (createDto.educations && Array.isArray(createDto.educations)) {
      for (const entry of createDto.educations) {
        const dto = this.convertEducationEntry(entry);
        if (dto) {
          await this.educationService.createEducation(savedCandidate.id, dto, userId);
        }
      }
    }

    if (createDto.skillsDetailed && Array.isArray(createDto.skillsDetailed)) {
      for (const entry of createDto.skillsDetailed) {
        const dto = this.convertSkillEntry(entry);
        if (dto) {
          try {
            await this.skillService.createSkill(savedCandidate.id, dto, userId);
          } catch (error) {
            // Skip if skill already exists
            if (error instanceof Error && error.message.includes('already exists')) {
              continue;
            }
            throw error;
          }
        }
      }
    }

    if (createDto.workExperiences && Array.isArray(createDto.workExperiences)) {
      for (const entry of createDto.workExperiences) {
        const dto = this.convertWorkExperienceEntry(entry);
        if (dto) {
          await this.workExperienceService.createWorkExperience(savedCandidate.id, dto, userId);
        }
      }
    }

    if (createDto.projects && Array.isArray(createDto.projects)) {
      for (const entry of createDto.projects) {
        const dto = this.convertProjectEntry(entry);
        if (dto) {
          await this.projectService.createProject(savedCandidate.id, dto, userId);
        }
      }
    }

    // Reload candidate with relations
    return this.findOne(savedCandidate.id, userId);
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

    // Load relations for detailed fields
    qb.leftJoinAndSelect('candidate.educations', 'educations');
    qb.leftJoinAndSelect('candidate.skillsDetailed', 'skillsDetailed');
    qb.leftJoinAndSelect('candidate.workExperiences', 'workExperiences');
    qb.leftJoinAndSelect('candidate.projects', 'projects');

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
    const candidate = await this.candidateRepository.findOne({ 
      where,
      relations: ['educations', 'skillsDetailed', 'workExperiences', 'projects'],
    });
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
    
    const savedCandidate = await this.candidateRepository.save(candidate);

    // Sync detailed fields if provided (bulk replace strategy)
    if (updateDto.educations !== undefined) {
      // Get existing educations
      const existingEducations = await this.educationService.findAllByCandidate(savedCandidate.id);
      // Delete all existing
      for (const edu of existingEducations) {
        await this.educationService.deleteEducation(edu.id);
      }
      // Create new ones
      if (Array.isArray(updateDto.educations)) {
        for (const entry of updateDto.educations) {
          const dto = this.convertEducationEntry(entry);
          if (dto) {
            await this.educationService.createEducation(savedCandidate.id, dto);
          }
        }
      }
    }

    if (updateDto.skillsDetailed !== undefined) {
      // Get existing skills
      const existingSkills = await this.skillService.findAllByCandidate(savedCandidate.id);
      // Delete all existing
      for (const skill of existingSkills) {
        await this.skillService.deleteSkill(skill.id);
      }
      // Create new ones
      if (Array.isArray(updateDto.skillsDetailed)) {
        for (const entry of updateDto.skillsDetailed) {
          const dto = this.convertSkillEntry(entry);
          if (dto) {
            try {
              await this.skillService.createSkill(savedCandidate.id, dto);
            } catch (error) {
              // Skip if skill already exists (shouldn't happen after delete, but just in case)
              if (error instanceof Error && error.message.includes('already exists')) {
                continue;
              }
              throw error;
            }
          }
        }
      }
    }

    if (updateDto.workExperiences !== undefined) {
      // Get existing work experiences
      const existingWorkExps = await this.workExperienceService.findAllByCandidate(savedCandidate.id);
      // Delete all existing
      for (const we of existingWorkExps) {
        await this.workExperienceService.deleteWorkExperience(we.id);
      }
      // Create new ones
      if (Array.isArray(updateDto.workExperiences)) {
        for (const entry of updateDto.workExperiences) {
          const dto = this.convertWorkExperienceEntry(entry);
          if (dto) {
            await this.workExperienceService.createWorkExperience(savedCandidate.id, dto);
          }
        }
      }
    }

    if (updateDto.projects !== undefined) {
      // Get existing projects
      const existingProjects = await this.projectService.findAllByCandidate(savedCandidate.id);
      // Delete all existing
      for (const proj of existingProjects) {
        await this.projectService.deleteProject(proj.id);
      }
      // Create new ones
      if (Array.isArray(updateDto.projects)) {
        for (const entry of updateDto.projects) {
          const dto = this.convertProjectEntry(entry);
          if (dto) {
            await this.projectService.createProject(savedCandidate.id, dto);
          }
        }
      }
    }

    // Reload candidate with relations
    return this.findOne(savedCandidate.id);
  }

  async removeCandidate(id: string): Promise<void> {
    const candidate = await this.findOne(id);
    await this.candidateRepository.remove(candidate);
  }
}


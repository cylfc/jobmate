import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidateEducation } from '../entities/candidate-education.entity';
import { Candidate } from '../entities/candidate.entity';
import { CreateEducationDto } from '../models/dto/create-education.dto';
import { UpdateEducationDto } from '../models/dto/update-education.dto';

@Injectable()
export class CandidateEducationService {
  constructor(
    @InjectRepository(CandidateEducation)
    private readonly educationRepository: Repository<CandidateEducation>,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  async createEducation(candidateId: string, createDto: CreateEducationDto, userId?: string): Promise<CandidateEducation> {
    // Verify candidate exists and belongs to user
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }

    if (userId && candidate.userId !== userId) {
      throw new ForbiddenException('You can only add education to your own candidate profile');
    }

    const education = this.educationRepository.create({
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

    return this.educationRepository.save(education);
  }

  async findAllByCandidate(candidateId: string, userId?: string): Promise<CandidateEducation[]> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }

    if (userId && candidate.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.educationRepository.find({
      where: { candidate: { id: candidateId } },
      order: { orderIndex: 'ASC', startDate: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<CandidateEducation> {
    const education = await this.educationRepository.findOne({
      where: { id },
      relations: ['candidate'],
    });

    if (!education) {
      throw new NotFoundException(`Education with ID ${id} not found`);
    }

    if (userId && education.candidate.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return education;
  }

  async updateEducation(id: string, updateDto: UpdateEducationDto, userId?: string): Promise<CandidateEducation> {
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

    return this.educationRepository.save(education);
  }

  async deleteEducation(id: string, userId?: string): Promise<void> {
    const education = await this.findOne(id, userId);
    await this.educationRepository.remove(education);
  }

  async reorderEducation(candidateId: string, orderIds: string[], userId?: string): Promise<CandidateEducation[]> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${candidateId} not found`);
    }

    if (userId && candidate.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const educations = await this.findAllByCandidate(candidateId, userId);
    const educationMap = new Map(educations.map((e) => [e.id, e]));

    // Update orderIndex based on orderIds array
    orderIds.forEach((id, index) => {
      const education = educationMap.get(id);
      if (education) {
        education.orderIndex = index;
      }
    });

    return this.educationRepository.save(educations);
  }
}


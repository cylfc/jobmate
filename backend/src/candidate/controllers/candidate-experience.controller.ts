import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { CandidateEducationService } from '../services/candidate-education.service';
import { CandidateSkillService } from '../services/candidate-skill.service';
import { CandidateWorkExperienceService } from '../services/candidate-work-experience.service';
import { CandidateProjectService } from '../services/candidate-project.service';
import { CreateEducationDto } from '../models/dto/create-education.dto';
import { UpdateEducationDto } from '../models/dto/update-education.dto';
import { CreateSkillDto } from '../models/dto/create-skill.dto';
import { UpdateSkillDto } from '../models/dto/update-skill.dto';
import { CreateWorkExperienceDto } from '../models/dto/create-work-experience.dto';
import { UpdateWorkExperienceDto } from '../models/dto/update-work-experience.dto';
import { CreateProjectDto } from '../models/dto/create-project.dto';
import { UpdateProjectDto } from '../models/dto/update-project.dto';

@ApiTags('candidates')
@Controller('candidates/:candidateId')
@ApiBearerAuth()
export class CandidateExperienceController {
  constructor(
    private readonly educationService: CandidateEducationService,
    private readonly skillService: CandidateSkillService,
    private readonly workExperienceService: CandidateWorkExperienceService,
    private readonly projectService: CandidateProjectService,
  ) {}

  // ========== Education Endpoints ==========
  @Post('education')
  @ApiOperation({ summary: 'Add education to candidate' })
  @ApiResponse({ status: 201, description: 'Education added successfully' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createEducation(
    @Param('candidateId') candidateId: string,
    @Body() createDto: CreateEducationDto,
    @CurrentUser() user: User,
  ) {
    return this.educationService.createEducation(candidateId, createDto, user.id);
  }

  @Get('education')
  @ApiOperation({ summary: 'Get all education for candidate' })
  @ApiResponse({ status: 200, description: 'List of education' })
  async getEducation(
    @Param('candidateId') candidateId: string,
    @CurrentUser() user: User,
  ) {
    return this.educationService.findAllByCandidate(candidateId, user.id);
  }

  @Put('education/:id')
  @ApiOperation({ summary: 'Update education' })
  @ApiResponse({ status: 200, description: 'Education updated' })
  async updateEducation(
    @Param('candidateId') candidateId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateEducationDto,
    @CurrentUser() user: User,
  ) {
    return this.educationService.updateEducation(id, updateDto, user.id);
  }

  @Delete('education/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete education' })
  @ApiResponse({ status: 204, description: 'Education deleted' })
  async deleteEducation(
    @Param('candidateId') candidateId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.educationService.deleteEducation(id, user.id);
  }

  // ========== Skills Endpoints ==========
  @Post('skills')
  @ApiOperation({ summary: 'Add skill to candidate' })
  @ApiResponse({ status: 201, description: 'Skill added successfully' })
  async createSkill(
    @Param('candidateId') candidateId: string,
    @Body() createDto: CreateSkillDto,
    @CurrentUser() user: User,
  ) {
    return this.skillService.createSkill(candidateId, createDto, user.id);
  }

  @Get('skills')
  @ApiOperation({ summary: 'Get all skills for candidate' })
  @ApiResponse({ status: 200, description: 'List of skills' })
  async getSkills(
    @Param('candidateId') candidateId: string,
    @CurrentUser() user: User,
  ) {
    return this.skillService.findAllByCandidate(candidateId, user.id);
  }

  @Put('skills/:id')
  @ApiOperation({ summary: 'Update skill' })
  @ApiResponse({ status: 200, description: 'Skill updated' })
  async updateSkill(
    @Param('candidateId') candidateId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateSkillDto,
    @CurrentUser() user: User,
  ) {
    return this.skillService.updateSkill(id, updateDto, user.id);
  }

  @Delete('skills/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete skill' })
  @ApiResponse({ status: 204, description: 'Skill deleted' })
  async deleteSkill(
    @Param('candidateId') candidateId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.skillService.deleteSkill(id, user.id);
  }

  // ========== Work Experience Endpoints ==========
  @Post('work-experience')
  @ApiOperation({ summary: 'Add work experience to candidate' })
  @ApiResponse({ status: 201, description: 'Work experience added successfully' })
  async createWorkExperience(
    @Param('candidateId') candidateId: string,
    @Body() createDto: CreateWorkExperienceDto,
    @CurrentUser() user: User,
  ) {
    return this.workExperienceService.createWorkExperience(candidateId, createDto, user.id);
  }

  @Get('work-experience')
  @ApiOperation({ summary: 'Get all work experience for candidate' })
  @ApiResponse({ status: 200, description: 'List of work experience' })
  async getWorkExperience(
    @Param('candidateId') candidateId: string,
    @CurrentUser() user: User,
  ) {
    return this.workExperienceService.findAllByCandidate(candidateId, user.id);
  }

  @Put('work-experience/:id')
  @ApiOperation({ summary: 'Update work experience' })
  @ApiResponse({ status: 200, description: 'Work experience updated' })
  async updateWorkExperience(
    @Param('candidateId') candidateId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkExperienceDto,
    @CurrentUser() user: User,
  ) {
    return this.workExperienceService.updateWorkExperience(id, updateDto, user.id);
  }

  @Delete('work-experience/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete work experience' })
  @ApiResponse({ status: 204, description: 'Work experience deleted' })
  async deleteWorkExperience(
    @Param('candidateId') candidateId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.workExperienceService.deleteWorkExperience(id, user.id);
  }

  // ========== Projects Endpoints ==========
  @Post('projects')
  @ApiOperation({ summary: 'Add project to candidate' })
  @ApiResponse({ status: 201, description: 'Project added successfully' })
  async createProject(
    @Param('candidateId') candidateId: string,
    @Body() createDto: CreateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectService.createProject(candidateId, createDto, user.id);
  }

  @Get('projects')
  @ApiOperation({ summary: 'Get all projects for candidate' })
  @ApiResponse({ status: 200, description: 'List of projects' })
  async getProjects(
    @Param('candidateId') candidateId: string,
    @CurrentUser() user: User,
  ) {
    return this.projectService.findAllByCandidate(candidateId, user.id);
  }

  @Put('projects/:id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  async updateProject(
    @Param('candidateId') candidateId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectService.updateProject(id, updateDto, user.id);
  }

  @Delete('projects/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 204, description: 'Project deleted' })
  async deleteProject(
    @Param('candidateId') candidateId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    await this.projectService.deleteProject(id, user.id);
  }
}


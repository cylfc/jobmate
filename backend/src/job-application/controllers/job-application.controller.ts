import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JobApplicationService } from '../services/job-application.service';
import { CreateApplicationDto } from '../models/dto/create-application.dto';
import { UpdateApplicationDto } from '../models/dto/update-application.dto';
import { QueryApplicationDto } from '../models/dto/query-application.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { User } from '../../auth/entities/user.entity';

@ApiTags('applications')
@Controller('applications')
export class JobApplicationController {
  constructor(private readonly applicationService: JobApplicationService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new application (auto-linked to current user)' })
  @ApiResponse({ status: 201, description: 'Application created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Application already exists' })
  async createApplication(
    @Body() createDto: CreateApplicationDto,
    @CurrentUser() user: User,
  ) {
    return this.applicationService.createApplication(createDto, user.id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all applications (filtered by current user)' })
  @ApiResponse({ status: 200, description: 'List of applications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() queryDto: QueryApplicationDto,
    @CurrentUser() user: User,
  ) {
    return this.applicationService.findAll(queryDto, user.id, user.role);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get application by ID (own or job owner)' })
  @ApiResponse({ status: 200, description: 'Application found' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.applicationService.findOne(id, user.id, user.role);
  }

  @Get('job/:jobId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get applications for a job (job owner only)' })
  @ApiResponse({ status: 200, description: 'List of applications for the job' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found or access denied' })
  async findByJob(@Param('jobId') jobId: string, @CurrentUser() user: User) {
    return this.applicationService.findByJob(jobId, user.id);
  }

  @Get('candidate/:candidateId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get applications for a candidate (own applications only)' })
  @ApiResponse({ status: 200, description: 'List of applications for the candidate' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Candidate not found or access denied' })
  async findByCandidate(@Param('candidateId') candidateId: string, @CurrentUser() user: User) {
    return this.applicationService.findByCandidate(candidateId, user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update application (job owner only)' })
  @ApiResponse({ status: 200, description: 'Application updated' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateApplication(
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationDto,
    @CurrentUser() user: User,
  ) {
    return this.applicationService.updateApplication(id, updateDto, user.id, user.role);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete application (own or job owner)' })
  @ApiResponse({ status: 204, description: 'Application deleted' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async removeApplication(@Param('id') id: string, @CurrentUser() user: User) {
    await this.applicationService.removeApplication(id, user.id, user.role);
  }

  @Get('admin/test')
  @Public()
  @ApiOperation({ summary: 'Smoke test endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async test() {
    return { status: 'ok', message: 'Job application service is working' };
  }
}


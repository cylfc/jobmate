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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobApplicationService } from '../services/job-application.service';
import { CreateApplicationDto } from '../models/dto/create-application.dto';
import { UpdateApplicationDto } from '../models/dto/update-application.dto';
import { QueryApplicationDto } from '../models/dto/query-application.dto';

@ApiTags('applications')
@Controller('applications')
export class JobApplicationController {
  constructor(private readonly applicationService: JobApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({ status: 201, description: 'Application created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Application already exists' })
  async createApplication(@Body() createDto: CreateApplicationDto) {
    return this.applicationService.createApplication(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  @ApiResponse({ status: 200, description: 'List of applications' })
  async findAll(@Query() queryDto: QueryApplicationDto) {
    return this.applicationService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: 200, description: 'Application found' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findOne(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get applications for a job' })
  @ApiResponse({ status: 200, description: 'List of applications for the job' })
  async findByJob(@Param('jobId') jobId: string) {
    return this.applicationService.findByJob(jobId);
  }

  @Get('candidate/:candidateId')
  @ApiOperation({ summary: 'Get applications for a candidate' })
  @ApiResponse({ status: 200, description: 'List of applications for the candidate' })
  async findByCandidate(@Param('candidateId') candidateId: string) {
    return this.applicationService.findByCandidate(candidateId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update application' })
  @ApiResponse({ status: 200, description: 'Application updated' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async updateApplication(
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationDto,
  ) {
    return this.applicationService.updateApplication(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete application' })
  @ApiResponse({ status: 204, description: 'Application deleted' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async removeApplication(@Param('id') id: string) {
    await this.applicationService.removeApplication(id);
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Smoke test endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async test() {
    return { status: 'ok', message: 'Job application service is working' };
  }
}


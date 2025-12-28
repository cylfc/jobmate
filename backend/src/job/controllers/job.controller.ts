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
import { JobService } from '../services/job.service';
import { CreateJobDto } from '../models/dto/create-job.dto';
import { UpdateJobDto } from '../models/dto/update-job.dto';
import { QueryJobDto } from '../models/dto/query-job.dto';

@ApiTags('jobs')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createJob(@Body() createDto: CreateJobDto) {
    return this.jobService.createJob(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({ status: 200, description: 'List of jobs' })
  async findAll(@Query() queryDto: QueryJobDto) {
    return this.jobService.findAll(queryDto);
  }

  @Get('published')
  @ApiOperation({ summary: 'Get all published jobs' })
  @ApiResponse({ status: 200, description: 'List of published jobs' })
  async findPublished() {
    return this.jobService.findPublished();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiResponse({ status: 200, description: 'Job found' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update job' })
  @ApiResponse({ status: 200, description: 'Job updated' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async updateJob(
    @Param('id') id: string,
    @Body() updateDto: UpdateJobDto,
  ) {
    return this.jobService.updateJob(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete job' })
  @ApiResponse({ status: 204, description: 'Job deleted' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async removeJob(@Param('id') id: string) {
    await this.jobService.removeJob(id);
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Smoke test endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async test() {
    return { status: 'ok', message: 'Job service is working' };
  }
}


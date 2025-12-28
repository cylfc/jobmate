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
import { JobService } from '../services/job.service';
import { CreateJobDto } from '../models/dto/create-job.dto';
import { UpdateJobDto } from '../models/dto/update-job.dto';
import { QueryJobDto } from '../models/dto/query-job.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { User } from '../../auth/entities/user.entity';

@ApiTags('jobs')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createJob(
    @Body() createDto: CreateJobDto,
    @CurrentUser() user: User,
  ) {
    return this.jobService.createJob(createDto, user.id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all jobs (public)' })
  @ApiResponse({ status: 200, description: 'List of jobs' })
  async findAll(@Query() queryDto: QueryJobDto) {
    return this.jobService.findAll(queryDto);
  }

  @Get('published')
  @Public()
  @ApiOperation({ summary: 'Get all published jobs (public)' })
  @ApiResponse({ status: 200, description: 'List of published jobs' })
  async findPublished() {
    return this.jobService.findPublished();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get job by ID (public)' })
  @ApiResponse({ status: 200, description: 'Job found' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update job (job owner only)' })
  @ApiResponse({ status: 200, description: 'Job updated' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateJob(
    @Param('id') id: string,
    @Body() updateDto: UpdateJobDto,
    @CurrentUser() user: User,
  ) {
    return this.jobService.updateJob(id, updateDto, user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete job (job owner only)' })
  @ApiResponse({ status: 204, description: 'Job deleted' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async removeJob(@Param('id') id: string, @CurrentUser() user: User) {
    await this.jobService.removeJob(id, user.id);
  }

  @Get('admin/test')
  @Public()
  @ApiOperation({ summary: 'Smoke test endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async test() {
    return { status: 'ok', message: 'Job service is working' };
  }
}


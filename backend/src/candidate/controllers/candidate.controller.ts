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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CandidateService } from '../services/candidate.service';
import { CreateCandidateDto } from '../models/dto/create-candidate.dto';
import { UpdateCandidateDto } from '../models/dto/update-candidate.dto';
import { QueryCandidateDto } from '../models/dto/query-candidate.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { User } from '../../auth/entities/user.entity';

@ApiTags('candidates')
@Controller('candidates')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({ status: 201, description: 'Candidate created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createCandidate(
    @Body() createDto: CreateCandidateDto,
    @CurrentUser() user: User,
  ) {
    return this.candidateService.createCandidate(createDto, user.id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all candidates (filtered by current user)' })
  @ApiResponse({ status: 200, description: 'List of candidates' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() queryDto: QueryCandidateDto,
    @CurrentUser() user: User,
  ) {
    return this.candidateService.findAll(queryDto, user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get candidate by ID (own profile only)' })
  @ApiResponse({ status: 200, description: 'Candidate found' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.candidateService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update candidate (own profile only)' })
  @ApiResponse({ status: 200, description: 'Candidate updated' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateCandidate(
    @Param('id') id: string,
    @Body() updateDto: UpdateCandidateDto,
    @CurrentUser() user: User,
  ) {
    const candidate = await this.candidateService.findOne(id, user.id);
    if (candidate.userId !== user.id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.candidateService.updateCandidate(id, updateDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete candidate (own profile only)' })
  @ApiResponse({ status: 204, description: 'Candidate deleted' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async removeCandidate(@Param('id') id: string, @CurrentUser() user: User) {
    const candidate = await this.candidateService.findOne(id, user.id);
    if (candidate.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    await this.candidateService.removeCandidate(id);
  }

  @Get('admin/test')
  @Public()
  @ApiOperation({ summary: 'Smoke test endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async test() {
    return { status: 'ok', message: 'Candidate service is working' };
  }
}


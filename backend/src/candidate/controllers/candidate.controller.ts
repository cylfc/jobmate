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
import { CandidateService } from '../services/candidate.service';
import { CreateCandidateDto } from '../models/dto/create-candidate.dto';
import { UpdateCandidateDto } from '../models/dto/update-candidate.dto';
import { QueryCandidateDto } from '../models/dto/query-candidate.dto';

@ApiTags('candidates')
@Controller('candidates')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({ status: 201, description: 'Candidate created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createCandidate(@Body() createDto: CreateCandidateDto) {
    return this.candidateService.createCandidate(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all candidates' })
  @ApiResponse({ status: 200, description: 'List of candidates' })
  async findAll(@Query() queryDto: QueryCandidateDto) {
    return this.candidateService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  @ApiResponse({ status: 200, description: 'Candidate found' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async findOne(@Param('id') id: string) {
    return this.candidateService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update candidate' })
  @ApiResponse({ status: 200, description: 'Candidate updated' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async updateCandidate(
    @Param('id') id: string,
    @Body() updateDto: UpdateCandidateDto,
  ) {
    return this.candidateService.updateCandidate(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete candidate' })
  @ApiResponse({ status: 204, description: 'Candidate deleted' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async removeCandidate(@Param('id') id: string) {
    await this.candidateService.removeCandidate(id);
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Smoke test endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async test() {
    return { status: 'ok', message: 'Candidate service is working' };
  }
}


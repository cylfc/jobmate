import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCandidateDto } from './create-candidate.dto';

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  educations?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  skillsDetailed?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  workExperiences?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  projects?: unknown[];
}


import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({ example: 'JavaScript' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ 
    example: 'technical', 
    enum: ['technical', 'language', 'soft', 'certification'],
    default: 'technical'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  skillType?: string;

  @ApiPropertyOptional({ 
    example: 'advanced', 
    enum: ['beginner', 'intermediate', 'advanced', 'expert', 'native']
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  level?: string;

  @ApiPropertyOptional({ example: 5.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ example: 85, description: 'Proficiency percentage 0-100' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  proficiencyPercentage?: number;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  lastUsedDate?: string;

  @ApiPropertyOptional({ example: 'Used in production systems' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  orderIndex?: number;
}


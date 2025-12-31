import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEducationDto {
  @ApiProperty({ example: 'University of Technology' })
  @IsString()
  @MaxLength(255)
  institution!: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  major?: string;

  @ApiPropertyOptional({ example: 'Bachelor', enum: ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate'] })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  degreeType?: string;

  @ApiPropertyOptional({ example: '2018-09-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2022-06-30' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 3.8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  gpa?: number;

  @ApiPropertyOptional({ example: 4.0, default: 4.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  gpaScale?: number;

  @ApiPropertyOptional({ example: 'Graduated with honors' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  orderIndex?: number;
}


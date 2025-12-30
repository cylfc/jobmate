import {
  IsEmail,
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/resume.pdf' })
  @IsOptional()
  @IsUrl()
  resumeUrl?: string;

  @ApiPropertyOptional({ example: 'Tech Solutions Inc.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  currentCompany?: string;

  @ApiPropertyOptional({ example: { amount: 5000, currency: 'USD' } })
  @IsOptional()
  currentSalary?: { amount: number; currency: string };

  @ApiPropertyOptional({ example: { min: 6000, max: 8000, currency: 'USD' } })
  @IsOptional()
  expectedSalary?: { min: number; max: number; currency: string };

  @ApiPropertyOptional({ example: ['JavaScript', 'TypeScript', 'Node.js'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  experience?: Record<string, unknown>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  education?: Record<string, unknown>[];
}


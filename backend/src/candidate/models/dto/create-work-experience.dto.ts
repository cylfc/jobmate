import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsArray,
  IsInt,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkExperienceDto {
  @ApiProperty({ example: 'Tech Solutions Inc.' })
  @IsString()
  @MaxLength(255)
  companyName!: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @MaxLength(255)
  position!: string;

  @ApiPropertyOptional({ example: 'Team Lead' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  role?: string;

  @ApiProperty({ example: '2020-01-01' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({ example: '2023-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @ApiPropertyOptional({ 
    example: 'FULL_TIME',
    enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE']
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employmentType?: string;

  @ApiPropertyOptional({ example: 'San Francisco, CA' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ example: 'Led development of microservices architecture' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    example: ['Led team of 5 developers', 'Improved system performance by 40%'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];

  @ApiPropertyOptional({ 
    example: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologiesUsed?: string[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  orderIndex?: number;
}


# Technical Specification: Candidate & Job Modules

## Dependencies to Install

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "@types/pg": "^8.10.0",
    "@types/joi": "^17.2.3",
    "ts-node": "^10.9.0"
  }
}
```

**Note**: `joi` is optional but recommended for environment variable validation. See [NestJS Configuration documentation](https://docs.nestjs.com/techniques/configuration#schema-validation).

## Database Schema (PostgreSQL)

### Enums

```sql
CREATE TYPE employment_type AS ENUM (
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'REMOTE'
);

CREATE TYPE job_status AS ENUM (
  'DRAFT',
  'PUBLISHED',
  'CLOSED',
  'ARCHIVED'
);

CREATE TYPE application_status AS ENUM (
  'PENDING',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEWED',
  'REJECTED',
  'ACCEPTED'
);
```

### Tables

```sql
-- Jobs Table
CREATE TABLE job (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  salary_min DECIMAL(10, 2),
  salary_max DECIMAL(10, 2),
  employment_type employment_type NOT NULL DEFAULT 'FULL_TIME',
  status job_status NOT NULL DEFAULT 'DRAFT',
  requirements JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  posted_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_status ON job(status);
CREATE INDEX idx_job_posted_at ON job(posted_at);
CREATE INDEX idx_job_company ON job(company);

-- Candidates Table
CREATE TABLE candidate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  resume_url VARCHAR(500),
  skills JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidate_email ON candidate(email);

-- Job Applications Table
CREATE TABLE job_application (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'PENDING',
  cover_letter TEXT,
  resume_url VARCHAR(500),
  notes TEXT,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, candidate_id)
);

CREATE INDEX idx_application_job_id ON job_application(job_id);
CREATE INDEX idx_application_candidate_id ON job_application(candidate_id);
CREATE INDEX idx_application_status ON job_application(status);
CREATE INDEX idx_application_applied_at ON job_application(applied_at);
```

## Entity Definitions

### Base Entity (Optional)

```typescript
// shared/entities/base.entity.ts
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
```

### Job Entity

```typescript
// job/entities/job.entity.ts
import {
  Entity,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  REMOTE = 'REMOTE',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('job')
@Index(['status'])
@Index(['postedAt'])
@Index(['company'])
export class Job extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255 })
  company!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryMin?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryMax?: number;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType!: EmploymentType;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.DRAFT,
  })
  status!: JobStatus;

  @Column({ type: 'jsonb', default: '[]' })
  requirements: string[] = [];

  @Column({ type: 'jsonb', default: '[]' })
  benefits: string[] = [];

  @Column({ type: 'timestamp', nullable: true })
  postedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;
}
```

### Candidate Entity

```typescript
// candidate/entities/candidate.entity.ts
import {
  Entity,
  Column,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';

@Entity('candidate')
@Unique(['email'])
@Index(['email'])
export class Candidate extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  resumeUrl?: string;

  @Column({ type: 'jsonb', default: '[]' })
  skills: string[] = [];

  @Column({ type: 'jsonb', default: '[]' })
  experience: Record<string, unknown>[] = [];

  @Column({ type: 'jsonb', default: '[]' })
  education: Record<string, unknown>[] = [];
}
```

### JobApplication Entity

```typescript
// job-application/entities/job-application.entity.ts
import {
  Entity,
  Column,
  ManyToOne,
  Unique,
  Index,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Job } from '../../job/entities/job.entity';
import { Candidate } from '../../candidate/entities/candidate.entity';

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWED = 'INTERVIEWED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
}

@Entity('job_application')
@Unique(['job', 'candidate'])
@Index(['job'])
@Index(['candidate'])
@Index(['status'])
@Index(['appliedAt'])
export class JobApplication extends BaseEntity {
  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job!: Job;

  @ManyToOne(() => Candidate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Candidate;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status!: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  coverLetter?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  resumeUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  appliedAt!: Date;
}
```

## DTO Examples

### Create Candidate DTO

```typescript
// candidate/models/dto/create-candidate.dto.ts
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
```

### Query Candidate DTO

```typescript
// candidate/models/dto/query-candidate.dto.ts
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCandidateDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'email' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
```

### Create Job DTO

```typescript
// job/models/dto/create-job.dto.ts
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentType, JobStatus } from '../../entities/job.entity';

export class CreateJobDto {
  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ example: 'We are looking for...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Tech Corp' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  company!: string;

  @ApiPropertyOptional({ example: 'San Francisco, CA' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 80000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional({ example: 120000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @ApiPropertyOptional({ enum: EmploymentType, default: EmploymentType.FULL_TIME })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ enum: JobStatus, default: JobStatus.DRAFT })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ example: ['5+ years experience', 'Bachelor degree'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiPropertyOptional({ example: ['Health insurance', 'Remote work'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  postedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
```

## Service Examples

### Candidate Service

```typescript
// candidate/services/candidate.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { CreateCandidateDto } from '../models/dto/create-candidate.dto';
import { UpdateCandidateDto } from '../models/dto/update-candidate.dto';
import { QueryCandidateDto } from '../models/dto/query-candidate.dto';

@Injectable()
export class CandidateService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}

  async createCandidate(createDto: CreateCandidateDto): Promise<Candidate> {
    const candidate = this.candidateRepository.create(createDto);
    return this.candidateRepository.save(candidate);
  }

  async findAll(queryDto: QueryCandidateDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;
    const offset = (page - 1) * limit;

    const qb = this.candidateRepository.createQueryBuilder('candidate');

    if (search) {
      qb.where(
        '(candidate.firstName ILIKE :search OR candidate.lastName ILIKE :search OR candidate.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy(`candidate.${sortBy}`, sortOrder);
    qb.limit(limit);
    qb.offset(offset);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({ where: { id } });
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
    return candidate;
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    return this.candidateRepository.findOne({ where: { email } });
  }

  async updateCandidate(id: string, updateDto: UpdateCandidateDto): Promise<Candidate> {
    const candidate = await this.findOne(id);
    Object.assign(candidate, updateDto);
    return this.candidateRepository.save(candidate);
  }

  async removeCandidate(id: string): Promise<void> {
    const candidate = await this.findOne(id);
    await this.candidateRepository.remove(candidate);
  }
}
```

## Controller Examples

### Candidate Controller

```typescript
// candidate/controllers/candidate.controller.ts
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
```

## Module Examples

### Candidate Module

```typescript
// candidate/candidate.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateController } from './controllers/candidate.controller';
import { CandidateService } from './services/candidate.service';
import { Candidate } from './entities/candidate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate])],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}
```

## Database Configuration

### TypeORM Config

```typescript
// database/config/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USER', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'postgres'),
  database: configService.get<string>('DB_NAME', 'jobmate_db'),
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: configService.get<string>('NODE_ENV') !== 'production',
  logging: configService.get<string>('NODE_ENV') === 'development',
  // Additional TypeORM options
  autoLoadEntities: true, // Automatically load entities (NestJS best practice)
  retryAttempts: 3,
  retryDelay: 3000,
});
```

**Note**: According to [NestJS official documentation](https://docs.nestjs.com/techniques/database), using `autoLoadEntities: true` is recommended as it automatically loads entities from registered modules.

### Database Module

```typescript
// database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTypeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

## Main Application Setup

### Updated main.ts

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  // Reference: https://docs.nestjs.com/techniques/validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
      // Additional options for better error messages
      disableErrorMessages: false,
      validationError: {
        target: false, // Don't expose target object in error
        value: false, // Don't expose value in error
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('JobMate API')
    .setDescription('JobMate Backend API Documentation')
    .setVersion('1.0')
    .addTag('candidates')
    .addTag('jobs')
    .addTag('applications')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // CORS (if needed)
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
```

### Updated app.module.ts

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CandidateModule } from './candidate/candidate.module';
import { JobModule } from './job/job.module';
import { JobApplicationModule } from './job-application/job-application.module';

@Module({
  imports: [
    // ConfigModule should be imported first and made global
    // Reference: https://docs.nestjs.com/techniques/configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      // Optional: Add validation schema for environment variables
      // validationSchema: Joi.object({ ... }),
    }),
    DatabaseModule,
    CandidateModule,
    JobModule,
    JobApplicationModule,
  ],
})
export class AppModule {}
```

### Environment Variables Validation (Optional but Recommended)

```typescript
// config/env.validation.ts
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});
```

Then update ConfigModule:

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  validationSchema: envValidationSchema,
  validationOptions: {
    allowUnknown: true,
    abortEarly: true,
  },
}),
```


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplicationController } from './controllers/job-application.controller';
import { JobApplicationService } from './services/job-application.service';
import { JobApplication } from './entities/job-application.entity';
import { Job } from '../job/entities/job.entity';
import { Candidate } from '../candidate/entities/candidate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication, Job, Candidate]),
  ],
  controllers: [JobApplicationController],
  providers: [JobApplicationService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}


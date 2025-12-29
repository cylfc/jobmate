import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { KpiService } from './services/kpi.service';
import { PipelineService } from './services/pipeline.service';
import { ActivityService } from './services/activity.service';
import { Job } from '../job/entities/job.entity';
import { Candidate } from '../candidate/entities/candidate.entity';
import { JobApplication } from '../job-application/entities/job-application.entity';

/**
 * Dashboard Module
 * Provides dashboard statistics and KPIs
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Job, Candidate, JobApplication]),
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    KpiService,
    PipelineService,
    ActivityService,
  ],
  exports: [DashboardService],
})
export class DashboardModule {}


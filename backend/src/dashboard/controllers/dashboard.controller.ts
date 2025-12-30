import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
import { KpiService } from '../services/kpi.service';
import { PipelineService } from '../services/pipeline.service';
import { ActivityService } from '../services/activity.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { QueryDashboardDto } from '../models/dto/query-dashboard.dto';

/**
 * Dashboard Controller
 * Handles dashboard API endpoints
 */
@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly kpiService: KpiService,
    private readonly pipelineService: PipelineService,
    private readonly activityService: ActivityService,
  ) {}

  /**
   * Get dashboard KPIs
   */
  @Get('kpis')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard KPIs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        openJobs: { type: 'number', example: 12 },
        candidatesInPipeline: { type: 'number', example: 48 },
        matchesThisWeek: { type: 'number', example: 21 },
        averageMatchScore: { type: 'number', example: 72 },
        timeToShortlist: { type: 'number', example: 3 },
      },
    },
  })
  async getKpis(@CurrentUser() user: User) {
    return this.kpiService.getKpis(user.id);
  }

  /**
   * Get active jobs
   */
  @Get('active-jobs')
  @ApiOperation({ summary: 'Get active jobs with statistics' })
  @ApiResponse({
    status: 200,
    description: 'Active jobs retrieved successfully',
  })
  async getActiveJobs(
    @CurrentUser() user: User,
    @Query() queryDto: QueryDashboardDto,
  ) {
    const limit = queryDto.limit || 10;
    return this.dashboardService.getActiveJobs(user.id, limit);
  }

  /**
   * Get candidate pipeline stages
   */
  @Get('pipeline')
  @ApiOperation({ summary: 'Get candidate pipeline stages' })
  @ApiResponse({
    status: 200,
    description: 'Pipeline stages retrieved successfully',
  })
  async getPipeline(@CurrentUser() user: User) {
    return this.pipelineService.getPipelineStages(user.id);
  }

  /**
   * Get matching health metrics
   */
  @Get('matching-health')
  @ApiOperation({ summary: 'Get matching health metrics' })
  @ApiResponse({
    status: 200,
    description: 'Matching health metrics retrieved successfully',
  })
  async getMatchingHealth(@CurrentUser() user: User) {
    return this.dashboardService.getMatchingHealth(user.id);
  }

  /**
   * Get dashboard alerts
   */
  @Get('alerts')
  @ApiOperation({ summary: 'Get dashboard alerts and tasks' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard alerts retrieved successfully',
  })
  async getAlerts(@CurrentUser() user: User) {
    return this.dashboardService.getAlerts(user.id);
  }

  /**
   * Get recent activities
   */
  @Get('activities')
  @ApiOperation({ summary: 'Get recent activity timeline' })
  @ApiResponse({
    status: 200,
    description: 'Recent activities retrieved successfully',
  })
  async getActivities(
    @CurrentUser() user: User,
    @Query() queryDto: QueryDashboardDto,
  ) {
    const limit = queryDto.limit || 20;
    return this.activityService.getRecentActivities(user.id, limit, queryDto.cursor);
  }

  /**
   * Smoke test endpoint
   */
  @Get('admin/test')
  @ApiOperation({ summary: 'Smoke test endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async test() {
    return { status: 'ok', message: 'Dashboard service is working' };
  }
}



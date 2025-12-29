import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from '../services/settings.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { UpdateNotificationSettingsDto } from '../models/dto/notification-settings.dto';
import { UpdateSystemConfigDto } from '../models/dto/system-config.dto';
import { UpdateSecuritySettingsDto } from '../models/dto/security-settings.dto';
import { TimeFormat, DateFormat, Theme, Language } from '../models/enums/system-config.enum';
import { COMMON_TIMEZONES } from '../models/constants/timezone.constants';

/**
 * Settings Controller
 * Handles user settings endpoints
 */
@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Get all settings for the current user
   */
  @Get()
  @ApiOperation({ summary: 'Get all user settings' })
  @ApiResponse({
    status: 200,
    description: 'User settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        notification: {
          type: 'object',
          description: 'Notification settings',
        },
        system: {
          type: 'object',
          description: 'System configuration',
        },
        security: {
          type: 'object',
          description: 'Security settings',
        },
        additional: {
          type: 'object',
          description: 'Additional custom settings',
        },
      },
    },
  })
  async getAllSettings(@CurrentUser() user: User) {
    return this.settingsService.getAllSettings(user.id);
  }

  /**
   * Get notification settings
   */
  @Get('notification')
  @ApiOperation({ summary: 'Get notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings retrieved successfully',
  })
  async getNotificationSettings(@CurrentUser() user: User) {
    return this.settingsService.getNotificationSettings(user.id);
  }

  /**
   * Update notification settings
   */
  @Put('notification')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings updated successfully',
  })
  async updateNotificationSettings(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateNotificationSettingsDto,
  ) {
    return this.settingsService.updateNotificationSettings(user.id, updateDto);
  }

  /**
   * Get system configuration
   */
  @Get('system')
  @ApiOperation({ summary: 'Get system configuration' })
  @ApiResponse({
    status: 200,
    description: 'System configuration retrieved successfully',
  })
  async getSystemConfig(@CurrentUser() user: User) {
    return this.settingsService.getSystemConfig(user.id);
  }

  /**
   * Update system configuration
   */
  @Put('system')
  @ApiOperation({ summary: 'Update system configuration' })
  @ApiResponse({
    status: 200,
    description: 'System configuration updated successfully',
  })
  async updateSystemConfig(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateSystemConfigDto,
  ) {
    return this.settingsService.updateSystemConfig(user.id, updateDto);
  }

  /**
   * Get security settings
   */
  @Get('security')
  @ApiOperation({ summary: 'Get security settings' })
  @ApiResponse({
    status: 200,
    description: 'Security settings retrieved successfully',
  })
  async getSecuritySettings(@CurrentUser() user: User) {
    return this.settingsService.getSecuritySettings(user.id);
  }

  /**
   * Update security settings
   */
  @Put('security')
  @ApiOperation({ summary: 'Update security settings' })
  @ApiResponse({
    status: 200,
    description: 'Security settings updated successfully',
  })
  async updateSecuritySettings(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateSecuritySettingsDto,
  ) {
    return this.settingsService.updateSecuritySettings(user.id, updateDto);
  }

  /**
   * Get system configuration options
   * Returns available options for dropdowns (timezones, date formats, etc.)
   */
  @Get('system/options')
  @ApiOperation({ summary: 'Get system configuration options' })
  @ApiResponse({
    status: 200,
    description: 'System configuration options retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        timezones: {
          type: 'array',
          items: { type: 'string' },
          description: 'Available timezone identifiers',
        },
        dateFormats: {
          type: 'array',
          items: { type: 'string' },
          description: 'Available date format options',
        },
        timeFormats: {
          type: 'array',
          items: { type: 'string' },
          description: 'Available time format options',
        },
        themes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Available theme options',
        },
        languages: {
          type: 'array',
          items: { type: 'string' },
          description: 'Available language options',
        },
      },
    },
  })
  async getSystemConfigOptions() {
    return {
      timezones: COMMON_TIMEZONES,
      dateFormats: Object.values(DateFormat),
      timeFormats: Object.values(TimeFormat),
      themes: Object.values(Theme),
      languages: Object.values(Language),
    };
  }

  /**
   * Smoke test endpoint
   */
  @Get('admin/test')
  @ApiOperation({ summary: 'Smoke test endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async test() {
    return { status: 'ok', message: 'Settings service is working' };
  }
}

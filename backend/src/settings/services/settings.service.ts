import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from '../entities/user-settings.entity';
import { UpdateNotificationSettingsDto } from '../models/dto/notification-settings.dto';
import { UpdateSystemConfigDto } from '../models/dto/system-config.dto';
import { UpdateSecuritySettingsDto } from '../models/dto/security-settings.dto';
import { TimeFormat, DateFormat, Theme, Language } from '../models/enums/system-config.enum';

/**
 * Settings Service
 * Manages user settings including notifications, system config, and security
 */
@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly settingsRepository: Repository<UserSettings>,
  ) {}

  /**
   * Get or create user settings
   * Creates default settings if they don't exist
   */
  async getOrCreateSettings(userId: string): Promise<UserSettings> {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!settings) {
      settings = this.settingsRepository.create({
        userId,
        notificationSettings: {
          emailJobMatches: true,
          emailNewCandidates: true,
          emailWeeklyDigest: true,
          pushJobMatches: true,
          pushNewCandidates: true,
          pushMessages: true,
          inAppJobMatches: true,
          inAppNewCandidates: true,
          inAppMessages: true,
        },
        systemConfig: {
          timezone: 'UTC',
          dateFormat: DateFormat.YYYY_MM_DD,
          timeFormat: TimeFormat.HOUR_24,
          language: Language.EN,
          theme: Theme.AUTO,
        },
        securitySettings: {
          twoFactorEnabled: false,
          sessionTimeout: 30,
          loginNotifications: true,
        },
      });
      settings = await this.settingsRepository.save(settings);
    }

    return settings;
  }

  /**
   * Get user settings by user ID
   */
  async getSettings(userId: string): Promise<UserSettings> {
    return this.getOrCreateSettings(userId);
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(userId: string) {
    const settings = await this.getOrCreateSettings(userId);
    return settings.notificationSettings;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    userId: string,
    updateDto: UpdateNotificationSettingsDto,
  ) {
    const settings = await this.getOrCreateSettings(userId);
    
    settings.notificationSettings = {
      ...settings.notificationSettings,
      ...updateDto,
    };

    const updated = await this.settingsRepository.save(settings);
    return updated.notificationSettings;
  }

  /**
   * Get system configuration
   */
  async getSystemConfig(userId: string) {
    const settings = await this.getOrCreateSettings(userId);
    return settings.systemConfig;
  }

  /**
   * Update system configuration
   */
  async updateSystemConfig(
    userId: string,
    updateDto: UpdateSystemConfigDto,
  ) {
    const settings = await this.getOrCreateSettings(userId);
    
    settings.systemConfig = {
      ...settings.systemConfig,
      ...updateDto,
    };

    const updated = await this.settingsRepository.save(settings);
    return updated.systemConfig;
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(userId: string) {
    const settings = await this.getOrCreateSettings(userId);
    return settings.securitySettings;
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(
    userId: string,
    updateDto: UpdateSecuritySettingsDto,
  ) {
    const settings = await this.getOrCreateSettings(userId);
    
    settings.securitySettings = {
      ...settings.securitySettings,
      ...updateDto,
    };

    const updated = await this.settingsRepository.save(settings);
    return updated.securitySettings;
  }

  /**
   * Get all settings for a user
   */
  async getAllSettings(userId: string) {
    const settings = await this.getOrCreateSettings(userId);
    return {
      notification: settings.notificationSettings,
      system: settings.systemConfig,
      security: settings.securitySettings,
      additional: settings.additionalSettings || {},
    };
  }

  /**
   * Update additional settings (for future extensibility)
   */
  async updateAdditionalSettings(
    userId: string,
    additionalSettings: Record<string, unknown>,
  ) {
    const settings = await this.getOrCreateSettings(userId);
    
    settings.additionalSettings = {
      ...(settings.additionalSettings || {}),
      ...additionalSettings,
    };

    const updated = await this.settingsRepository.save(settings);
    return updated.additionalSettings;
  }
}


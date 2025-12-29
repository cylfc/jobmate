import {
  Entity,
  Column,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { User } from '../../auth/entities/user.entity';
import { TimeFormat, DateFormat, Theme, Language } from '../models/enums/system-config.enum';

/**
 * UserSettings Entity
 * Stores user-specific settings including notifications, system preferences, and security settings
 * Uses JSONB columns for flexibility and extensibility
 */
@Entity('user_settings')
@Index(['userId'])
export class UserSettings extends BaseEntity {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid', unique: true })
  userId!: string;

  /**
   * Notification Settings
   * Controls email, push, and in-app notifications
   */
  @Column({
    type: 'jsonb',
    default: {
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
  })
  notificationSettings!: {
    emailJobMatches: boolean;
    emailNewCandidates: boolean;
    emailWeeklyDigest: boolean;
    pushJobMatches: boolean;
    pushNewCandidates: boolean;
    pushMessages: boolean;
    inAppJobMatches: boolean;
    inAppNewCandidates: boolean;
    inAppMessages: boolean;
  };

  /**
   * System Configuration
   * User preferences for timezone, date/time format, language, theme
   */
  @Column({
    type: 'jsonb',
    default: {
      timezone: 'UTC',
      dateFormat: DateFormat.YYYY_MM_DD,
      timeFormat: TimeFormat.HOUR_24,
      language: Language.EN,
      theme: Theme.AUTO,
    },
  })
  systemConfig!: {
    timezone: string;
    dateFormat: DateFormat;
    timeFormat: TimeFormat;
    language?: Language;
    theme?: Theme;
  };

  /**
   * Security Settings
   * Two-factor authentication, session timeout, login notifications
   */
  @Column({
    type: 'jsonb',
    default: {
      twoFactorEnabled: false,
      sessionTimeout: 30, // minutes
      loginNotifications: true,
    },
  })
  securitySettings!: {
    twoFactorEnabled?: boolean;
    sessionTimeout?: number; // in minutes
    loginNotifications?: boolean;
  };

  /**
   * Additional Settings (for future extensibility)
   * Can be used for any custom settings without schema changes
   */
  @Column({
    type: 'jsonb',
    default: {},
    nullable: true,
  })
  additionalSettings?: Record<string, unknown>;
}


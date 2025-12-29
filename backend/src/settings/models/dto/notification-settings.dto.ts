import {
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Notification Settings DTO
 * Defines user preferences for various notification types
 */
export class NotificationSettingsDto {
  @ApiProperty({
    description: 'Receive email notifications for job matches',
    example: true,
    default: true,
  })
  @IsBoolean()
  emailJobMatches!: boolean;

  @ApiProperty({
    description: 'Receive email notifications for new candidates',
    example: true,
    default: true,
  })
  @IsBoolean()
  emailNewCandidates!: boolean;

  @ApiProperty({
    description: 'Receive weekly digest emails',
    example: true,
    default: true,
  })
  @IsBoolean()
  emailWeeklyDigest!: boolean;

  @ApiProperty({
    description: 'Receive push notifications for job matches',
    example: true,
    default: true,
  })
  @IsBoolean()
  pushJobMatches!: boolean;

  @ApiProperty({
    description: 'Receive push notifications for new candidates',
    example: true,
    default: true,
  })
  @IsBoolean()
  pushNewCandidates!: boolean;

  @ApiProperty({
    description: 'Receive push notifications for messages',
    example: true,
    default: true,
  })
  @IsBoolean()
  pushMessages!: boolean;

  @ApiProperty({
    description: 'Receive in-app notifications for job matches',
    example: true,
    default: true,
  })
  @IsBoolean()
  inAppJobMatches!: boolean;

  @ApiProperty({
    description: 'Receive in-app notifications for new candidates',
    example: true,
    default: true,
  })
  @IsBoolean()
  inAppNewCandidates!: boolean;

  @ApiProperty({
    description: 'Receive in-app notifications for messages',
    example: true,
    default: true,
  })
  @IsBoolean()
  inAppMessages!: boolean;
}

/**
 * Update Notification Settings DTO
 * All fields are optional for partial updates
 */
export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({
    description: 'Receive email notifications for job matches',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  emailJobMatches?: boolean;

  @ApiPropertyOptional({
    description: 'Receive email notifications for new candidates',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  emailNewCandidates?: boolean;

  @ApiPropertyOptional({
    description: 'Receive weekly digest emails',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  emailWeeklyDigest?: boolean;

  @ApiPropertyOptional({
    description: 'Receive push notifications for job matches',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  pushJobMatches?: boolean;

  @ApiPropertyOptional({
    description: 'Receive push notifications for new candidates',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  pushNewCandidates?: boolean;

  @ApiPropertyOptional({
    description: 'Receive push notifications for messages',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  pushMessages?: boolean;

  @ApiPropertyOptional({
    description: 'Receive in-app notifications for job matches',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  inAppJobMatches?: boolean;

  @ApiPropertyOptional({
    description: 'Receive in-app notifications for new candidates',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  inAppNewCandidates?: boolean;

  @ApiPropertyOptional({
    description: 'Receive in-app notifications for messages',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  inAppMessages?: boolean;
}


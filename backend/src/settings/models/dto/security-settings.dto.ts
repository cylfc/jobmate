import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Security Settings DTO
 * Defines user security preferences
 */
export class SecuritySettingsDto {
  @ApiPropertyOptional({
    description: 'Enable two-factor authentication',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Session timeout in minutes',
    example: 30,
    default: 30,
    minimum: 5,
    maximum: 1440, // 24 hours
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(1440)
  sessionTimeout?: number;

  @ApiPropertyOptional({
    description: 'Receive notifications for login events',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  loginNotifications?: boolean;
}

/**
 * Update Security Settings DTO
 * All fields are optional for partial updates
 */
export class UpdateSecuritySettingsDto {
  @ApiPropertyOptional({
    description: 'Enable two-factor authentication',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Session timeout in minutes',
    example: 30,
    minimum: 5,
    maximum: 1440,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(1440)
  sessionTimeout?: number;

  @ApiPropertyOptional({
    description: 'Receive notifications for login events',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  loginNotifications?: boolean;
}


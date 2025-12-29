import {
  IsString,
  IsEnum,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * System Configuration DTO
 * Defines user preferences for system-level settings
 */
export class SystemConfigDto {
  @ApiProperty({
    description: 'User timezone (IANA timezone identifier)',
    example: 'Asia/Ho_Chi_Minh',
    default: 'UTC',
  })
  @IsString()
  timezone!: string;

  @ApiProperty({
    description: 'Date format preference',
    example: 'YYYY-MM-DD',
    default: 'YYYY-MM-DD',
  })
  @IsString()
  @Matches(/^(YYYY|YY|MM|DD|HH|mm|ss|[-/])+$/, {
    message: 'Invalid date format. Use format tokens like YYYY-MM-DD',
  })
  dateFormat!: string;

  @ApiProperty({
    description: 'Time format preference',
    enum: ['12h', '24h'],
    example: '24h',
    default: '24h',
  })
  @IsEnum(['12h', '24h'])
  timeFormat!: '12h' | '24h';

  @ApiPropertyOptional({
    description: 'Preferred language (ISO 639-1 code)',
    example: 'en',
    default: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'UI theme preference',
    enum: ['light', 'dark', 'auto'],
    example: 'auto',
    default: 'auto',
  })
  @IsOptional()
  @IsEnum(['light', 'dark', 'auto'])
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * Update System Configuration DTO
 * All fields are optional for partial updates
 */
export class UpdateSystemConfigDto {
  @ApiPropertyOptional({
    description: 'User timezone (IANA timezone identifier)',
    example: 'Asia/Ho_Chi_Minh',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Date format preference',
    example: 'YYYY-MM-DD',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(YYYY|YY|MM|DD|HH|mm|ss|[-/])+$/, {
    message: 'Invalid date format. Use format tokens like YYYY-MM-DD',
  })
  dateFormat?: string;

  @ApiPropertyOptional({
    description: 'Time format preference',
    enum: ['12h', '24h'],
    example: '24h',
  })
  @IsOptional()
  @IsEnum(['12h', '24h'])
  timeFormat?: '12h' | '24h';

  @ApiPropertyOptional({
    description: 'Preferred language (ISO 639-1 code)',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'UI theme preference',
    enum: ['light', 'dark', 'auto'],
    example: 'auto',
  })
  @IsOptional()
  @IsEnum(['light', 'dark', 'auto'])
  theme?: 'light' | 'dark' | 'auto';
}


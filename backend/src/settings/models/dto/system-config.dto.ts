import {
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimeFormat, DateFormat, Theme, Language } from '../enums/system-config.enum';

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
    enum: DateFormat,
    example: DateFormat.YYYY_MM_DD,
    default: DateFormat.YYYY_MM_DD,
  })
  @IsEnum(DateFormat)
  dateFormat!: DateFormat;

  @ApiProperty({
    description: 'Time format preference',
    enum: TimeFormat,
    example: TimeFormat.HOUR_24,
    default: TimeFormat.HOUR_24,
  })
  @IsEnum(TimeFormat)
  timeFormat!: TimeFormat;

  @ApiPropertyOptional({
    description: 'Preferred language (ISO 639-1 code)',
    enum: Language,
    example: Language.EN,
    default: Language.EN,
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({
    description: 'UI theme preference',
    enum: Theme,
    example: Theme.AUTO,
    default: Theme.AUTO,
  })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;
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
    enum: DateFormat,
    example: DateFormat.YYYY_MM_DD,
  })
  @IsOptional()
  @IsEnum(DateFormat)
  dateFormat?: DateFormat;

  @ApiPropertyOptional({
    description: 'Time format preference',
    enum: TimeFormat,
    example: TimeFormat.HOUR_24,
  })
  @IsOptional()
  @IsEnum(TimeFormat)
  timeFormat?: TimeFormat;

  @ApiPropertyOptional({
    description: 'Preferred language (ISO 639-1 code)',
    enum: Language,
    example: Language.EN,
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({
    description: 'UI theme preference',
    enum: Theme,
    example: Theme.AUTO,
  })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;
}


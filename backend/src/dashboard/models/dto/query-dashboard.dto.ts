import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Query Dashboard DTO
 * For filtering dashboard data
 */
export class QueryDashboardDto {
  @ApiPropertyOptional({
    description: 'Limit number of results',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Cursor for pagination',
    example: 'cursor-string',
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}



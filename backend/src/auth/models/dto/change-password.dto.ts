import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    example: 'NewSecurePassword456!',
    description: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  newPassword!: string;

  @ApiProperty({ example: 'NewSecurePassword456!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  confirmPassword!: string;
}


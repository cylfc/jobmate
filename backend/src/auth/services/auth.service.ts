import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { AuthProvider, AuthProviderType } from '../entities/auth-provider.entity';
import { RegisterDto } from '../models/dto/register.dto';
import { LoginDto } from '../models/dto/login.dto';
import { ChangePasswordDto } from '../models/dto/change-password.dto';
import { UpdateProfileDto } from '../models/dto/update-profile.dto';
import { PasswordService } from './password.service';
import { UserService } from './user.service';
import { RefreshTokenService } from './refresh-token.service';
import { AuthResponse } from '../models/types/auth-response.type';
import { JwtPayload } from '../models/types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuthProvider)
    private readonly authProviderRepository: Repository<AuthProvider>,
    private readonly passwordService: PasswordService,
    private readonly userService: UserService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    if (!this.passwordService.validatePasswordStrength(registerDto.password)) {
      throw new BadRequestException(
        'Password must be at least 8 characters with uppercase, lowercase, number and special character',
      );
    }

    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.passwordService.hashPassword(
      registerDto.password,
    );

    const user = await this.userService.create({
      email: registerDto.email,
      passwordHash,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    await this.authProviderRepository.save({
      user,
      provider: AuthProviderType.EMAIL,
    });

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    await this.userService.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenEntity = await this.refreshTokenService.validateToken(refreshToken);
    const user = tokenEntity.user;

    await this.refreshTokenService.revokeToken(refreshToken);

    return this.generateTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeToken(refreshToken);
  }

  async getProfile(userId: string): Promise<Omit<User, 'passwordHash' | 'authProviders' | 'refreshTokens'>> {
    const user = await this.userService.findById(userId);
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto): Promise<Omit<User, 'passwordHash' | 'authProviders' | 'refreshTokens'>> {
    const user = await this.userService.update(userId, updateDto);
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    if (!this.passwordService.validatePasswordStrength(changePasswordDto.newPassword)) {
      throw new BadRequestException(
        'Password must be at least 8 characters with uppercase, lowercase, number and special character',
      );
    }

    const user = await this.userService.findById(userId);

    const isCurrentPasswordValid = await this.passwordService.comparePassword(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newPasswordHash = await this.passwordService.hashPassword(
      changePasswordDto.newPassword,
    );

    user.passwordHash = newPasswordHash;
    await this.userRepository.save(user);

    await this.refreshTokenService.revokeAllUserTokens(userId);
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = await this.refreshTokenService.generateToken(user);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User): Omit<User, 'passwordHash' | 'authProviders' | 'refreshTokens'> {
    const { passwordHash, authProviders, refreshTokens, ...sanitized } = user;
    return sanitized;
  }
}


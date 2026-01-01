import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(user: User): Promise<string> {
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    const expiresAt = this.calculateExpiration(expiresIn);

    // Add timestamp and random value to payload to ensure uniqueness
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000), // Issued at timestamp
      jti: `${user.id}-${Date.now()}-${Math.random()}`, // JWT ID for uniqueness
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn,
    });

    const refreshToken = this.refreshTokenRepository.create({
      user,
      token,
      expiresAt,
    });

    try {
      await this.refreshTokenRepository.save(refreshToken);
    } catch (error) {
      // Handle duplicate key error gracefully
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        // PostgreSQL unique constraint violation
        // This should be extremely rare, but if it happens, try to find existing token
        const existing = await this.refreshTokenRepository.findOne({
          where: { token },
          relations: ['user'],
        });
        
        if (existing && existing.user.id === user.id && !existing.isRevoked && existing.expiresAt > new Date()) {
          // Return existing valid token
          return existing.token;
        }
        
        // If existing token is invalid, revoke it and generate a new one
        if (existing) {
          existing.isRevoked = true;
          existing.revokedAt = new Date();
          await this.refreshTokenRepository.save(existing);
        }
        
        // Retry with a new token (with new timestamp/jti)
        return this.generateToken(user);
      }
      throw error;
    }

    return token;
  }

  async validateToken(token: string): Promise<RefreshToken> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    return refreshToken;
  }

  async revokeToken(token: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });

    if (refreshToken && !refreshToken.isRevoked) {
      refreshToken.isRevoked = true;
      refreshToken.revokedAt = new Date();
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { user: { id: userId }, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  private calculateExpiration(expiresIn: string): Date {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)([dhm])$/);
    if (!match) {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    let milliseconds = 0;
    switch (unit) {
      case 'd':
        milliseconds = value * 24 * 60 * 60 * 1000;
        break;
      case 'h':
        milliseconds = value * 60 * 60 * 1000;
        break;
      case 'm':
        milliseconds = value * 60 * 1000;
        break;
    }

    return new Date(now.getTime() + milliseconds);
  }
}


import { User } from '../../entities/user.entity';

export interface AuthResponse {
  user: Omit<User, 'passwordHash' | 'authProviders' | 'refreshTokens'>;
  accessToken: string;
  refreshToken: string;
}


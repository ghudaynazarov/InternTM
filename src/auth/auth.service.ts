import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/enums';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m') as any,
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES', '7d') as any,
      }),
    ]);
    const full = await this.users.findByIdWithSecrets(user.id);
    full.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.users.save(full);
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.users.findByEmailWithSecrets(email)) throw new ConflictException('Email already registered');
    const user = await this.users.create({
      email,
      fullName: dto.fullName,
      phone: dto.phone,
      passwordHash: await bcrypt.hash(dto.password, 12),
      role: Role.STUDENT, // admins are never created through public signup
    });
    return { user: this.users.toProfile(user), ...(await this.issueTokens(user)) };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmailWithSecrets(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedException('Account is disabled');
    return { user: this.users.toProfile(user), ...(await this.issueTokens(user)) };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET') });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.users.findByIdWithSecrets(payload.sub);
    if (!user || !user.isActive || !user.refreshTokenHash) throw new UnauthorizedException('Invalid refresh token');
    if (!(await bcrypt.compare(refreshToken, user.refreshTokenHash))) throw new UnauthorizedException('Invalid refresh token');
    return this.issueTokens(user); // rotation: old refresh token stops working
  }

  async logout(userId: string) {
    const user = await this.users.findByIdWithSecrets(userId);
    if (user) {
      user.refreshTokenHash = null;
      await this.users.save(user);
    }
    return { success: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.users.findByIdWithSecrets(userId);
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash)))
      throw new UnauthorizedException('Current password is incorrect');
    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    user.refreshTokenHash = null;
    await this.users.save(user);
    return { success: true };
  }
}

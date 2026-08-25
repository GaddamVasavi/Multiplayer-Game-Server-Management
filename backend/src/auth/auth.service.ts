import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../database/entities/user.entity';
import { PlayerProfileEntity } from '../database/entities/player-profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PlayerProfileEntity)
    private readonly profileRepository: Repository<PlayerProfileEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { username, email, password } = registerDto;

    // Check existing username or email
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Username is already taken');
      }
      throw new ConflictException('Email is already registered');
    }

    // Hash password with salt rounds = 10
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user entity
    const user = this.userRepository.create({
      username,
      email,
      passwordHash,
    });

    const savedUser = await this.userRepository.save(user);

    // Create player profile entity
    const profile = this.profileRepository.create({
      userId: savedUser.id,
      displayName: username,
      eloRating: 1200,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      totalScore: 0,
      isOnline: true,
      lastSeen: new Date(),
    });

    await this.profileRepository.save(profile);

    this.logger.log(`Registered new player: ${savedUser.username} (${savedUser.id})`);

    // Generate JWT token
    const tokenPayload = { sub: savedUser.id, username: savedUser.username, email: savedUser.email };
    const accessToken = this.jwtService.sign(tokenPayload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 86400,
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        displayName: profile.displayName,
        eloRating: profile.eloRating,
        avatarUrl: profile.avatarUrl,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { usernameOrEmail, password } = loginDto;

    // Search user by username or email
    const user = await this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update profile online status
    if (user.profile) {
      user.profile.isOnline = true;
      user.profile.lastSeen = new Date();
      await this.profileRepository.save(user.profile);
    }

    this.logger.log(`Player logged in: ${user.username} (${user.id})`);

    // Generate JWT token
    const tokenPayload = { sub: user.id, username: user.username, email: user.email };
    const accessToken = this.jwtService.sign(tokenPayload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 86400,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.profile ? user.profile.displayName : user.username,
        eloRating: user.profile ? user.profile.eloRating : 1200,
        avatarUrl: user.profile ? user.profile.avatarUrl : undefined,
      },
    };
  }

  async validateUserById(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../src/database/entities/user.entity';
import { PlayerProfileEntity } from '../src/database/entities/player-profile.entity';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService (Unit Tests)', () => {
  let service: AuthService;
  let userRepository: any;
  let profileRepository: any;
  let jwtService: any;

  const mockUser: UserEntity = {
    id: 'user-uuid-1234',
    username: 'pro_gamer_99',
    email: 'progamer@nexus.com',
    passwordHash: '$2b$10$e8wG.0p1h4QzM1.H7sJ8ue7Z5pU/R4/1q0h/3O3b/7K2l8y', // hashed 'password123'
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: null as any,
    matchParticipations: [],
  };

  const mockProfile: PlayerProfileEntity = {
    id: 'profile-uuid-5678',
    userId: 'user-uuid-1234',
    user: mockUser,
    displayName: 'pro_gamer_99',
    eloRating: 1200,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    totalScore: 0,
    avatarUrl: null as any,
    isOnline: true,
    lastSeen: new Date(),
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
    };

    profileRepository = {
      create: jest.fn().mockReturnValue(mockProfile),
      save: jest.fn().mockResolvedValue(mockProfile),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked_jwt_bearer_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepository },
        { provide: getRepositoryToken(PlayerProfileEntity), useValue: profileRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('Registration & Authentication (Mandatory Test 1)', () => {
    it('should successfully register a new player and return JWT token', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.register({
        username: 'pro_gamer_99',
        email: 'progamer@nexus.com',
        password: 'password123',
      });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [{ username: 'pro_gamer_99' }, { email: 'progamer@nexus.com' }],
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(profileRepository.save).toHaveBeenCalled();
      expect(result.accessToken).toBe('mocked_jwt_bearer_token');
      expect(result.user.username).toBe('pro_gamer_99');
    });

    it('should throw ConflictException if username is already registered', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({
          username: 'pro_gamer_99',
          email: 'newemail@nexus.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully authenticate user with valid credentials', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      mockUser.profile = mockProfile;
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.login({
        usernameOrEmail: 'pro_gamer_99',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mocked_jwt_bearer_token');
      expect(result.user.eloRating).toBe(1200);
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.login({
          usernameOrEmail: 'pro_gamer_99',
          password: 'wrong_password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from '../src/friends/friends.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FriendEntity } from '../src/friends/friend.entity';
import { UserEntity } from '../src/database/entities/user.entity';

describe('FriendsService', () => {
  let service: FriendsService;

  const mockFriendRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'friend-1', ...e })),
  };

  const mockUserRepo = {
    findOne: jest.fn().mockResolvedValue({ id: 'user-2', username: 'target_user' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: getRepositoryToken(FriendEntity), useValue: mockFriendRepo },
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
  });

  it('should send friend request successfully', async () => {
    const request = await service.sendFriendRequest('user-1', 'target_user');
    expect(request.requesterId).toBe('user-1');
    expect(request.addresseeId).toBe('user-2');
  });
});

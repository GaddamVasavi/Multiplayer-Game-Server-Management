import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.entity';
import { PlayerProfileEntity } from '../entities/player-profile.entity';
import { MatchEntity, MatchStatus } from '../entities/match.entity';
import { MatchParticipantEntity } from '../entities/match-participant.entity';
import { ServerMetricsEntity } from '../entities/server-metrics.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PlayerProfileEntity)
    private readonly profileRepository: Repository<PlayerProfileEntity>,
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,
    @InjectRepository(MatchParticipantEntity)
    private readonly participantRepository: Repository<MatchParticipantEntity>,
    @InjectRepository(ServerMetricsEntity)
    private readonly metricsRepository: Repository<ServerMetricsEntity>,
  ) {}

  async seedDatabase(): Promise<void> {
    const existingCount = await this.userRepository.count();
    if (existingCount > 0) {
      this.logger.log('Database already contains records. Skipping seed.');
      return;
    }

    this.logger.log('Starting Database Seed Generation...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const usersToCreate: UserEntity[] = [];
    const profilesToCreate: PlayerProfileEntity[] = [];

    // Generate 100 realistic players
    for (let i = 1; i <= 100; i++) {
      const username = `player_${i.toString().padStart(3, '0')}`;
      const email = `${username}@nexusarena.io`;

      const user = this.userRepository.create({
        username,
        email,
        passwordHash,
      });

      usersToCreate.push(user);
    }

    const savedUsers = await this.userRepository.save(usersToCreate);

    savedUsers.forEach((user, idx) => {
      const eloRating = Math.floor(Math.random() * 800) + 900; // 900 to 1700 ELO
      const matchesPlayed = Math.floor(Math.random() * 50) + 5;
      const wins = Math.floor(matchesPlayed * (0.3 + Math.random() * 0.4));
      const losses = matchesPlayed - wins;
      const totalScore = matchesPlayed * (Math.floor(Math.random() * 300) + 100);

      const profile = this.profileRepository.create({
        userId: user.id,
        displayName: `Hero_${user.username}`,
        eloRating,
        matchesPlayed,
        wins,
        losses,
        totalScore,
        isOnline: Math.random() > 0.6,
        lastSeen: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
      });

      profilesToCreate.push(profile);
    });

    await this.profileRepository.save(profilesToCreate);
    this.logger.log(`Seeded ${savedUsers.length} Users and Player Profiles.`);

    // Generate 30 Historical Matches
    const matchesToCreate: MatchEntity[] = [];
    for (let m = 1; m <= 30; m++) {
      const matchDate = new Date(Date.now() - m * 3600000 * 4);
      const match = this.matchRepository.create({
        roomId: `room-seed-${m}`,
        serverNodeId: `game-pod-${(m % 3) + 1}`,
        status: MatchStatus.COMPLETED,
        startedAt: matchDate,
        endedAt: new Date(matchDate.getTime() + 60000),
        totalPlayers: 4,
      });

      matchesToCreate.push(match);
    }

    const savedMatches = await this.matchRepository.save(matchesToCreate);

    // Link participants to matches
    const participantsToCreate: MatchParticipantEntity[] = [];
    savedMatches.forEach((match) => {
      const selectedUsers = savedUsers.slice(0, 4);
      selectedUsers.forEach((u, rankIdx) => {
        participantsToCreate.push(
          this.participantRepository.create({
            matchId: match.id,
            playerId: u.id,
            kills: Math.floor(Math.random() * 15),
            deaths: Math.floor(Math.random() * 10),
            score: (4 - rankIdx) * 150 + Math.floor(Math.random() * 50),
            rankPosition: rankIdx + 1,
          }),
        );
      });
    });

    await this.participantRepository.save(participantsToCreate);
    this.logger.log(`Seeded ${savedMatches.length} Matches and ${participantsToCreate.length} Participants.`);

    // Generate 500 Historical Server Telemetry Samples for AI Model Training
    const metricsToCreate: ServerMetricsEntity[] = [];
    const now = Date.now();
    for (let t = 500; t >= 0; t--) {
      const timestamp = new Date(now - t * 60000); // 1-minute intervals
      const basePlayers = 20 + Math.floor(Math.sin(t / 10) * 15) + Math.floor(Math.random() * 10);
      const baseCpu = Math.min(95, Math.max(10, basePlayers * 1.5 + Math.random() * 10));
      const baseRam = 150 + basePlayers * 4 + Math.random() * 20;
      const baseLatency = 20 + Math.random() * 15 + (baseCpu > 80 ? 50 : 0);

      metricsToCreate.push(
        this.metricsRepository.create({
          timestamp,
          serverPodId: `game-pod-${(t % 3) + 1}`,
          activePlayers: basePlayers,
          activeRooms: Math.ceil(basePlayers / 4),
          cpuUsagePct: parseFloat(baseCpu.toFixed(2)),
          memoryUsageMb: parseFloat(baseRam.toFixed(2)),
          networkRxKbps: parseFloat((basePlayers * 45.5).toFixed(2)),
          networkTxKbps: parseFloat((basePlayers * 120.2).toFixed(2)),
          averageLatencyMs: parseFloat(baseLatency.toFixed(2)),
          droppedPackets: baseCpu > 85 ? Math.floor(Math.random() * 8) : 0,
        }),
      );
    }

    await this.metricsRepository.save(metricsToCreate);
    this.logger.log(`Seeded ${metricsToCreate.length} Telemetry History entries for AI Training.`);
  }
}

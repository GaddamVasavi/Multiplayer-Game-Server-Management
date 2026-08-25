import { Test, TestingModule } from '@nestjs/testing';
import { DisasterRecoveryService } from '../src/disaster_recovery/disaster_recovery.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DatabaseBackupEntity, RecoveryEventEntity } from '../src/disaster_recovery/disaster_recovery.entity';

describe('DisasterRecoveryService', () => {
  let service: DisasterRecoveryService;

  const mockBackupRepo = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'backup-1', filePath: '/var/backups/test.sql.gz' }),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'backup-1', ...e })),
  };

  const mockRecoveryRepo = {
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'recovery-1', ...e })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisasterRecoveryService,
        { provide: getRepositoryToken(DatabaseBackupEntity), useValue: mockBackupRepo },
        { provide: getRepositoryToken(RecoveryEventEntity), useValue: mockRecoveryRepo },
      ],
    }).compile();

    service = module.get<DisasterRecoveryService>(DisasterRecoveryService);
  });

  it('should create database backup snapshot successfully', async () => {
    const backup = await service.createBackup();
    expect(backup.backupType).toBe('POSTGRESQL_FULL');
    expect(backup.status).toBe('COMPLETED');
  });

  it('should execute disaster recovery restoration', async () => {
    const event = await service.executeRecovery('backup-1');
    expect(event.backupId).toBe('backup-1');
    expect(event.status).toBe('SUCCESS');
    expect(event.rtoSeconds).toBeLessThan(300); // RTO target < 5 mins
  });
});

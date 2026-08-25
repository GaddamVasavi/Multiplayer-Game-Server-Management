import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';

export enum GuildRole {
  LEADER = 'LEADER',
  OFFICER = 'OFFICER',
  MEMBER = 'MEMBER',
}

@Entity('guilds')
export class GuildEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ unique: true, length: 5 })
  tag: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'leader_id' })
  leaderId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leader_id' })
  leader: UserEntity;

  @Index()
  @Column({ name: 'guild_elo', default: 1200 })
  guildElo: number;

  @Column({ name: 'max_members', default: 20 })
  maxMembers: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => GuildMemberEntity, (m) => m.guild, { cascade: true })
  members: GuildMemberEntity[];
}

@Entity('guild_members')
export class GuildMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'guild_id' })
  guildId: string;

  @ManyToOne(() => GuildEntity, (g) => g.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  guild: GuildEntity;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'varchar',
    length: 20,
    default: GuildRole.MEMBER,
  })
  role: GuildRole;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}

import { Injectable, Logger } from '@nestjs/common';
import { PartyEntity } from './party.entity';

@Injectable()
export class PartyBalancerService {
  private readonly logger = new Logger(PartyBalancerService.name);

  calculatePartyMMR(party: PartyEntity): number {
    if (!party.members || party.members.length === 0) {
      return 1200;
    }

    const totalElo = party.members.reduce((acc, m) => {
      const elo = m.user && m.user.profile ? m.user.profile.eloRating : 1200;
      return acc + elo;
    }, 0);

    const averageMmr = totalElo / party.members.length;
    // Premade team bonus (+50 MMR multiplier for coordination)
    const partyCoordinationBonus = party.members.length > 1 ? (party.members.length - 1) * 25 : 0;
    const finalPartyMmr = Math.round(averageMmr + partyCoordinationBonus);

    this.logger.log(`Party ${party.id} calculated MMR: ${finalPartyMmr} (Base: ${averageMmr}, Bonus: +${partyCoordinationBonus})`);
    return finalPartyMmr;
  }
}

export interface PlayerRating {
  playerId: string;
  rating: number; // default 1500
  rd: number; // rating deviation, default 350
  volatility: number; // default 0.06
}

export interface MatchResult {
  opponentRating: number;
  opponentRd: number;
  outcome: number; // 1 for win, 0.5 for draw, 0 for loss
}

export class Glicko2Service {
  private static readonly TAU = 0.5; // system constant constraining volatility change
  private static readonly SCALE = 173.7178;

  public static scaleToGlicko2(rating: number, rd: number): { mu: number; phi: number } {
    return {
      mu: (rating - 1500) / this.SCALE,
      phi: rd / this.SCALE,
    };
  }

  public static scaleFromGlicko2(mu: number, phi: number): { rating: number; rd: number } {
    return {
      rating: mu * this.SCALE + 1500,
      rd: Math.min(350, phi * this.SCALE),
    };
  }

  private static g(phi: number): number {
    return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
  }

  private static E(mu: number, mu_j: number, phi_j: number): number {
    return 1 / (1 + Math.exp(-this.g(phi_j) * (mu - mu_j)));
  }

  /**
   * Computes updated rating, deviation, and volatility for a player after match results
   */
  public static updateRating(player: PlayerRating, results: MatchResult[]): PlayerRating {
    if (results.length === 0) {
      // Inactivity increases uncertainty
      const { phi } = this.scaleToGlicko2(player.rating, player.rd);
      const newPhi = Math.sqrt(phi * phi + player.volatility * player.volatility);
      const { rd } = this.scaleFromGlicko2(0, newPhi);
      return { ...player, rd };
    }

    const { mu, phi } = this.scaleToGlicko2(player.rating, player.rd);

    // Compute estimated variance v
    let v_inv = 0;
    let delta_sum = 0;

    for (const match of results) {
      const opp = this.scaleToGlicko2(match.opponentRating, match.opponentRd);
      const g_val = this.g(opp.phi);
      const e_val = this.E(mu, opp.mu, opp.phi);

      v_inv += g_val * g_val * e_val * (1 - e_val);
      delta_sum += g_val * (match.outcome - e_val);
    }

    const v = 1 / v_inv;
    const delta = v * delta_sum;

    // Simple volatility update approximation
    const newVol = player.volatility;
    const phi_star = Math.sqrt(phi * phi + newVol * newVol);
    const newPhi = 1 / Math.sqrt(1 / (phi_star * phi_star) + 1 / v);
    const newMu = mu + newPhi * newPhi * delta_sum;

    const updated = this.scaleFromGlicko2(newMu, newPhi);

    return {
      playerId: player.playerId,
      rating: Math.round(updated.rating),
      rd: Math.round(updated.rd),
      volatility: newVol,
    };
  }

  /**
   * Computes matchmaking quality score (0.0 to 1.0) between two rated players
   */
  public static calculateMatchQuality(p1: PlayerRating, p2: PlayerRating): number {
    const diff = Math.abs(p1.rating - p2.rating);
    const combinedRd = Math.sqrt(p1.rd * p1.rd + p2.rd * p2.rd);
    const expectedWinP1 = 1 / (1 + Math.pow(10, (p2.rating - p1.rating) / 400));
    // Closeness to 50/50 win probability
    const fairness = 1 - Math.abs(expectedWinP1 - 0.5) * 2;
    return Math.max(0, Math.min(1, fairness * (1 - diff / 1000)));
  }
}

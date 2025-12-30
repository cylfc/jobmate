/**
 * Dashboard Matching Health Response Type
 */
export interface MatchScoreDistributionBin {
  label: string; // e.g., "0-20", "20-40", "40-60", "60-80", "80-100"
  ratio: number; // 0-1, share of matches in this bin
  count?: number; // Optional absolute count
}

export interface DashboardMatchingHealthResponse {
  scoreDistribution: MatchScoreDistributionBin[];
  highQualityRatio: number; // 0-1, share of matches with score > 80
  lowQualityRatio: number; // 0-1, share of matches with score < 60
}



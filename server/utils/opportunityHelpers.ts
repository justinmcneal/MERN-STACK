const SEVERE_ANOMALIES = new Set<string>([
  'spread-outlier',
  'gas-vs-profit-outlier',
  'from-dex-cex-divergence',
  'to-dex-cex-divergence'
]);

export interface OpportunityData {
  priceDiffPercent?: number;
  estimatedProfit?: number;
  gasCost?: number;
  anomalyFlags?: string[];
  [key: string]: any;
}

export interface FlaggedOpportunity extends OpportunityData {
  flagged?: boolean;
  flagReason?: string;
  flagReasons?: string[];
}

export const detectAnomalies = (opportunity: OpportunityData): Set<string> => {
  const anomalies = new Set<string>();

  if (Array.isArray(opportunity.anomalyFlags)) {
    for (const flag of opportunity.anomalyFlags) {
      if (typeof flag === 'string' && flag.trim().length > 0) {
        anomalies.add(flag);
      }
    }
  }

  if (typeof opportunity.priceDiffPercent === 'number' && Math.abs(opportunity.priceDiffPercent) > 5000) {
    anomalies.add('spread-outlier');
  }

  if (
    typeof opportunity.estimatedProfit === 'number' &&
    typeof opportunity.gasCost === 'number' &&
    opportunity.estimatedProfit > 0 &&
    opportunity.gasCost >= 0 &&
    opportunity.gasCost < opportunity.estimatedProfit * 0.0001
  ) {
    anomalies.add('gas-vs-profit-outlier');
  }

  return anomalies;
};

export const flagOpportunity = (opportunity: OpportunityData): FlaggedOpportunity => {
  const anomalies = detectAnomalies(opportunity);

  if (anomalies.size === 0) {
    return opportunity;
  }

  const flagReasons = Array.from(anomalies);
  return {
    ...opportunity,
    flagged: true,
    flagReason: flagReasons[0],
    flagReasons,
  };
};

export const shouldFilterOpportunity = (opportunity: FlaggedOpportunity): boolean => {
  const reasons = Array.isArray(opportunity.flagReasons) ? opportunity.flagReasons : [];
  
  if (reasons.length === 0 && !opportunity.flagged) {
    return false;
  }

  return reasons.some((reason: string) => SEVERE_ANOMALIES.has(reason));
};

export const filterOpportunities = (opportunities: OpportunityData[], includeFlagged: boolean): FlaggedOpportunity[] => {
  const flagged = opportunities.map(flagOpportunity);
  
  if (includeFlagged) {
    return flagged;
  }

  return flagged.filter(opp => !shouldFilterOpportunity(opp));
};

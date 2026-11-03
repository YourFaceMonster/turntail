/** Quest relic: only the owner's equipped glass strengthens emergency herbs. */
export const BLUE_GLASS_ID='watchkeepers-blue-glass';
export function emergencyHerbHealing(equipped:readonly string[]){return equipped.includes(BLUE_GLASS_ID)?15:10;}

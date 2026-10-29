/** Authoritative turn locks and client effects share these pickup beats. */
export const COIN_EVENT_GAP_MS=700;
export const COIN_DISCOVERY_AFTER_MS=700;
export const COIN_DISCOVERY_MS=2200;
export const COIN_COLLECT_MS=1700;
export const COIN_CREDIT_MS=2600;
export const COIN_PRESENTATION_MS=3600;
/** Quiet beat after the wallet credit and banner, before any turn or result. */
export const COIN_AFTER_PICKUP_MS=1400;
export const COIN_TURN_READY_MS=COIN_PRESENTATION_MS+COIN_AFTER_PICKUP_MS;
export const TRAP_IMPACT_MS=1700;
export const TRAP_PRESENTATION_MS=4800;
export const TRAP_AFTER_IMPACT_MS=1000;
export const TRAP_TURN_READY_MS=TRAP_PRESENTATION_MS+TRAP_AFTER_IMPACT_MS;
export const AMBUSH_IMPACT_MS=1250;
export const AMBUSH_PRESENTATION_MS=2700;

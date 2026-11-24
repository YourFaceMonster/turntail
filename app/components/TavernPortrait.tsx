import {tr} from '../../lib/i18n/index.ts';
/** Crop the canonical tavern painting so Serin keeps the same face in every view. */
export default function TavernPortrait(){return <span className="mini-serin-portrait portrait" role="img" aria-label={tr('세린 초상')}/>;}

import {stageRegionPath} from '../../lib/stage-map';
import {STAGE_THEMES} from '../../lib/stage-theme';
export default function StageRegionOutlines({selected}:{selected:number}){
 return <svg className="journey-region-boundaries" viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">{STAGE_THEMES.map(t=><path key={t.stage} data-map-region={t.stage} className={selected===t.stage?'region-selected':undefined} d={stageRegionPath(t.stage-1)} vectorEffect="non-scaling-stroke"><title>{`${t.stage} · ${t.name}`}</title></path>)}</svg>;
}

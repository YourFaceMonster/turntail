import {STORY_CARDS,type StoryCardId} from '../../lib/rpg-story-cards.ts';
import {STORY_CARD_ART} from '../../lib/rpg-story-card-art.ts';
import {tr,trv} from '../../lib/i18n/index.ts';
export default function StoryCardCollection({cards=[]}:{cards?:readonly StoryCardId[]}){
 if(!cards.length)return null;
 return <section className="story-card-collection" aria-label={tr('이야기의 패')}><h4>{tr('이야기의 패')}</h4><p>{tr('전투에 사용하지 않는 여행의 기록')}</p><ul>{cards.map(id=><li key={id}><span className="story-card-faces"><img src={STORY_CARD_ART[id].front} alt={tr('{0} 앞면',{0:STORY_CARDS[id].name})}/><img src={STORY_CARD_ART[id].back} alt={tr('{0} 뒷면',{0:STORY_CARDS[id].back})}/></span><strong>{trv(STORY_CARDS[id].name)}</strong><small>{tr('뒷면 ·')} {STORY_CARDS[id].back}</small></li>)}</ul></section>;
}

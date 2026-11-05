import {STORY_CARDS,type StoryCardId} from '../../lib/rpg-story-cards.ts';
import {STORY_CARD_ART} from '../../lib/rpg-story-card-art.ts';
export default function StoryCardCollection({cards=[]}:{cards?:readonly StoryCardId[]}){
 if(!cards.length)return null;
 return <section className="story-card-collection" aria-label="이야기의 패"><h4>이야기의 패</h4><p>전투에 사용하지 않는 여행의 기록</p><ul>{cards.map(id=><li key={id}><span className="story-card-faces"><img src={STORY_CARD_ART[id].front} alt={`${STORY_CARDS[id].name} 앞면`}/><img src={STORY_CARD_ART[id].back} alt={`${STORY_CARDS[id].back} 뒷면`}/></span><strong>{STORY_CARDS[id].name}</strong><small>뒷면 · {STORY_CARDS[id].back}</small></li>)}</ul></section>;
}

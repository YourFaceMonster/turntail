import {RPG_GUARDIAN_ART} from '../../lib/rpg-chapters';
import {twinIndex} from '../../lib/rpg-twins';
import {TwinPortrait} from './TwinPortrait';
import {StagePortrait} from './StagePortrait';
import KoreanPortrait from './KoreanPortrait';
import MonsterPortrait from './MonsterPortrait';
export default function SeatPortrait({avatar='',seat=0,guardian=false}:{avatar?:string,seat?:number,guardian?:boolean}){
 if(guardian)return <span className="portrait avatar"><img src={RPG_GUARDIAN_ART} alt="수호자"/></span>;
 const twin=twinIndex(avatar);if(twin!==null)return <TwinPortrait index={twin}/>;
 if(avatar.startsWith('stage-portrait:'))return <StagePortrait index={Number(avatar.split(':')[1])}/>;
 if(avatar.startsWith('korean-portrait:'))return <KoreanPortrait index={Number(avatar.split(':')[1])}/>;
 if(avatar.startsWith('korean-monster:'))return <MonsterPortrait index={Number(avatar.split(':')[1])}/>;
 return <span className="portrait avatar">{avatar?<img src={avatar} alt=""/>:['🦊','🦉','🐯','🐼'][seat%4]}</span>;
}

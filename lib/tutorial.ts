import {beats,combo,type Tile} from './game';
const t=(n:number,s:number):Tile=>({id:(n-1)*4+s,n,s});
export const TUTORIAL_LESSONS=[
 {title:'문양에도 순서가 있어요',text:'같은 숫자는 왕관 > 비밀의 열쇠 > 성화 > 철문 순서예요. 가장 강한 왕관 패를 눌러보세요.',hand:[t(7,0),t(7,2),t(7,1),t(7,3)],target:[] as Tile[],kind:'color'},
 {title:'숫자 2가 가장 강해요',text:'숫자는 2 > 1 > 15 > … > 3 순서예요. 가장 강한 패를 골라보세요.',hand:[t(3,0),t(15,0),t(1,0),t(2,0)],target:[],kind:'number'},
 {title:'싱글에는 한 장으로',text:'상대가 철문 6을 냈어요. 이길 수 있는 한 장을 선택하고 내보세요. 같은 숫자라면 문양으로 비교해요.',hand:[t(3,0),t(6,2),t(8,1)],target:[t(6,0)],kind:'single'},
 {title:'같은 숫자 두 장은 페어',text:'상대는 5 페어예요. 7 두 장을 골라 내보세요. 페어에는 페어로 대응해야 해요.',hand:[t(7,0),t(7,2),t(9,3)],target:[t(5,0),t(5,1)],kind:'pair'},
 {title:'같은 숫자 세 장은 트리플',text:'7 세 장을 골라 5 트리플을 이겨보세요. 강한 싱글 한 장으로는 트리플을 넘을 수 없어요.',hand:[t(7,0),t(7,1),t(7,2),t(2,3)],target:[t(5,0),t(5,1),t(5,2)],kind:'triple'},
 {title:'5장 족보로 흐름을 바꿔요',text:'7 세 장과 9 두 장을 골라 풀하우스를 만들어보세요. 5장끼리는 더 높은 족보로도 이길 수 있어요.',hand:[t(7,0),t(7,1),t(7,2),t(9,0),t(9,1),t(3,3)],target:[t(3,0),t(4,1),t(5,2),t(6,3),t(7,3)],kind:'five'},
 {title:'선은 반드시 패를 내요',text:'내가 선이면 원하는 조합으로 시작해요. 바닥패는 가져올 수 없어요. 낮은 3 한 장을 내보세요.',hand:[t(3,0),t(8,2)],target:[],kind:'lead'},
 {title:'막히면 바닥에서 한 장',text:'상대의 빨간 2를 이길 수 없네요. 바닥 뒷면 패를 고르고 가져오세요. 위층은 비밀로 가져오며 이번 차례는 끝나요.',hand:[t(4,0),t(7,1)],target:[t(2,3)],kind:'draw'},
 {title:'손패를 먼저 비우면 승리!',text:'빨간 2를 내면 상대들이 한 장씩 가져오고 다시 내가 선이에요. 마지막 3을 내보세요. 일반모드는 남은 패 수로 점수를 정산해요.',hand:[t(2,3),t(3,0)],target:[],kind:'finish'},
] as const;
export type TutorialLesson=typeof TUTORIAL_LESSONS[number];
/** Legal practice answers never change a match or saved progress. */
export function tutorialAnswer(lesson:TutorialLesson,ids:number[],finish=0){
 const chosen=lesson.hand.filter(tile=>ids.includes(tile.id));
 if(lesson.kind==='color')return chosen.length===1&&chosen[0].s===3;
 if(lesson.kind==='number')return chosen.length===1&&chosen[0].n===2;
 if(lesson.kind==='single')return chosen.length===1&&beats(chosen,[...lesson.target]);
 if(lesson.kind==='pair'||lesson.kind==='triple'||lesson.kind==='five')return combo(chosen)?.label===({pair:'페어',triple:'트리플',five:'풀하우스'} as const)[lesson.kind]&&beats(chosen,[...lesson.target]);
 if(lesson.kind==='lead')return chosen.length===1&&chosen[0].n===3;
 if(lesson.kind==='finish')return chosen.length===1&&chosen[0].n===(finish?3:2);
 return false;
}


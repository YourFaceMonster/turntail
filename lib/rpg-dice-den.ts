/** ST4~6 side quest "안개 나루 주사위판": text and numbers only (journey rules live in rpg-journey.ts). */
export const DICE_DEN_STAKE=10;
/** Available after ST4 is cleared and before ST6 starts, so the relic is not lost to the ST4 chapter reset. */
export const DICE_DEN_STAGES=[4,5] as const;
export const DICE_RELIC_ID='haro-ivory-die';
export const DICE_RELIC={id:DICE_RELIC_ID,name:'하로의 상아 주사위',effect:'매 판 시작 시 HP 50 이하면 HP +2'};
export const DICE_RELIC_HEAL={threshold:50,amount:2} as const;
export const DICE_NPC='노름꾼 하로';
export const DICE_DEN_DIALOGUE={
 intro:[
  '폭포 아래 나룻배 창고. 안개 사이로 주사위 구르는 소리가 울린다.',
  '어이, 길손. 패만 쥐고 다니면 손이 굳어. 주사위 한 판 어때?',
  '규칙은 요트야. 다섯 개를 세 번까지 굴리고, 열두 칸을 다 채워 점수가 높은 쪽이 이기지.',
  `판돈은 네 HP ${DICE_DEN_STAKE}. 네가 이기면 내 상아 주사위를 주지. 오래 굴려 반들반들해진 녀석이야.`,
 ],
 retry:[
  '또 왔군. 안개는 걷히지 않았지만 주사위는 그대로야.',
  `판돈은 똑같이 HP ${DICE_DEN_STAKE}. 한 판 더?`,
 ],
 lowHp:`HP가 ${DICE_DEN_STAKE} 이하라면 판돈을 걸 수 없어. 몸부터 챙기고 오라고.`,
 win:['…허, 깔끔하군. 약속대로 상아 주사위는 네 거야.','이 주사위는 이상하게도 궁지에 몰린 사람 편을 들어 주더라고.'],
 lose:[`운이 내 쪽이었군. 판돈 HP ${DICE_DEN_STAKE}는 받아 가지.`,'다음엔 굴리기 전에 무엇을 남길지 더 오래 생각해 봐.'],
 draw:['비겼네. 판돈은 돌려주지.','이런 날은 안개 탓을 하는 게 마음 편해.'],
 forfeit:[`그만두겠다고? 판돈 HP ${DICE_DEN_STAKE}는 내 거야.`],
 done:['하로는 빈 손으로 주사위 굴리는 시늉을 하며 웃었다.','“그 주사위, 잘 굴려 줘. 녀석도 나룻배보다는 넓은 세상을 보고 싶을 테니.”'],
} as const;

/** Two-line display copy only. Purchases and effects still use the original catalog. */
const summaries:Record<string,string>={
 'whisper-eye':'상대 무작위 손패 1장\n나만 확인',
 'ember-bomb':'상대 HP -8\n최소 HP 1 유지',
 'emergency-herb':'전투 중 내 HP +10\n최대 HP 100',
 'ward-seal':'공격·패 교환 1회 방어\n비공개 방패 준비',
 'swapped-fate':'내 1장 ↔ 상대 무작위 1장\n양쪽 4장↑ · 1·2 제외',
 'fates-scales':'내 2장 ↔ 상대 무작위 2장\n양쪽 손패 5장 이상',
 'scout-lens':'2층 패 1장 투시\n안쪽 패도 선택 가능',
 'crimson-fang':'왕관 포함 승리 시\n상대 각각 피해 +1',
 'cloud-blessing':'철문 포함 승리 시\n내 HP +1 · 최대까지',
 'pioneers-eye':'아이템전 첫 분배만\n철문 3 포함 · 손패 수 유지',
 'life-sigil':'트리플 승리 시\n내 HP +2 · 최대까지',
 'wind-sigil':'페어 승리 시\n상대 각각 피해 +1',
 'warrior-crest':'트리플 승리 시\n상대 각각 피해 +2',
 'sun-sigil':'플러시 승리 시\n상대 각각 피해 +3',
};
export const shopEffectSummary=(id:string,effect:string)=>summaries[id]||effect;

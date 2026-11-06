import type { RpgProfessionId } from './rpg-professions';
type SkillValues = readonly [
    swordsman: number,
    mage: number,
    cleric: number,
    reveal: number,
    trap: number
];
export const ROUND_SKILLS: Readonly<Record<string, SkillValues>> = {
    '페어': [2, 1, 2, 1, 0], '트리플': [3, 2, 3, 1, 2], '스트레이트': [4, 2, 4, 1, 3], '플러시': [4, 2, 4, 1, 3],
    '풀하우스': [5, 3, 5, 1, 4], '포카드': [6, 3, 6, 2, 5], '스트레이트 플러시': [8, 4, 8, 2, 7],
};
export function hasRoundCombat(game: {
    rpgRun?: {
        combat?: {
            roundRules?: boolean;
        };
    } | null;
}) { return game.rpgRun?.combat?.roundRules === true; }
export function roundSkill(profession: RpgProfessionId, label: string) {
    const v = ROUND_SKILLS[label];
    if (!v)
        return { damage: label === '싱글' ? 1 : 0, heal: 0, reveal: 0, trap: 0 };
    return { damage: profession === 'swordsman' ? v[0] : profession === 'mage' ? v[1] : 0, heal: profession === 'cleric' ? v[2] : 0, reveal: profession === 'rogue' ? v[3] : 0, trap: profession === 'rogue' ? v[4] : 0 };
}
export function roundProfessionDescription(id: RpgProfessionId) {
    const rows = Object.keys(ROUND_SKILLS).map(label => { const s = roundSkill(id, label); return `${label} · ${id === 'rogue' ? `바닥 ${s.reveal}장 확인${s.trap ? ` · 함정 피해 ${s.trap}` : ''}` : id === 'cleric' ? `회복 +${s.heal}` : id === 'mage' ? `상대 각각 피해 ${s.damage}` : `무작위 상대 1명 피해 ${s.damage}`}`; });
    return [...rows, id === 'rogue' ? '싱글 · 상대 각각 기본 피해 1 / 남은 함정 개당 무작위 상대 피해 1 · 자기 회수 시 제거' : '싱글 · 상대 각각 기본 피해 1', '족보 승리 시 자동 적립 · 한 명이 손패를 비우면 일괄 정산'];
}

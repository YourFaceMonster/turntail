import { combo, settle, uid, type Game } from './game';
import { hpLimit } from './hp-limit';
import { roundSkill } from './profession-round-rules';
import { roundCombatState } from './profession-round-combat';
import { blockItemBattleDamage, newItemBattleState, scoutProfessionFloor } from './item-battle-rules';
import { itemBattleRelicWin } from './item-battle-relics';
import { withRelicActivations } from './rpg-relic-feedback';
import { recordRpgRoundHealth } from './rpg-round-health';
import { isRpgPhaseOne, reconcileRpgEliminations } from './rpg-phase-one';
import { finishHpItemMatch } from './hp-item-mode';
import type { HpBattleEvent } from './hp-item-battle';
import type { ProfessionEffect } from './rpg-profession-combat';
const zeros = (g: Game) => g.players.map(() => 0);
const opponents = (g: Game, actor: number) => g.players.flatMap((_, seat) => seat !== actor && g.rpgRun!.hp[seat] > 0 ? [seat] : []);
function pick<T>(values: T[]): T | undefined { if (!values.length)
    return; const r = new Uint32Array(1); crypto.getRandomValues(r); return values[r[0] % values.length]; }
/** Apply a single skill/item/trap without changing turn timing or opening a review. */
export function applyImmediateEffects(g: Game, damage: number[], healing: number[], now = Date.now(), card = false) {
    const run = g.rpgRun!, s = roundCombatState(g), before = [...run.hp], blocked = zeros(g);
    s.immediateDamage ??= zeros(g);
    s.immediateHealing ??= zeros(g);
    const applied = before.map((hp, seat) => {
        if (hp <= 0)
            return 0;
        let amount = blockItemBattleDamage(g, seat, Math.max(0, damage[seat] || 0), now);
        if (seat === 0 && run.shield > 0) {
            const n = Math.min(amount, run.shield);
            amount -= n;
            run.shield -= n;
        }
        blocked[seat] = (damage[seat] || 0) - amount;
        return Math.min(hp, amount);
    });
    const healed = before.map((hp, seat) => hp <= 0 ? 0 : Math.min(Math.max(0, healing[seat] || 0), hpLimit(run) - hp));
    run.hp = before.map((hp, seat) => hp <= 0 ? 0 : Math.max(0, Math.min(hpLimit(run), hp - applied[seat] + healed[seat])));
    run.updatedAt = now;
    recordRpgRoundHealth(run, before);
    if (!card) {
        applied.forEach((n, i) => s.immediateDamage![i] += n);
        healed.forEach((n, i) => s.immediateHealing![i] += n);
    }
    s.appliedDamage = s.immediateDamage.map((n, i) => n + (card ? applied[i] : 0));
    s.appliedHealing = [...s.immediateHealing];
    return { before, after: [...run.hp], damage: applied, healing: healed, blocked };
}
/** Existing RPG and item-match death rules run after their event has been recorded. */
export function finishImmediateCombat(g: Game, now = Date.now(), reason: 'battle' | 'trap' | 'item' = 'battle') {
    if (g.rpgRun?.status !== 'playing')
        return;
    if (isRpgPhaseOne(g)) {
        reconcileRpgEliminations(g, now);
        return;
    }
    if (g.rpgRun!.hp.some(hp => hp <= 0)) {
        if (g.hpItemMode) {
            if (g.hpItemMatch)
                g.hpItemMatch.endReason = reason;
            finishHpItemMatch(g);
        }
        else {
            g.phase = 'ended';
            g.turnDeadline = 0;
            g.winner = g.lastBy ?? g.rpgRun!.hp.findIndex(hp => hp > 0);
            settle(g);
        }
    }
}
export function resolveImmediateProfessionBattle(g: Game, now = Date.now()): HpBattleEvent | null {
    const run = g.rpgRun, c = run?.combat;
    if (!run || !c || run.status !== 'playing' || c.round !== g.round || g.lastBy === null || !g.trick.length)
        return null;
    const id = `${g.code}:${g.round}:${g.tablePlay?.id || g.lastEvent?.id || g.completedBattles || 0}`, prior = c.battles.find(e => e.id === id);
    if (prior)
        return prior;
    const actor = g.lastBy, label = combo(g.trick)?.label;
    if (!label || run.hp[actor] <= 0)
        return null;
    const s = roundCombatState(g);
    if (s.settled)
        return null;
    const role = c.professions[actor], skill = roundSkill(role, label), targets = opponents(g, actor), damage = zeros(g), healing = zeros(g), effects: ProfessionEffect[] = [];
    const target = role === 'swordsman' && label !== '싱글' ? pick(targets) : undefined;
    if (label === '싱글') {
        for (const seat of targets)
            s.damage[seat] += 1;
    }
    else {
        for (const seat of targets)
            if (role === 'mage' || seat === target)
                damage[seat] += skill.damage;
        healing[actor] = skill.heal;
        const effect: ProfessionEffect = { id: uid(), round: g.round, actor, profession: role, kind: 'active', label, damage: skill.damage, heal: skill.heal, revealed: 0, at: now, immediate: true, trait: '족보 자동 스킬', ...(target !== undefined ? { target } : {}) };
        if (role === 'rogue') {
            effect.floorScout = true;
            effect.revealed = scoutProfessionFloor(g, actor, skill.reveal);
            const extra = c.itemBattle ??= newItemBattleState(g.players.length);
            const spots = g.stacks.flatMap((stack, index) => { const tile = stack[1] || stack[0]; return tile && !extra.traps.some(t => t.round === g.round && t.tileId === tile.id) ? [{ index, tile }] : []; });
            const spot = skill.trap ? pick(spots) : undefined;
            if (spot) {
                extra.traps.push({ id: uid(), owner: actor, index: spot.index, tileId: spot.tile.id, round: g.round, damage: skill.trap });
                effect.trapDamage = skill.trap;
            }
            else if (skill.trap) {
                const victim = pick(targets);
                if (victim !== undefined) {
                    damage[victim] += 1;
                    effect.trapFallback = 1;
                }
            }
        }
        effects.push(effect);
        c.effects.push(effect);
    }
    const relic = actor === 0 ? itemBattleRelicWin(run.equipped, label, g.trick) : { damage: 0, heal: 0, effects: [] };
    for (const seat of targets)
        damage[seat] += relic.damage;
    healing[actor] += relic.heal;
    const result = applyImmediateEffects(g, damage, healing, now);
    if (effects.length)
        effects[0].heal = Math.min(skill.heal, result.healing[actor]);
    const event: HpBattleEvent = { id, round: g.round, actor, label, damage: skill.damage, maxHp: hpLimit(run), ordinal: c.battles.length + 1, winningTiles: g.trick.map(t => ({ ...t })), damageTaken: result.damage, skillHealing: result.healing, blockedDamage: result.blocked, hpBefore: result.before, hpAfter: result.after, professions: effects, relics: relic.effects, relicDamage: relic.damage, relicHealing: Math.max(0, result.healing[actor] - (effects[0]?.heal || 0)), roundPending: label === '싱글', instantSkill: true, at: now };
    c.battles.push(event);
    c.battleTiles = zeros(g);
    c.lastInstant = event;
    if (g.hpItemMatch) {
        g.hpItemMatch.battles = c.battles;
        g.hpItemMatch.battleTiles = zeros(g);
    }
    if (relic.effects.length)
        Object.assign(run, withRelicActivations(run, relic.effects, now));
    g.log = [`${g.players[actor].name} · ${label} 승리 · ${label === '싱글' ? '패 피해 1 정산 예정' : role === 'rogue' ? `바닥 ${effects[0]?.revealed || 0}장 확인 · 함정 설치` : role === 'cleric' ? `HP +${result.healing[actor]}` : g.players.flatMap((p, i) => result.damage[i] ? [`${p.name} HP −${result.damage[i]}`] : []).join(' · ') || '피해 방어'}`, ...g.log].slice(0, 40);
    finishImmediateCombat(g, now);
    return event;
}
/** Only queued basic-card damage is applied here. Skills already affected live HP. */
export function settleImmediateCardRound(g: Game, now = Date.now()) {
    const run = g.rpgRun!, c = run.combat!, s = roundCombatState(g);
    if (s.settled)
        return;
    const before = [...run.hp], fallback = zeros(g);
    if (s.handFinished) {
        for (const trap of c.itemBattle?.traps || []) {
            if (trap.round !== g.round || run.hp[trap.owner] <= 0)
                continue;
            const target = pick(opponents(g, trap.owner));
            if (target !== undefined)
                fallback[target]++;
        }
    }
    if (c.itemBattle)
        c.itemBattle.traps = [];
    if (fallback.some(Boolean))
        applyImmediateEffects(g, fallback, zeros(g), now);
    const cards = s.handFinished ? s.damage : zeros(g), result = applyImmediateEffects(g, cards, zeros(g), now, true);
    s.settled = true;
    const summary: HpBattleEvent = { id: `${g.code}:${g.round}:settlement`, round: g.round, actor: g.winner!, label: '패 정산', damage: result.damage.reduce((a, b) => a + b, 0), maxHp: hpLimit(run), damageTaken: result.damage, blockedDamage: result.blocked, hpBefore: before, hpAfter: [...run.hp], roundFinal: true, roundSettlement: true, at: now };
    c.lastBattle = summary;
    if (g.hpItemMatch)
        g.hpItemMatch.lastBattle = summary;
    g.log = ['판 종료 · 패 피해 정산 · 스킬 중복 적용 없음', ...g.log].slice(0, 40);
}

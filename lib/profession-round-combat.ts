import { combo, uid, type Game } from './game';
import { hpLimit } from './hp-limit';
import { hasRoundCombat, roundSkill } from './profession-round-rules';
import { newItemBattleState, scoutProfessionFloor, blockItemBattleDamage } from './item-battle-rules';
import { itemBattleRelicWin } from './item-battle-relics';
import { withRelicActivations } from './rpg-relic-feedback';
import { recordRpgRoundHealth } from './rpg-round-health';
import type { HpBattleEvent } from './hp-item-battle';
import type { ProfessionEffect } from './rpg-profession-combat';
export type RoundCombatState = {
    round: number;
    damage: number[];
    healing: number[];
    trapDamage: number[];
    itemDamage: number[];
    itemHealing: number[];
    settled?: boolean;
    appliedDamage?: number[];
    appliedHealing?: number[];
};
export function roundCombatState(game: Game) {
    const c = game.rpgRun!.combat!;
    if (c.pendingRound?.round !== game.round)
        c.pendingRound = { round: game.round, damage: game.players.map(() => 0), healing: game.players.map(() => 0), trapDamage: game.players.map(() => 0), itemDamage: game.players.map(() => 0), itemHealing: game.players.map(() => 0) };
    return c.pendingRound;
}
export function queueRoundDamage(g: Game, seat: number, amount: number, source: 'attack' | 'trap' | 'item' = 'attack') {
    const s = roundCombatState(g);
    if (s.settled)
        return;
    s.damage[seat] += amount;
    if (source === 'trap')
        s.trapDamage[seat] += amount;
    if (source === 'item')
        s.itemDamage[seat] += amount;
}
export function queueRoundHealing(g: Game, seat: number, amount: number, item = false) { const s = roundCombatState(g); if (s.settled)
    return; s.healing[seat] += amount; if (item)
    s.itemHealing[seat] += amount; }
function randomChoice<T>(values: T[]): T | undefined { if (!values.length)
    return; const r = new Uint32Array(1); crypto.getRandomValues(r); return values[r[0] % values.length]; }
function opponents(g: Game, actor: number) { return g.players.flatMap((_, seat) => seat !== actor && g.rpgRun!.hp[seat] > 0 ? [seat] : []); }
/** Won tricks only; no HP mutation, popup, or added turn lock. */
export function queueProfessionRoundBattle(g: Game, now = Date.now()): HpBattleEvent | null {
    const run = g.rpgRun, c = run?.combat;
    if (!run || !c || !hasRoundCombat(g) || run.status !== 'playing' || c.round !== g.round || c.pendingRound?.settled || g.lastBy === null || !g.trick.length)
        return null;
    const id = `${g.code}:${g.round}:${g.tablePlay?.id || g.lastEvent?.id || g.completedBattles || 0}`, prior = c.battles.find(e => e.id === id);
    if (prior)
        return prior;
    const actor = g.lastBy, label = combo(g.trick)?.label;
    if (!label || run.hp[actor] <= 0)
        return null;
    const role = c.professions[actor], skill = roundSkill(role, label), targets = opponents(g, actor), damage = g.players.map(() => 0), heal = g.players.map(() => 0), effects: ProfessionEffect[] = [];
    const target = role === 'swordsman' && label !== '싱글' ? randomChoice(targets) : undefined;
    for (const seat of targets)
        if (label === '싱글' || role === 'mage' || seat === target)
            damage[seat] += skill.damage;
    heal[actor] = skill.heal;
    if (label !== '싱글') {
        const effect: ProfessionEffect = { id: uid(), round: g.round, actor, profession: role, kind: 'active', label, damage: skill.damage, heal: skill.heal, revealed: 0, at: now, ...(target !== undefined ? { target } : {}), trait: '족보 자동 스킬' };
        if (role === 'rogue') {
            effect.floorScout = true;
            effect.revealed = scoutProfessionFloor(g, actor, skill.reveal);
            const extra = c.itemBattle ??= newItemBattleState(g.players.length);
            const choices = g.stacks.flatMap((stack, index) => { const tile = stack[1] || stack[0]; return tile && !extra.traps.some(t => t.round === g.round && t.tileId === tile.id) ? [{ index, tile }] : []; });
            const spot = skill.trap ? randomChoice(choices) : undefined;
            if (spot) {
                extra.traps.push({ id: uid(), owner: actor, index: spot.index, tileId: spot.tile.id, round: g.round, damage: skill.trap });
                effect.trapDamage = skill.trap;
            }
            else if (skill.trap) {
                const victim = randomChoice(targets);
                if (victim !== undefined) {
                    queueRoundDamage(g, victim, 1, 'trap');
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
    heal[actor] += relic.heal;
    damage.forEach((n, seat) => queueRoundDamage(g, seat, n));
    heal.forEach((n, seat) => queueRoundHealing(g, seat, n));
    const event: HpBattleEvent = { id, round: g.round, actor, label, damage: skill.damage, maxHp: hpLimit(run), ordinal: c.battles.length + 1, winningTiles: g.trick.map(t => ({ ...t })), damageTaken: damage, hpBefore: [...run.hp], hpAfter: [...run.hp], professions: effects, relics: relic.effects, relicDamage: relic.damage, relicHealing: relic.heal, roundPending: true, at: now };
    c.battles.push(event);
    c.battleTiles = g.players.map(() => 0);
    if (g.hpItemMatch) {
        g.hpItemMatch.battles = c.battles;
        g.hpItemMatch.battleTiles = g.players.map(() => 0);
    }
    g.log = [`${g.players[actor].name} · ${label} 승리 · ${role === 'rogue' && label !== '싱글' ? `바닥 ${effects[0]?.revealed || 0}장 확인 · 함정 적립` : skill.heal ? `회복 ${skill.heal} 적립` : `공격 ${skill.damage} 적립`}`, ...g.log].slice(0, 40);
    return event;
}
/** Card results are captured first; all HP then resolves together before money/progression. */
export function settleProfessionRound(g: Game, now = Date.now()) {
    if (!hasRoundCombat(g) || g.phase !== 'ended' || g.winner === null)
        return;
    const run = g.rpgRun!, c = run.combat!, s = roundCombatState(g);
    if (s.settled)
        return;
    const extra = c.itemBattle;
    for (const trap of extra?.traps || []) {
        if (trap.round !== g.round)
            continue;
        const target = randomChoice(opponents(g, trap.owner));
        if (target !== undefined)
            queueRoundDamage(g, target, 1, 'trap');
    }
    if (extra)
        extra.traps = [];
    const before = [...run.hp], blocked = g.players.map(() => 0);
    const applied = s.damage.map((amount, seat) => { if (before[seat] <= 0)
        return 0; let damage = blockItemBattleDamage(g, seat, amount, now); if (seat === 0 && run.shield > 0) {
        const shield = Math.min(damage, run.shield);
        damage -= shield;
        run.shield -= shield;
    } blocked[seat] = amount - damage; return damage; });
    run.hp = before.map((hp, seat) => hp <= 0 ? 0 : Math.max(0, Math.min(hpLimit(run), hp - applied[seat] + s.healing[seat])));
    run.updatedAt = now;
    s.settled = true;
    s.appliedHealing = before.map((hp, seat) => hp <= 0 ? 0 : Math.min(s.healing[seat], Math.max(0, hpLimit(run) - hp + applied[seat])));
    s.appliedDamage = before.map((hp, seat) => hp <= 0 ? 0 : Math.min(applied[seat], hp + s.appliedHealing![seat]));
    recordRpgRoundHealth(run, before);
    if (run.roundHealth) {
        const r = run.roundHealth;
        before.forEach((hp, seat) => { const net = run.hp[seat] - hp; r.damage[seat] -= Math.max(0, -net); r.healing[seat] -= Math.max(0, net); const heal = Math.min(s.healing[seat], Math.max(0, hpLimit(run) - hp + applied[seat])); r.healing[seat] += heal; r.damage[seat] += Math.min(applied[seat], hp + heal); });
    }
    const summary: HpBattleEvent = { id: `${g.code}:${g.round}:settlement`, round: g.round, actor: g.winner, label: '판 전체 정산', damage: s.appliedDamage.reduce((a, b) => a + b, 0), maxHp: hpLimit(run), damageTaken: s.appliedDamage, blockedDamage: blocked, hpBefore: before, hpAfter: [...run.hp], roundFinal: true, roundSettlement: true, roundHealing: [...s.appliedHealing!], at: now };
    c.lastBattle = summary;
    if (g.hpItemMatch)
        g.hpItemMatch.lastBattle = summary;
    const relics = c.battles.flatMap(e => e.relics || []);
    if (relics.length)
        Object.assign(run, withRelicActivations(run, relics, now));
    g.log = ['판 종료 · 공격·회복·함정 일괄 정산', ...g.log].slice(0, 40);
}

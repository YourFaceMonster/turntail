# Codex 그림 요청 · 합성 전설 유물 아이콘 4종 (2026-11-12)

새 RPG에 유물 합성이 들어갔다(로컬). 두 재료 유물을 합치면 전설 유물 1개가 된다.
지금은 재료 아이콘 하나를 임시로 빌려 쓰고 있다(`lib/item-battle-relics.ts`의 `FORGED_TEMP_ICON`).
새 아이콘이 오면 Claude가 이 임시 연결을 지운다.

## 공통 규격

- 스타일: `C:/Users/SONG/.codex/skills/turntale-cartoon-fantasy/SKILL.md`. 굵은 손그림 윤곽선, 단순한 명암.
- 크기: 1254×1254 PNG, 투명 배경. 기존 `watchkeepers-blue-glass-v1.png`, `haro-ivory-die-v1.png`와 같다.
- 앱에는 WebP를 쓰므로 둘 다 만든다.
- 배치: 물건 하나를 가운데에 둔다. 작은 칸(약 40px)에서도 알아보도록 실루엣을 굵게 그린다.
- 전설 표시:
  - 금빛 테두리 광채(`#f2c166` 계열)를 아주 얇게 넣는다.
  - 재료 두 개의 특징이 한 물건 안에서 보여야 한다.
  - 두 그림을 나란히 붙여 놓은 모양은 안 된다.
- 재료 아이콘을 참조로 쓴다: `public/rpg-items-v1/relics/<재료 id>.webp`
- 저장 위치: `public/rpg-items-v1/relics/<id>.png` / `<id>.webp`. 같은 이름의 기존 파일은 없다.
- 생성 기록(프롬프트·참조·탈락본)은 `artifacts/forged-relics-2026-11-12/`에 남긴다.

## 목록

| id | 이름 | 재료 (참조 아이콘) | 그림 방향 |
|---|---|---|---|
| `whole-heart` | 온전한 심장 | `cracked-heart` + `second-heart` | 금이 간 붉은 심장의 균열이 청록 보석빛 금속선으로 메워진 하나의 심장. 금 간 자국은 흔적으로만 남긴다. |
| `gamblers-hourglass` | 승부사의 모래시계 | `gamblers-gloves` + `stopped-hourglass` | 승부사의 가죽 장갑이 감싼 모래시계. 멈췄던 모래가 다시 흐르는 순간. |
| `undying-lantern` | 꺼지지 않는 등불 | `recovery-lantern` + `final-knot` | 회복의 등불 손잡이에 붉은 매듭이 묶여 있다. 불꽃은 더 밝고 단단하다. |
| `forked-mirror` | 두 갈래 거울 | `twin-needle-compass` + `split-mirror` | 갈라진 손거울 안에 쌍침 나침반 바늘 두 개가 서로 다른 방향을 가리킨다. |

## 하지 말 것

- 일반 승부 패나 이야기 특별 패의 문양(왕관·철문·성화·열쇠)을 넣지 않는다.
- 글자나 숫자를 넣지 않는다.
- 기존 유물 아이콘을 덮어쓰지 않는다.

# Codex 그림 요청 · 승부 직전 클로즈업 14장 (2026-11-15)

사용자 지시: "7그리자". 2026-11-11 요청서 B(`codex-art-request-2026-11-11-maps-closeups.md`)를 지금 인물·가로 그림 기준으로 다시 쓴 것이다. 그 B는 이 문서로 대신한다.

## 왜
ST4~10 승부 전 대화는 3~8줄 내내 같은 그림이다. 대화 **마지막 줄**(“한 판 하자”, “패를 내라”)에서 승부 직전 클로즈업으로 바뀌면 장면이 살아난다. 세로·가로 각 1장, 7개 스테이지 = 14장.

## 공통 스타일
- `C:/Users/SONG/.codex/skills/turntale-cartoon-fantasy/SKILL.md`를 읽고 그대로 적용한다(굵은 손그림 윤곽선, 단순한 명암의 2D 카툰 판타지).
- 크기: 세로 1024×1536, 가로 1672×941. PNG 원본 + 앱용 WebP(같은 이름).
- 아래 22%는 자막 자리라 어둡고 단순하게.
- 글자·숫자·워터마크 없음.

## 참고 그림 (꼭 함께 넣기)
1. 같은 스테이지의 승부 전 그림: `public/story/st{N}-before-portrait-v1.png`(ST6만 `-v2`)와 `public/story/st{N}-before-wide-v1.png`. **같은 인물·옷·탁자·조명·색**을 유지한다.
2. 패 모양: `public/prologue/tavern-wager-portrait-v2.png`, `tavern-wager-wide-v2.png`. 일반 대결 패다(크림색 두꺼운 패). 이야기 특별 패(`story-cards/*-special-*`)를 쓰지 않는다.

## 프롬프트 (공통)
```
Close-up of the game table from the attached reference scene, at the moment the match begins. In the foreground, the traveler's hand places one cream-white game tile face down on the table (same tile shape and material as the tavern wager reference). Across the table, the named opponent leans in, face and hands lit by the scene's own light, expression as described. Keep the same character design, clothes, props, table and colour palette as the reference. Bold hand-drawn outlines, simple cel shading, 2D cartoon fantasy. Bottom 22% dark and calm for subtitles. No text, no numbers.
```

## 장면 목록
| 스테이지 | 저장 이름 (세로 / 가로) | 마주 앉은 상대 (참고 그림 속 같은 인물) | 마지막 대사 | 표정·분위기 |
|---|---|---|---|---|
| ST4 물안개 폭포 | `st4-duel-portrait-v1` / `st4-duel-wide-v1` | 수리 | “기다리는 동안 한 판 하자.” | 느긋한 미소, 젖은 돌과 물보라 |
| ST5 구름다리 쉼터 | `st5-duel-portrait-v1` / `st5-duel-wide-v1` | 하온 | “누가 먼저 건너고 누가 남을지, 패로 정하자.” | 진지함, 바람에 흔들리는 랜턴 |
| ST6 수호자의 회랑 | `st6-duel-portrait-v1` / `st6-duel-wide-v1` | 카르덴 (보스) | “테이블에 앉아라. 예법대로 겨룬다.” | 꼿꼿하고 무거운 침묵 |
| ST7 달빛 고목 | `st7-duel-portrait-v1` / `st7-duel-wide-v1` | 루엔 | “자네가 어느 자리에 앉게 될지 보지.” | 여유로운 눈빛, 푸른 달빛 |
| ST8 별빛 성소 | `st8-duel-portrait-v1` / `st8-duel-wide-v1` | 아스텔 | “나를 이긴 사람에게만 보여 주기로 약속했거든.” | 장난스러운 자신감, 호박빛 등불과 별빛 |
| ST9 잿불 제단 | `st9-duel-portrait-v1` / `st9-duel-wide-v1` | 재온 (보스) | “패를 내라.” | 담담함, 떠도는 붉은 불씨 |
| ST10 붉은 세계수 | `st10-duel-portrait-v1` / `st10-duel-wide-v1` | 첫 번째 수호자 (`public/story/st10-guardian-v1.png`도 참고) | “답은 패로 해라.” | 두건 그림자 속 얼굴, 붉은 잎과 금빛 수액 |

## 넘기기 전 검수
- 같은 스테이지 승부 전 그림과 나란히 놓고 인물·옷·소품·색이 같은지 본다.
- 패가 일반 대결 패(크림색, 두꺼움)이고 앞면이 보이지 않는지 본다.
- 크기(1024×1536 / 1672×941)와 아래 22%가 어두운지 확인한다.
- 저장: `public/story/` (PNG + WebP).

## Claude가 할 연결 (그림이 오면)
- `lib/rpg-chapters.ts` `CHAPTER_ART_SLOTS`에 `st{N}-duel` 7개 추가.
- `lib/rpg-chapter-scenes.ts` 각 스테이지 `before` 마지막 줄에 `st{N}-duel` 그림을 붙인다. 대사 문구는 바꾸지 않는다.
- 미리 불러오기(`stageArtToPreload`)에 포함, 테스트 추가, 375×812·1366×768 화면 확인.

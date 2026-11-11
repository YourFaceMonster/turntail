# Codex 그림 생성 요청 · ST4~10 지역 지도 3장 비율 변경 (2026-11-11 밤)

작성: Claude · 대상: 0.7.13 이후 로컬

2026-11-11 처리: Codex가 v2 3장 생성([기록](art-generation-region-maps-v2-2026-11-11.md)). Claude가 앱 연결 — `lib/rpg-chapters.ts` 지도 3키만 v2, `lib/rpg-journey.ts` 세로 좌표를 실제 그림에 맞춤(ST10은 y48), 지역 2 점선 새 그림 길로 다시 그림, 세로 화면은 HUD~메뉴 사이 꽉 채우기, 임시 위아래 밀기·자동 스크롤 제거. 390×760·360×800·384×688에서 지도 2·3·4 장소가 모두 화면 안, `tsc` 통과, 테스트 388 통과·실패 0·건너뜀 18. 빌드·배포 없음.

> 작업 원칙(AGENTS.md): PC 로컬 `site-publish-checkout/`, 시작 시 `git pull --ff-only origin main`. 빌드·배포 요청이 없으면 로컬 저장까지만. 기존 PNG는 지우지 않고 새 번호(`-v2`)로 만든다. 앱은 WebP만 참조한다.
> 스타일 기준: `C:/Users/SONG/.codex/skills/turntale-cartoon-fantasy/SKILL.md`, 공통 스타일 문장은 [rpg-st4-10-art-prompts.md](rpg-st4-10-art-prompts.md) 그대로.

## 왜 다시 그리나

- 지금 지역 지도(`public/story/region-{2,3,4}-map-portrait-v1`)는 **941×1672(약 9:16)** 이다.
- 휴대폰 세로 화면에서 위 HUD(이름·HP, 약 80~100px)와 아래 메뉴(약 50~56px)를 빼고 지도가 쓸 수 있는 공간은 **약 9:13~9:14** 다.
  - 390×760 화면: 390×606 (0.64)
  - 사용자 휴대폰 스크린샷: 약 384×557 (0.69)
  - 360×800 화면: 360×646 (0.56)
- 그래서 가로를 꽉 채우면 위아래가 넘쳐서 밀어야 하고(지금 임시 수정), 한 화면에 다 넣으면 양옆이 빈다(0.7.13, 사용자가 원하지 않음).
- 사용자 요청: **가로를 꽉 채우고, HUD 바로 아래부터 메뉴 위까지 한 화면에 보이는 지도.**

## 그릴 것

| 새 파일 | 지역 | 지금 그림(참고로 첨부) |
|---|---|---|
| `public/story/region-2-map-portrait-v2.png` | 성화의 영역 (ST4 폭포 · ST5 구름다리 · ST6 회랑) | `region-2-map-portrait-v1.png` |
| `public/story/region-3-map-portrait-v2.png` | 열쇠의 영역 (ST7 고목 · ST8 성소 · ST9 제단) | `region-3-map-portrait-v1.png` |
| `public/story/region-4-map-portrait-v2.png` | 왕관의 영역 (ST10 붉은 세계수) | `region-4-map-portrait-v1.png` |

- **크기: 1024×1600 (9:14.06).** 다르게 나오면 늘리지 말고 같은 폭으로 잘라 맞춘다.
- 장면·건물·색·밤 분위기는 지금 그림 그대로 두고, **세로를 줄인 구도**로 다시 배치한다. 지금 그림에서 위쪽 하늘·아래쪽 구름처럼 비어 있는 부분을 줄이는 방향.
- **안전 영역:** 휴대폰마다 비율이 달라 앱은 그림을 화면에 꽉 채우고 넘치는 쪽을 자른다(360×800은 좌우 약 6%씩, 짧은 휴대폰은 위아래 약 4%씩). 장소 건물·길은 **가로 10~90%, 세로 7~93%** 안에 둔다. 가장자리는 잘려도 괜찮은 구름·바위·나무로 채운다.
- 글자·표시·마커 없음. 눈 없음(지역 1만 눈).

## 장소 위치 (가로%, 세로%)

지금 앱 좌표를 새 비율에 맞게 옮긴 값이다. 그림이 이 자리를 지키면 앱 좌표를 거의 안 바꿔도 된다. 길은 지금 그림처럼 **본길 한 줄 + 짧은 곁길**로 이어지게 그린다.

### 성화의 영역 (region-2)
본길: ST4 → ST5 → ST6. 곁길 4곳.

| 장소 | 위치 | 그림 속 모습 |
|---|---|---|
| ST4 물안개 폭포 | (69, 60) | 폭포 옆 바위 턱 위 파란 돌 탁자 |
| 퀘스트 4 물에 젖은 기록 | (14, 61) | 왼쪽 물가, 바위에 말리는 젖은 종이 |
| ST5 구름다리 쉼터 | (49, 40) | 긴 구름다리 가운데 작은 나무 쉼터와 탁자 |
| 퀘스트 5 끊긴 매듭 | (86, 33) | 다리 오른쪽 끝의 굵은 밧줄 매듭 기둥 |
| ST6 수호자의 회랑 | (61, 14) | 무너진 돌 열주와 바랜 보라 깃발 |
| 퀘스트 6 잊힌 맹세 | (15, 18) | 작은 무너진 돌 기록실 |
| 안개 나루 주사위판 | (78, 84) | 아래 오른쪽 안개 속 낡은 나룻배 창고 |

### 열쇠의 영역 (region-3)
본길: ST7 → ST8 → ST9. 곁길 2곳.

| 장소 | 위치 | 그림 속 모습 |
|---|---|---|
| ST7 달빛 고목 | (50, 84) | 지금 그림의 고목 그대로 |
| 퀘스트 8 전해지지 못한 편지 | (85, 54) | 지금 그림 그대로 |
| ST8 별빛 성소 | (59, 32) | 지금 그림 그대로 |
| 퀘스트 9 마지막 불씨 | (15, 21) | 지금 그림 그대로 |
| ST9 잿불 제단 | (56, 11) | 지금 그림 그대로 |

### 왕관의 영역 (region-4)

| 장소 | 위치 | 그림 속 모습 |
|---|---|---|
| ST10 붉은 세계수 | (50, 44) | 지금 그림의 세계수 그대로, 화면 가운데 |

## 프롬프트 (지역마다 지금 그림을 첨부)

```
Redraw the attached region map as a 1024x1600 portrait image (shorter than the original 9:16). Keep the same places, buildings, trail, art style, colors and night mood. Recompose vertically: trim the empty sky at the top and the empty clouds at the bottom so the map fills the frame, and keep every place at the listed position (percent across, percent down). Keep all places and trails inside 10-90% across and 7-93% down; fill the outer edges with clouds, rocks or trees that can be cropped safely. The trail must connect the places in the same order as the original as one continuous, clearly drawn path, with short side paths to the side places. No labels, no markers, no text, no snow.
Places: <위 표에서 해당 지역 줄을 영어로 옮겨 넣기>
```

## 반영 (그림을 받은 뒤 Claude 또는 Codex)

1. PNG와 WebP를 함께 만든다(`region-{N}-map-portrait-v2.png/.webp`). v1 파일은 지우지 않는다.
2. `lib/rpg-chapters.ts`의 `FINAL()`은 `-portrait-v1.webp`로 고정돼 있다. `region-2-map`·`region-3-map`·`region-4-map` 세 키만 `-portrait-v2.webp`를 쓰도록 바꾼다(다른 장면 그림은 v1 유지).
3. `app/rpg-journey.css` ST4~10 지도 블록: 비율 `941/1672` → `1024/1600`. 세로 화면은 HUD~메뉴 사이 공간을 **꽉 채우기(cover)**로 바꾸고, 임시로 넣은 위아래 밀기(`overflow-y:auto`)와 현재 위치 자동 스크롤(`RpgJourneyScene.tsx`)을 뺀다.
4. 그림이 좌표를 정확히 안 지키면 `lib/rpg-journey.ts` `JOURNEY_NODES`의 `portrait` 값과 `regionRoute(region,true)` 점선을 그림에 맞춘다.
5. 확인: 390×760, 360×800, 384×688(사용자 휴대폰 근사)에서 지도 2·3·4를 띄운다(RPG → 프롤로그·화면 테스트 → TEST → 화면 바로가기 → 지도 보기). 장소 버튼이 그림 속 건물 위에 오고, 점선이 길을 따라가고, HUD·메뉴에 가리는 장소가 없고, 밀지 않아도 다 보이는지 본다.
6. `tsc --noEmit`, 전체 테스트(`scripts/register-tests.mjs` 로더). 로컬 저장까지만.

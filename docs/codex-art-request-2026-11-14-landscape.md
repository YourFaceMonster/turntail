# Codex 그림 요청 · ST4~10 가로 화면 그림 (2026-11-14)

근거: 2026-11-14 사용자 확정("이제 가로화면 만들자"). 0.7.12부터 ST4~10은 세로 그림만 있다. 가로 화면에서는 세로 그림을 가운데에 액자처럼 띄워 쓰고 있다. 이번에 같은 장면을 **가로 구도로 다시 그린다.**

그림이 오면 Claude가 연결한다. 일부만 와도 온 것부터 연결할 수 있다. 없는 그림은 지금처럼 세로 그림을 쓴다.

## 공통 규격

- **크기:** 1672×941 PNG 원본과 WebP를 함께 만든다. 기존 가로 그림(`public/prologue/tavern-landscape-v6.png`, `snow-inn-v3.png`)과 같은 크기다.
- **스타일:** `C:/Users/SONG/.codex/skills/turntale-cartoon-fantasy/SKILL.md`를 기본 적용한다.
- **세로 그림이 기준이다.** 아래 목록의 세로 그림을 열어 같은 장면을 가로 구도로 다시 그린다. 인물, 옷, 소품, 색, 시간대를 맞춘다.
  - 세로 그림을 늘리거나, 양옆에 배경을 이어 붙이거나, 위아래를 잘라 쓰지 않는다.
  - 남는 좌우 공간은 그 장소의 배경(폭포, 다리, 숲 등)을 넓혀서 채운다. 인물을 새로 추가하지 않는다.
- **대사 상자 자리:** 화면 아래쪽 약 22%에 대사 상자가 올라간다. 이 자리는 어둡고 단순하게 둔다. 얼굴과 중요한 소품은 위쪽 70% 안에 둔다.
- **글자 금지:** 그림에 글자, 숫자, 이름을 넣지 않는다. 문양은 넣어도 된다.
- **기록:** 생성 기록과 세로·가로 비교 이미지를 `artifacts/landscape-2026-11-14/`에 남긴다.
- **파일 이름:** 아래 표의 "저장 이름"을 따른다. `public/story/`에 PNG와 WebP를 같은 이름으로 둔다.

---

## A. 스테이지 장면 16장 (1순위)

모든 대결 앞뒤에 나오므로 가장 자주 보인다.

| 세로 원본 (`public/story/`) | 저장 이름 | 장면 |
|---|---|---|
| `st4-before-portrait-v1` | `st4-before-wide-v1` | ST4 물안개 폭포 · 승부 전 |
| `st4-after-portrait-v2` | `st4-after-wide-v1` | ST4 물안개 폭포 · 승리 후 |
| `st5-before-portrait-v1` | `st5-before-wide-v1` | ST5 구름다리 쉼터 · 승부 전 |
| `st5-after-portrait-v1` | `st5-after-wide-v1` | ST5 구름다리 쉼터 · 승리 후 |
| `st6-before-portrait-v2` | `st6-before-wide-v1` | ST6 수호자의 회랑 · 승부 전 |
| `st6-after-portrait-v1` | `st6-after-wide-v1` | ST6 수호자의 회랑 · 승리 후 |
| `st7-before-portrait-v1` | `st7-before-wide-v1` | ST7 달빛 고목 · 승부 전 |
| `st7-after-portrait-v2` | `st7-after-wide-v1` | ST7 달빛 고목 · 승리 후 |
| `st8-before-portrait-v1` | `st8-before-wide-v1` | ST8 별빛 성소 · 승부 전 |
| `st8-after-portrait-v2` | `st8-after-wide-v1` | ST8 별빛 성소 · 승리 후 |
| `st9-before-portrait-v1` | `st9-before-wide-v1` | ST9 잿불 제단 · 승부 전 |
| `st9-after-portrait-v3` | `st9-after-wide-v1` | ST9 잿불 제단 · 승리 후 |
| `st10-before-portrait-v1` | `st10-before-wide-v1` | ST10 붉은 세계수 · 승부 전 |
| `st10-after-portrait-v1` | `st10-after-wide-v1` | ST10 붉은 세계수 · 승리 후 |
| `ending-thrones-portrait-v1` | `ending-thrones-wide-v1` | 엔딩 · 비어 있는 두 왕좌 |
| `ending-kings-portrait-v1` | `ending-kings-wide-v1` | 엔딩 · 두 왕의 마지막 순간 |

## B. 영역 지도 3장 (1순위)

가로 화면의 여정 지도 배경이다. ST1~3의 가로 지도 `public/prologue/iron-gate-village-map-wide-v3.png`(1670×942)와 같은 구도로 그린다. 위에서 내려다본 지도이며, 위쪽 약 12%에는 지도 제목 띠가, 아래쪽 약 14%에는 버튼 줄이 올라간다.

- 세로 지도와 **같은 장소, 같은 길 순서**로 그린다. 장소의 모양과 색은 세로 지도를 따른다.
- 아래 좌표(가로 %, 세로 %)에 장소의 중심을 둔다. 좌표는 앱 아이콘이 놓이는 자리다. 맞추기 어려우면 가깝게 그리고, **실제 중심 좌표를 표로 남겨 준다.** Claude가 앱 좌표를 그림에 맞춘다.

| 세로 원본 | 저장 이름 |
|---|---|
| `region-2-map-portrait-v3` | `region-2-map-wide-v1` |
| `region-3-map-portrait-v3` | `region-3-map-wide-v1` |
| `region-4-map-portrait-v2` | `region-4-map-wide-v1` |

**성화의 영역 (region-2)**

| 장소 | 좌표 |
|---|---|
| ST4 물안개 폭포 | 40 · 78 |
| ST5 구름다리 쉼터 | 56 · 50 |
| ST6 수호자의 회랑 | 58 · 20 |
| 물에 젖은 기록 (퀘스트) | 22 · 62 |
| 끊긴 매듭 (퀘스트) | 76 · 60 |
| 잊힌 맹세 (퀘스트) | 28 · 30 |
| 안개 나루 주사위판 (나룻배 창고) | 82 · 32 |
| 안개 나루 주점 (배를 개조한 주점) | 12 · 84 |

**열쇠의 영역 (region-3)**

| 장소 | 좌표 |
|---|---|
| ST7 달빛 고목 | 40 · 78 |
| ST8 별빛 성소 | 56 · 50 |
| ST9 잿불 제단 | 58 · 20 |
| 전해지지 못한 편지 (퀘스트) | 76 · 58 |
| 마지막 불씨 (퀘스트) | 28 · 32 |
| 달빛 등불 주점 (고목 뿌리 굴 주점) | 16 · 70 |

**왕관의 영역 (region-4)**

| 장소 | 좌표 |
|---|---|
| ST10 붉은 세계수 | 50 · 42 |

## C. 서브퀘스트·장소 8장 (2순위)

| 세로 원본 | 저장 이름 | 장면 |
|---|---|---|
| `quest-4-portrait-v1` | `quest-4-wide-v1` | 물에 젖은 기록 |
| `quest-5-portrait-v1` | `quest-5-wide-v1` | 끊긴 매듭 |
| `quest-6-portrait-v1` | `quest-6-wide-v1` | 잊힌 맹세 |
| `quest-8-portrait-v1` | `quest-8-wide-v1` | 전해지지 못한 편지 |
| `quest-9-portrait-v2` | `quest-9-wide-v1` | 마지막 불씨 |
| `dice-den-portrait-v1` | `dice-den-wide-v1` | 안개 나루 주사위판 (하로) |
| `inn-2-portrait-v1` | `inn-2-wide-v1` | 안개 나루 주점 (모란·수달·도칸) |
| `inn-3-portrait-v1` | `inn-3-wide-v1` | 달빛 등불 주점 (모로·검은 고양이·리네) |

## D. 영역 이동 컷씬 6장 (2순위)

| 세로 원본 | 저장 이름 | 장면 |
|---|---|---|
| `cross-4-depart-portrait-v1` | `cross-4-depart-wide-v1` | 철문의 영역을 떠나는 길 |
| `cross-4-border-portrait-v1` | `cross-4-border-wide-v1` | 물안개 경계 · 성화의 영역이 보임 |
| `cross-7-depart-portrait-v1` | `cross-7-depart-wide-v1` | 회랑을 나서는 길 |
| `cross-7-border-portrait-v1` | `cross-7-border-wide-v1` | 달빛 경계 · 열쇠의 영역이 보임 |
| `cross-10-depart-portrait-v1` | `cross-10-depart-wide-v1` | 잿불 제단을 떠나는 길 |
| `cross-10-border-portrait-v1` | `cross-10-border-wide-v1` | 구름 위 마지막 경계 · 붉은 세계수로 가는 길 |

## E. 이야기 패 장면 7장 (3순위 · 패 비율 규칙 주의)

손에 이야기 특별 패를 든 장면이다. **`docs/story-keepsake-art-guide.md`를 먼저 읽는다.**

- 패 몸통은 일반 트럼프 카드 실물 크기(약 63×88mm, 폭:높이 약 0.72)로 둔다. 가로 캔버스라고 패를 넓적하게 만들지 않는다.
- 손바닥 대비 크기, 잡는 지점, 손가락이 가리는 부분을 세로 그림과 맞춘다.
- 승인된 문양과 장식(`public/story-cards/*-front-special-v1.png`)을 바꾸지 않는다.

| 세로 원본 | 저장 이름 | 장면 |
|---|---|---|
| `st6-flame-two-portrait-special-v2` | `st6-flame-two-wide-special-v1` | ST6 받침대 위 성화 2 |
| `st6-flame-two-back-portrait-special-v2` | `st6-flame-two-back-wide-special-v1` | 성화 2 뒷면 (두 겹 불꽃) |
| `st9-key-two-portrait-special-v2` | `st9-key-two-wide-special-v1` | ST9 비밀의 열쇠 2 |
| `st9-key-two-back-portrait-special-v2` | `st9-key-two-back-wide-special-v1` | 열쇠 2 뒷면 (포개진 열쇠) |
| `ending-handoff-portrait-special-v2` | `ending-handoff-wide-special-v1` | 엔딩 · 새 방랑자에게 왕관 2를 건넴 |
| `true-ending-record-portrait-special-v2` | `true-ending-record-wide-special-v1` | 진엔딩 · 최초의 승부사의 기록 |
| `true-ending-village-portrait-special-v2` | `true-ending-village-wide-special-v1` | 진엔딩 · 노르문 주점에서 이야기를 전함 |

## F. 기본 프로필 동물 얼굴 4장 (덤 · 가로 화면과 별개)

지금 사진을 올리지 않은 플레이어와 AI 자리에는 이모지(🦊🦉🐯🐼)가 보인다. 다른 화면은 모두 손그림이라 이 자리만 어색하다. 같은 스타일의 동물 얼굴 그림으로 바꾼다.

- 크기: 512×512 PNG 원본, 앱용 256×256 WebP. 동그란 액자 안에 들어가므로 얼굴을 가운데에 두고, 바깥은 단색 배경으로 둔다.
- 옷이나 소품 없이 얼굴과 어깨만. 동물이지만 TURNTALE 손님처럼 살짝 의인화한 표정.
- 배경색: 여우 산호색, 부엉이 하늘색, 호랑이 호박색, 판다 보라색 (앱의 자리 색과 같다).

| 저장 이름 (`public/avatars/`) | 동물 |
|---|---|
| `fox-v1` | 여우 |
| `owl-v1` | 부엉이 |
| `tiger-v1` | 호랑이 |
| `panda-v1` | 판다 |

---

## 합계

| 묶음 | 장수 | 순위 |
|---|---|---|
| A. 스테이지 장면 | 16 | 1 |
| B. 영역 지도 | 3 | 1 |
| C. 서브퀘스트·장소 | 8 | 2 |
| D. 영역 이동 | 6 | 2 |
| E. 이야기 패 장면 | 7 | 3 |
| F. 기본 프로필 동물 | 4 | 덤 |
| **전체** | **44** | |

## 검수 체크 (Codex가 넘기기 전에)

- 1672×941인지 확인한다.
- 세로 그림과 나란히 놓았을 때 같은 인물·옷·소품·색인지 확인한다.
- 아래 22%가 어둡고 단순한지 확인한다.
- 지도는 장소 중심 좌표 표를 함께 남긴다.
- 이야기 패 장면은 패 폭:높이가 0.72 안팎인지 잰다.

# TURNTALE 남은 BGM · Suno 프롬프트 (2026-11-18)

2026-11-18 사용자 결정: **이야기 장면(컷씬)은 음악 없이 둔다.** 직접 넣어 봤더니 안 넣는 게 맞다고 함. 예전 ⑨ 컷씬 배경 곡은 만들지 않는다.

## 지금 연결된 곡 (0.7.35 + 로컬)
| 장면 | 파일 |
|---|---|
| 메인 메뉴·주점 밖 이벤트 | `menu-suno-0632` |
| 일반 대결·오늘의 판 | `table-suno-0631` |
| 여정 지도 (4영역 공통) | `map-suno-0710` |
| 대결 A(ST1)·B(ST4·5)·C(ST7·8)·D(ST2) | `duel-suno-0710`·`duel-b-suno-0726`·`duel-c-suno-0726`·`duel-d-suno-0729` |
| 보스(ST3·6·9)·결전(ST10) | `boss-suno-0725`·`final-suno-0726` |
| 눈길·안개 나루·달빛 등불 주점 | `tavern-suno-0725`·`inn-2-suno-0725`·`inn-3-suno-0725` |
| 미니게임·요트다이스 | `minigame-suno-0729` |
| 결과 화면 | `shuffling-shadows-suno-0729` |
| 일반 엔딩 **·진엔딩(임시로 같은 곡)** | `ending-suno-0726` |

## 공통 설정
- **Instrumental** 켜기, 가사 없음.
- **Exclude styles:** `vocals, lyrics, choir words, EDM, dubstep, trap, modern pop, heavy distortion, synth lead`
- 톤 기준: 지금 쓰는 지도 곡·주점 곡. 중세 판타지 포크, 손그림 카툰 분위기.
- 반복 곡은 2:00~3:00, 끝이 첫 마디로 자연스럽게 이어지게. 한 번 흐르는 곡은 표시한 길이대로.
- 받은 MP3는 Claude가 `public/audio/<장면>-suno-<날짜>.mp3`로 넣고 연결한다(내려받기 파일의 계정 이름 태그는 지운다).

---

## 1순위 · 진엔딩 (2회차 ST10 클리어 · "최초의 승부사" 기록)
한 번 흐르는 곡. 일반 엔딩 곡(바이올린·기타, 따뜻한 마무리)과 구별되게, 비밀이 풀리는 느낌으로 시작해 따뜻하게 끝난다.
```
melancholic revelation theme for a fantasy card game true ending, solo cello opening, music box melody, soft piano, distant wordless choir pad, memory of the first gambler, slow build into a warm major key, hopeful and bittersweet, 66 bpm, 2 minutes 30 seconds, gentle fade out, no loop, instrumental
```

## 2순위 · 스테이지 클리어 팡파르 (짧게 한 번)
스테이지를 이기고 정산 창이 뜰 때 결과 곡 앞에 한 번 울린다. 너무 크거나 길지 않게.
```
short triumphant medieval fanfare for clearing a stage in a cozy fantasy card game, bright brass and timpani hit, quick lute and fiddle flourish, warm and satisfying, 6 seconds, clean ending, no loop, instrumental
```

## 3순위 · 영역별 지도 곡 (선택 · 지금은 한 곡을 4영역이 같이 씀)
철문의 영역(ST1~3 눈 마을)은 지금 지도 곡을 그대로 쓴다. 아래 세 곡을 받으면 영역마다 바꾼다.

- **성화의 영역** (ST4~6 · 물안개 폭포·구름다리·수호자의 회랑)
```
misty waterfall cliffs fantasy exploration map, flowing harp arpeggios, warm low whistle, light hand percussion, distant water, sense of adventure, 96 bpm, seamless loop, instrumental
```
- **열쇠의 영역** (ST7~9 · 달빛 고목·별빛 성소·잿불 제단)
```
moonlit ancient forest fantasy exploration map, celesta, soft strings, wooden flute, mysterious starry night, slow and wondrous, 84 bpm, seamless loop, instrumental
```
- **왕관의 영역** (ST10 직전 · 구름 위 붉은 세계수)
```
sacred approach to a giant red world tree above the clouds, slow strings, soft horns, wind chimes, solemn awe and anticipation, 78 bpm, seamless loop, instrumental
```

---

## 받으면 Claude가 할 일
- 진엔딩: `RpgReworkResult.tsx`의 `endingTrack`에서 2회차일 때만 새 곡.
- 팡파르: 스테이지 클리어 정산이 열릴 때 효과음 볼륨으로 한 번 재생하고, 끝나면 결과 곡이 이어지게.
- 지도: `musicScene`의 `map`을 영역별(`map-2`·`map-3`·`map-4`)로 나눈다. 곡이 없는 영역은 지금 곡 유지.

## 받은 곡 연결 (2026-11-18, 로컬 · 미배포)
| 곡 | 파일 | 길이 | 장면 |
|---|---|---|---|
| 승리 팡파르 | `fanfare-suno-0736.mp3` | 7.5초 | 스토리 ST1~9 클리어 정산이 뜰 때 한 번(효과음 음량). 울리는 동안 배경음은 멈췄다가 이어짐 |
| The Gambler's Last Hand | `true-ending-suno-0736.mp3` | 3:38 | 2회차 진엔딩(`endingTrack`) |
| Misty Waterfall Cliffs | `map-2-suno-0736.mp3` | 3:13 | 성화의 영역 지도 |
| Moonlit Forest Map | `map-3-suno-0736.mp3` | 3:10 | 열쇠의 영역 지도 |
| The World Tree | `map-4-suno-0736.mp3` | 2:36 | 왕관의 영역 지도 |
- Suno 내려받기 파일의 ID3 태그(계정 이름·곡 주소·표지 그림)는 지우고 MPEG 프레임만 남김. 원본은 `artifacts/bgm-2026-11-18/`.
- 소리 크기(RMS 0.11~0.14)는 지금 쓰는 곡들(0.12~0.15)과 비슷. 지도 곡 3개는 끝 0.3초가 거의 무음이라 반복될 때 아주 짧은 쉼이 있음.
- 화면 없는 Edge에서 확인: 지도 1~4영역이 각자 곡으로 바뀜, ST4 클리어 정산에서 팡파르(7.52초) 재생·배경음 멈춤 후 재개. 진엔딩 곡은 파일·연결 코드만 확인(2회차 엔딩까지 직접 듣지 않음).
- 참고: 테스트 모드 "클리어·보상" 바로가기에서는 팡파르 뒤 결과 곡 대신 그 스테이지 대결 곡이 이어진다(바로가기는 결과 화면 준비 상태를 다르게 만든다, 이번 수정 전부터 같음). 실제 대결 끝 정산에서는 결과 곡이 이어지는 구조.
- 테스트: `tests/qa-release-2026-11-18.test.tsx`에 곡 확인 추가, `tests/sound-assets.test.ts`는 효과음 개수를 목록 기준으로. 전체 439개·타입 검사 통과.
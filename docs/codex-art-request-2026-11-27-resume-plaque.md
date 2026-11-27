# Codex 그림 요청 · 2026-11-27 · 이어서 하기 저장 카드

> **완료 · 2026-11-27 적용함.** `ui/resume-plaque-normal-v1`, `ui/fate-gem-small-on-v1`, `ui/fate-gem-small-off-v1` 받아서
> `SinglePlayer.tsx`(SaveFace)와 `resume-plain.css`에 반영. 회색 필터 제거, 배경은 오른쪽 기준(right center)으로 맞춤.

지금은 기존 그림을 빌려 쓰고 있어서 아래 두 가지만 있으면 완성도가 올라간다. 필수 아님, 우선순위 순.
화풍: 기존 스토리 그림(`public/story/*-wide-v1.webp`, `public/ui/settings-header-v1.webp`)과 같은 손그림·따뜻한 촛불 조명. 평면 카툰(`ui/kit/scene-*`) 느낌은 피한다.

## 1. 일반모드 저장 카드 배경 (1장)
- 지금 대신 쓰는 것: `ui/settings-header-v1.webp` (설정 창 머리 그림과 겹침).
- 내용: 밤의 주점, 손때 묻은 나무 탁자 위에 턴테일 패 몇 장과 점수 메모, 촛불. **사람·얼굴 없음.**
- 구도: 가로 3:1(예 1200×400). **왼쪽 45%는 어둡고 비어 있게**(글자·초상이 올라감), 볼거리는 오른쪽.
- 파일: `public/ui/resume-plaque-normal-v1.webp` (+ 원본 png)

## 2. 운명력 보석 작은 아이콘 (2장)
- 지금 대신 쓰는 것: `ui/fate-gem-v1.webp` (큰 그림을 21px로 줄여 씀, 밝은 지도 위에서 흐림).
- 내용: 같은 보라 보석을 **20~24px에서도 읽히게** 굵은 외곽선 + 얇은 금 테두리. 
  - `fate-gem-small-on-v1.webp`: 빛나는 보석
  - `fate-gem-small-off-v1.webp`: 빛이 꺼진 보석(돌처럼 탁한 회색, 같은 모양)
- 크기: 정사각 128×128, 투명 배경, 여백 최소.
- 파일 위치: `public/ui/`

## 받은 뒤 바꿀 곳
- `app/components/SinglePlayer.tsx` `SaveFace`: 일반모드 `--resume-art` 경로, 운명력 `<img src>`(on/off 두 파일로).
- `app/components/resume-plain.css`: `.resume-fate>img.is-spent` 회색 필터 제거.

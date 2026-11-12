# 특별한 이야기 패 4종 · 2026-11-12

> 이후 사용자가 4종을 승인하고 컷씬 적용을 요청했다. 현재 승인 기준은 [관리 문서](story-keepsake-art-guide.md), 후속 로컬 연결·검증은 [컷씬 적용 기록](local-story-keepsakes-scenes-2026-11-12.md)을 따른다. 아래는 앞면 생성 당시의 기록이다.

## 최신 사용자 지시

> 프롤로그의 패와 통일할 필요는 없어. 좀 더 특별한 패의 문양과 그렇게 만들어줘. 다른 패들과는 차별점을 두면서.

기존 색상만 수정하는 방식에서 이야기 패 자체를 새로 디자인하는 방향으로 변경했다. 프롤로그 일반 패의 형태·문양과 통일하지 않는다. 기존 일반 패·컷씬·앞선 생성본은 보존한다.

## 디자인과 납품

- 공통: 상아색 판면, 검은 홈, 낡은 황동 테두리·모서리 고정 장식, 이중 고리 각인, 아래 작은 문양색 인레이. 굵은 손그림 윤곽과 단순한 명암의 2D 카툰 판타지.
- 왕관: 겹쳐진 두 왕관, 마름모 장식, 작은 월계수 / 빨강.
- 철문: 겹친 아치와 봉인 자물쇠가 있는 닫힌 이중문 / 검남색.
- 성화: 서로 엮이는 두 불꽃과 손잡이 달린 의식용 그릇 / 주황.
- 열쇠: 상단 고리가 엮이고 아래 이빨이 좌우로 향한 두 열쇠 / 초록.
- 숫자 2와 문양은 같은 계열 색. 색 코드는 프롬프트 기준이며 명암·질감에 따른 변동이 있다.
- 파일은 모두 1024×1536 PNG + WebP(quality 85, method 6). 기존 파일을 덮어쓰지 않는 `front-special-v1` 파일명.
- 내장 image_gen 사용. 성화를 먼저 생성하고 나머지 3종은 성화의 틀을 참조해 편집했다. 최종 프롬프트 전문·참조·생성 원본 경로는 [manifest.json](../artifacts/story-keepsakes-special-2026-11-12/manifest.json)에 기록.

| 패 | PNG | WebP |
|---|---|---|
| crown | [story-cards/crown-two-front-special-v1.png](../public/story-cards/crown-two-front-special-v1.png) | [WebP](../public/story-cards/crown-two-front-special-v1.webp) |
| iron | [story-cards/iron-gate-two-front-special-v1.png](../public/story-cards/iron-gate-two-front-special-v1.png) | [WebP](../public/story-cards/iron-gate-two-front-special-v1.webp) |
| flame | [story-cards/sacred-flame-two-front-special-v1.png](../public/story-cards/sacred-flame-two-front-special-v1.png) | [WebP](../public/story-cards/sacred-flame-two-front-special-v1.webp) |
| key | [story-cards/secret-key-two-front-special-v1.png](../public/story-cards/secret-key-two-front-special-v1.png) | [WebP](../public/story-cards/secret-key-two-front-special-v1.webp) |

## 이번 검증과 상태

- PNG·WebP 4쌍을 열어 해상도 일치 확인. 한자리 숫자 2·문양색·테두리·중앙 도형 시각 검토.
- [4종 비교 미리보기](../artifacts/story-keepsakes-special-2026-11-12/four-story-tiles-preview.jpg), [패당 120×180 축소 미리보기](../artifacts/story-keepsakes-special-2026-11-12/small-size-preview.jpg), [용량·크기 검증](../artifacts/story-keepsakes-special-2026-11-12/validation.json).
- PC 로컬 `site-publish-checkout/`, git pull --ff-only origin main → Already up to date. 버전 0.7.15 / HEAD 6004cb6.
- 이번 범위는 이야기 패 4종 앞면 디자인. 기존 컷씬에 새 패 합성·뒷면 재디자인·코드 경로 연결은 하지 않았다.
- 로컬 이미지와 기록 저장만 수행. 앱 버전 변경·빌드·커밋·push·배포 없음. 기존 app/page.tsx 및 tests/landscape-stacked.test.ts 미커밋 수정 보존.

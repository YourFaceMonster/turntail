# 손패 GPU 글리치 · backface 단독 비교 준비

사용자 최신 요청은 1번만 우선 적용한 상태에서 원인을 비교하는 것이다. 현재 작업본에는 앞선 요청으로 backface 제거·SVG 회색 면·흐림 CSS 제거가 함께 적용되어 있으므로, 기존 작업을 되돌리지 않고 기준 HEAD에서 격리된 비교를 준비했다.

- 기준 HEAD 0a9a637. artifacts/tile-backface-check-2026-11-06/tile-backface-only.html은 원래 TileFace/StageVisuals를 HEAD 로더로 렌더링하고, 원래 모든 CSS 중 손패 SVG backface 규칙 한 개만 제거한 모드와 수정 전 모드를 전환한다.
- 기본/ST2/ST6/ST10 각12장, 회색/공개/선택 상태 반복 전환, 조건 JSON 저장. 이미지2종을 포함한 약3.35MB 단일 HTML이다. 실제 게임의 React 갱신/레이어 수명을 그대로 재현하는 페이지는 아니다.
- SVG 회색 면 및 전역 filter/opacity 정리는 기존 로컬 수정으로 이미 반영되어 있다. 문양 보호·선택 상태·부모 isolation/contain은 보존한다. 이번에는 추가 translateZ 강제 합성이나 isolation/contain 제거를 하지 않았다.
- 최소 패치는 git apply --cached --check --ignore-space-change로 HEAD 인덱스에 적용 가능함을 확인했다. 검사만 했으며 스테이징하지 않았다. 비교 JS 구문 검사 통과.
- 이번 현재 작업본 손패/스테이지 관련10개 검사 중8개 통과·2개 실패. 실패2개는 이번 HEAD 로더 비교에서도 같은 단언으로 재현: interaction-polish-0650의 문양 color, stage-ui의 뒷면 대비. 로그는 비교 폴더 current-tests.log와 baseline-tests.log.
- Android Chrome 실기기·DevTools Layer borders·간헐적 글리치 해결·회색 톤 시각 비교는 미검증이다. backface 속성과 실제 합성 레이어 생성은 동일한 의미가 아니며 모바일 GPU 원인은 아직 가설이다.

기존 봇/손패/대화창/프롤로그 미커밋 작업과 버전0.6.71은 보존했다. 사용자 요청의 빠른 단독 검증을 먼저 진행하도록 앞선 커밋·업데이트는 보류했다. 이번 빌드·커밋·push·배포 없음.

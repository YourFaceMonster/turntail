# RPG 대사 개선 · 2026-11-04 · 로컬 v0.6.69

## 적용 범위

첨부 지시서의 프롤로그 P05~P08, ST1~3 전후, 모르·피오·세린·도둑·여행자 대사를 기존 UI에 연결했다. ST2 승리 후 4개 대사, ST3 승리 후 5개 대사와 기존 다음 영역 내레이션 2개를 사용한다. 새 배경·캐릭터 이미지·대화창 디자인은 추가하지 않았다. 스토리 전체 감상은 37개 컷 / 216.75초다. 별도의 정적 타이머나 새 연출은 추가하지 않았다.

## 충돌 지시의 최종 결정

첨부 지시서는 도둑 3등도 재도전 가능으로 되어 있었으나, 작업 중 사용자에게 확인한 결과 **이전 합의 유지**를 선택했다.

- 단독 1등: 편지 반환, 이후 모르에게 반환 시 기존 +10주화와 소문 지급.
- 2등·공동 1등(3인 공동 포함): 편지 없음, 재도전 가능.
- 3등: 편지 없음, 재도전 불가, 모르에게 실패를 알리는 대화로 마무리. 본편 진행 가능.
- 패배 시 본편 아이템·주화·HP 차감 없음.
- 2등 대사는 기존 확정본 “아깝네. 한 번 더 해볼 텐가?”를 사용.
- 3등 대사는 기존 확정본 “꼴찌로군. 기회는 끝이야. 이 편지는 내가 갖겠어.”를 사용.
- 모르의 2등 후 격려는 첨부 지시서 문구를 사용. 3등 후에는 아래 실패 마무리를 연결했다.
  - 그랬군. 약속한 승부라면 어쩔 수 없지.
  - 애써 줘서 고맙네. 편지는 내가 다른 길로 알아보겠네.
  - 자네는 가던 길을 계속 가게.
- 앞서 주점에 잘못 적용했던 재도전 제한을 해제. 주점은 순위와 무관하게 다시 겨룰 수 있으며 기존 12/8/4주화 최초 지급·재대결 추가 지급 없음 유지.
- 대결 중단·포기 정책은 보류 상태를 유지했다.

## 상태와 기존 저장

저장 키·저장 버전·읽기/쓰기 경로는 유지한다. 도둑 패배 기록을 위해 기존 letterQuest에 선택적 defeated 플래그와 failed 상태를 추가했다. 기존 저장의 완료된 도둑 승부도 공개 뷰와 시작 검사에서 결과를 계산해 같은 제한을 적용한다. 상대의 비공개 패를 공개 뷰에 전달하지 않는다. 성공·반환 상태에서는 패배 대사를 표시하지 않는다.

일반 전투·직업·스킬·AI·HP·주화 보상 수치·유물 효과·스테이지 조건은 변경하지 않았다. 파수탑, 벽난로, 유물 조합 소문, 야영지, 이끼 돌계단, 2회차 프롤로그와 엔딩 조건은 유지한다. 다른 미커밋 변경도 보존했다.

## 이번 변경 파일

- lib/rpg-prologue.ts: 첫 회차 문양 대사.
- lib/rpg-connection-scenes.ts: ST1~3 대사·화자·기존 마지막 지도 장면 연결.
- lib/rpg-dialogue.ts: 퀘스트·주점 대사와 결과/모르 대사 선택.
- lib/rpg-journey.ts: 도둑 결과·패배 기록·3등 종료, 주점 제한 제거, 기존 저장 결과 해석.
- lib/rpg-items.ts: 기존 공개 뷰에 편지 퀘스트 상태 전달.
- app/components/QuestCutscene.tsx: 필요할 때 줄별 화자 표시(도둑 첫 줄은 내레이션).
- app/components/RpgJourneyScene.tsx: NPC 대사·선택지·기존 결과창의 발화 연결.
- app/components/QuestReplay.tsx: 모르·도둑·여행자 다시 보기 동기화.
- tests/rpg-dialogue.test.tsx: 순위·동점·보상·저장·실패 후 진행 회귀 검사.
- tests/rpg-connection-scenes.test.ts 및 tests/rpg-story-continuity.test.ts: 새 대사 수·재생시간·밀라 자세 컷 기대값 반영.
- tests/rpg-journey.test.tsx: 이전에 잘못 추가한 주점 3등 재도전 차단 검사를 제거.
- docs/tavern-retry-local.md: 이전 기록이 이번 작업으로 대체되었음을 추가.

## 이번 검증

TypeScript: node node_modules/typescript/bin/tsc --noEmit 통과.

다음 9개 파일의 검사 29개 통과:
- tests/rpg-dialogue.test.tsx
- tests/rpg-journey.test.tsx
- tests/rpg-connection-scenes.test.ts
- tests/rpg-story-continuity.test.ts
- tests/rpg-prologue.test.tsx
- tests/blue-glass.test.ts
- tests/rpg-items.test.ts
- tests/rpg.test.ts
- tests/rpg-phase-one.test.ts

별도로 실행한 tests/journey-polish.test.tsx는 3개 통과·1개 실패. 실패는 tavern-motion-wide 클래스 존재 기대값이며 HEAD의 기존 컴포넌트에도 해당 클래스가 없음을 확인했다. 이번 변경에 맞춰 관련 없는 연출이나 기대값을 수정하지 않았다.

대사 데이터·화자·이미지 경로와 결과 UI 정적 렌더링, 실제 승부 종료/보상/저장 복원 흐름을 검사했다. 브라우저에서 모든 대사를 넘기는 조작과 모바일 가로 화면의 잘림은 미검증이다. 별도 정적 전용 타이머도 추가하지 않았다.

버전은 0.6.69 유지. 빌드·업로드·push·커밋은 실행하지 않았다.

## 후속 게시

위 로컬 완료 기록 이후 사용자가 남은 UI 수정·빌드·업로드를 요청했다. 2026-11-04 GitHub·Cloudflare 게시 완료. 후속 변경과 이번 검증은 release-0.6.69-2026-11-04.md 참조.

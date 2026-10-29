# 0.6.48 · 직업 초상화 중간 카툰 톤 — 로컬 미배포

2026-10-29 KST. 사용자가 기존 성인 판타지 초상화와 새로 만든 큰 머리·큰 눈의 귀여운 초상화 사이의 중간 단계를 요청했다. 최종 적용은 **cartoon-v4**다. 미배포 0.6.47의 UI·튜토리얼 수정도 그대로 포함한다. 빌드·커밋·push·원격 저장·사이트 게시하지 않았다. 마지막 공개본은0.6.46 / Sites106, 소스 커밋은 `f252dccdf76dc634cf78c671691fcac3778cb1b1`다.

## 이미지와 반영

검사·도적·성직자·마법사 네 직업을 내장 **image_gen**으로 각각 생성했다. 기존 그림의 성인 모험가 비율과 새 그림의 따뜻한 채색·부드러운 윤곽을 함께 사용했다. 큰 머리와 눈, 동그란 볼의 과장을 줄이며 머리색·직업 색상·장비·정면 구도를 이어갔다.

| 직업 | 실제 적용 파일 |
|---|---|
| 검사 | [swordsman-cartoon-v4.webp](../public/item-battle-v1/professions/swordsman-cartoon-v4.webp) |
| 도적 | [rogue-cartoon-v4.webp](../public/item-battle-v1/professions/rogue-cartoon-v4.webp) |
| 성직자 | [cleric-cartoon-v4.webp](../public/item-battle-v1/professions/cleric-cartoon-v4.webp) |
| 마법사 | [mage-cartoon-v4.webp](../public/item-battle-v1/professions/mage-cartoon-v4.webp) |

실제 직업 선택창과 싱글플레이의 아이템전 미리보기에 함께 연결했다. `lib/profession-art.ts`가 이미지와 얼굴 기준점을 관리하며, 각 그림의 모자·머리카락 높이와 관계없이 얼굴 크기와 눈높이를 맞춘다. 세로 화면의 기준 얼굴 너비는60px다.

기존 v2와 첫 귀여운 v3 파일은 보관했다. 새 PNG 원본은 워크스페이스 `artifacts/profession-cartoon-v4-originals/`에 복사하고, 게임용 WebP로 형식만 변환했다. 4장 모두1024×1536이며 실제 투명 알파가 있다. [최종 원본 경로·전체 프롬프트·참고 이미지·알파·크기 기록](assets/profession-cartoon-v4.json), [보관한 귀여운 v3 생성 기록](assets/profession-cartoon-v3.json).

직업 ID·능력·밸런스·저장 규칙·NPC 아바타 연결은 변경하지 않았다.

## 이번 검증

- 390×844와360×740 로컬 브라우저 세로 화면에서 네 이미지 로드·현재 v4 경로·눈높이와 크기·가로 넘침을 확인했다. 네 직업 선택과 설명 전환도 확인했다. 실제 대전을 새로 시작하지 않았다.
- 싱글플레이 미리보기의 검사·마법사 이미지도 v4 로드 확인.
- 4개 직업×아이템전/RPG 선택창 렌더 검증, 기존 feedback-polish-0645 회귀 검사, 최종 타입 검사와 CSS 구문 파싱 통과. [검사 원문](../../artifacts/checks-0648-midpoint.json).
- 배포·운영 사이트·휴대폰 실기기·인게임 전체를 이번에 검증한 것은 아니다. 앞선0.6.47 검사7개와 과거 AI 모의 대전은 이번에 재실행한 결과와 구분한다.

[직전 UI·튜토리얼 수정](local-0.6.47.md), [현재 소스·자산 해시 및 검증 기록](../../artifacts/validation-0.6.48.json).

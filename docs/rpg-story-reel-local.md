# Continuous RPG story preview · 2026-11-02

The outdoor square remains the ST2 scene. Added one continuous viewing-only reel: original prologue → ST1 PRE/POST → ST2 PRE/POST → ST3 PRE/POST. There are 33 caption blocks and 193 seconds (3:13). This preview contains no battles, settlement, progression mutation or reward callbacks. Finishing or exiting returns to the viewer that opened it.

Access: RPG map → 이야기 다시 보기 → 프롤로그~ST3 전체 이어 보기. The existing `/prologue-preview` page also offers the full reel and retains its prologue-only button. The full reel's exit button explicitly says 전체 감상 종료. Actual gameplay continues to play PRE before entering each battle and POST on normal stage clear before reward selection.

This turn: TypeScript passed; connection/prologue/journey/preview tests 16/16 passed. The new sequence check covers chronological order, unique IDs, total time, automatic completion and duplicate exit suppression. Live browser viewing was not performed. No production build or upload.

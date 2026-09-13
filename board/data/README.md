# web/data — what may be exported here

This directory holds the artifact the public board is built from.
`board.json` is written ONLY by `fantasy_edge.live.board`, which
renders an already-produced slate and never computes a projection.

## The public-exposure rule (UI_SPEC §5, ruled at D-075 point 2)

> **Public-exposure rule**: the file carries DERIVED MODEL OUTPUTS
> ONLY. No raw PFF field, no value traceable to a single PFF column,
> no odds beyond the informational game line already public
> everywhere. `web/data/README.md` states this rule so future
> exporter changes inherit it. The ESPN third-party week-1 page
> (D-074 am. E) never enters this file or the deployed artifact.

**Amendment (D-075 am. A, owner ruled 2026-09-12).** The last
sentence above is amended FOR THE BOARD SURFACE ONLY: a week with no
engine generation — week 1 — exports from the ESPN snapshot with
`run.source = "espn-thirdparty"`, attributed and labelled
third-party, to be removed if ESPN ever objects. The in-repo
placeholder page keeps its original private-use wording. Everything
else in the rule stands unchanged.

## How the rule is enforced in code

Every record in `board.json` is built by an explicit whitelist in
`fantasy_edge/live/board.py` (`PLAYER_KEYS`, `GAME_KEYS`, `RUN_KEYS`,
`PROJ_KEYS`), and each builder raises if the record it produced is not
exactly those keys. No source row is ever copied wholesale into the
output, so a new upstream column — PFF-derived or otherwise — cannot
reach this public file by being added upstream. `board.validate()`
runs before anything is written, and a test asserts the emitted player
keys are exactly the contract's.

Anyone extending the exporter inherits this rule: add a field to the
contract deliberately, in UI_SPEC §5 and in the key tuples, or it does
not ship.

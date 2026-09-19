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

## The Lab file (m4.4L, PLAYER_BREAKDOWN_SPEC amendment)

`lab.json` is the second file in this directory. It is written ONLY by
`fantasy_edge.live.lab` — never by the board exporter, which refuses
that path by name — and it feeds `web/lab/`, the DESIGN SANDBOX on
live engine data. It carries ONE game of the current run: every
player's projected means and five-point ranges (read off the same
archived grids the board reads), the context that generation ran in
(opponent, kickoff, the T-90 designation and trend the eligible set
consumed, the market snapshot the forecast read), the tangible chain
from `live_explain_rows` for that generation with each element's own
truthful label and, where the generation carried no object, its stored
reason; the ceiling probability from `live_ceiling_probs` when a row
exists; and each stat's mean from the WEEK'S FIRST generation beside
the current one, so a reader can see what moved.

**THE SAME PUBLIC-EXPOSURE RULE, WORD FOR WORD.** `web/lab/` deploys
inside the board's own mirror, so the lab file is as public as the
board file: derived model outputs only, no raw PFF field, no value
traceable to a single PFF column, no odds beyond the informational
game line, no fantasy points. Every record in it is built by explicit
whitelist (`LAB_PLAYER_KEYS`, `LAB_RUN_KEYS`, `LAB_ELEMENT_KEYS`) and
`lab.validate()` runs before anything is written, exactly as here.

**THE ONE DIFFERENCE IS CHURN.** The lab contract is DECLARED
CHURN-TOLERANT: `lab_schema` ("lab-1") names the iteration, and the
shape may change freely as the design is worked on, with its tests
updated in the same PR. `board.json` is unaffected by any of it — the
board contract stays ceremonial and is never edited to suit the lab.

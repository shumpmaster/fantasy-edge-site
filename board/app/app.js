/* U1 — THE APP SHELL, and U2 — THE HOME MATCHUP TABLE.
 *
 * ...and, by increment: U3 the Bets side, U3c the picture capture, U4
 * the live board, U5 the two Fantasy sub-views, and now U6 and U7 —
 * THE READ SHEET and THE PROJECTIONS MERGE (UI_ALPHA_SPEC sec 6d and
 * sec 6e). Two things arrive with them, and both are the same rule
 * this file has kept from its first line:
 *
 *   THE READ SHEET SAVES A REAL READ AND MOCKS NOTHING. "+ Add your
 *   read" opens the handoff's sec 5.6 sheet on the pick it was tapped
 *   from; Say it posts to the live service, which interprets,
 *   validates and BANKS the read before it answers; Confirm shows his
 *   own words back as chips he can drop, never a category and never a
 *   node path (the reads brief's Addendum 2, as sec 1 reconciles it).
 *   THE THIRD STEP IS NOT DRAWN. "Your number" is the effect
 *   library's, it does not exist, and a greyed step marker or a
 *   skeleton bar promising it would be the fake this whole surface
 *   refuses to draw.
 *
 *   THE PROJECTIONS TAB READS THE WHOLE-SLATE PROJECTIONS FILE. The
 *   placeholder is gone — deleted, not reworded — and what stands
 *   there is the lab's own player breakdown, over every game of the
 *   week: the results table, the likeliness line and the chain of
 *   elements, under sec 3's system, with the shared statline, the
 *   home game switcher and this app's search idiom. Every honesty
 *   rule the design surface enforces came with it: stored numbers
 *   only, absences named with the generation's own reason, and a
 *   strip that draws nothing rather than assert a spread nobody
 *   produced. The design surface itself is untouched, keeps its
 *   one-game file and stays live.
 *
 * docs/plan/UI_ALPHA_SPEC.md, realising
 * docs/design/FANTASY_EDGE_UI_HANDOFF.md: the tab bar (sec 2.2), the
 * per-tab stacks (sec 2.3), the + sheet (sec 2.4), the transition set
 * (sec 2.5), the hero (sec 5.1) and the Projections placeholder (sec
 * 5.3) came in with U1; U2 makes the HOME screen real — the game
 * switcher and its search, the game line strip, the five views, the
 * mirrored seven-row table and the expanded rows, all read off
 * `web/data/slate.json`, which `fantasy_edge.live.slate` writes.
 *
 * THE LAB'S IDIOMS, KEPT. Vanilla, no framework, no build step, no
 * module: the directory that is served is the directory that is
 * written. Sentinel constants for every word the reader must see.
 * `esc()` on every value that reaches the page. Honest arms — a cell
 * with no number says so with a dash and a footnote that names the
 * reason, rather than drawing a plausible number nobody computed.
 *
 * WHAT THIS FILE COMPUTES, AND WHAT IT ONLY DRAWS.
 *
 *   IT COMPUTES ONE THING THAT IS A DISPLAY RULE, and that is the
 *   whole of it: the sec 7.3 GAP THRESHOLD. The exporter ships
 *   `gap_pts` and says nothing about whether it is an edge; this file
 *   draws the arrow and the tint at GAP_MIN and a grey dash below it,
 *   because that is a decision about a screen and it belongs where it
 *   can be checked against the screen. Everything else on the page is
 *   a STORED NUMBER FORMATTED — no probability is derived here, no
 *   projection is summed here, and no range is invented for a column
 *   the exporter left null.
 *
 *   IT READS ONE DOCUMENT. `slate.json` in real mode, the bundled
 *   fixture behind `?demo=1`, and nothing else. The document either
 *   arrives or it does not; there is no third state and no cached
 *   yesterday.
 *
 *   IT STORES NOTHING. Not a key, not a token, not a preference. The
 *   Bets sub-view, the open row and the chosen view are remembered
 *   for the visit (sec 2.3) and the visit is all they are remembered
 *   for; nothing here is written to the reader's browser.
 *
 * THE NAVIGATION MODEL (sec 2.3) IS U1'S AND IS UNCHANGED. Each tab
 * owns a STACK. Tapping a tab resets that tab to its root. Detail
 * screens PUSH onto the current tab's stack and the back chevron
 * POPS. The Bets tab remembers which of Screen and Live was last
 * used, and the Screen | Live toggle SWAPS the Bets root without
 * pushing anything. The hash is the address of whatever is on top, so
 * the browser's own back button pops the same stack the chevron does.
 */
"use strict";

/* ------------------------------------------------------------------
 * THE SENTINELS — every word on the screen that is a promise
 * ------------------------------------------------------------------ */

/* THE EARLY-ACCESS LINE. The same promise the alpha line always made,
 * said the way a reader says it (UI_ALPHA_SPEC sec 7): the numbers are
 * the engine's real output, and the interface around them is not
 * finished. The ledger code comes OFF the screen — the ruling still
 * governs the sentence, it just no longer recites its own number at a
 * reader who has no way to look it up. It rides `index.html` too, so
 * it is on the page before this script runs, and a test asserts the
 * two are the same string. Its wording is fixed by sec 7 and may be
 * changed only where that section is rewritten — never softened. */
const ALPHA_NOTE =
  "EARLY ACCESS — the numbers are real; the design is still being finished.";

/* The sec 5.1 tag. It LABELS FIXTURES, so it comes off the hero the
 * moment a real slate.json is on screen: real data is real, and a tag
 * that says otherwise would be the one dishonest thing on a page whose
 * whole point is that its numbers are the engine's. It stays in demo
 * mode, where the document IS fabricated, and it stays wherever the
 * shell is still drawing its U3-U6 fixtures. The ALPHA line below it
 * never comes off — that is a statement about the INTERFACE, which is
 * unfinished whatever the data is. */
const SAMPLE_TAG = "Sample data";

const WORDMARK = "Fantasy Edge";

/* Section titles, sec 2.1 and sec 5. */
const TITLE_FANTASY = "Fantasy";
const TITLE_PROJECTIONS = "Projections";
const TITLE_BETS = "Bets";
const TITLE_PICK = "Pick";
const TITLE_TRACK = "Track a slip";
const TITLE_LIVE_CARD = "Live";
const TITLE_REPORT = "Read report";
const TITLE_TEAM = "My team";

/* sec 5.3's placeholder is GONE, and gone rather than reworded (the
 * U5 rule). "Coming in the merge", "Your sandbox projections plug in
 * here." and the line under them were a promise about a screen that
 * did not exist; U7 is that merge, the screen exists, and a promise a
 * screen no longer needs to make is a promise it should not be
 * making. What the tab draws now is in the sec 6e block below. */

/* sec 2.4, the three + actions. */
const ADD_TITLE = "Add";
const ADD_READ = "Add your read";
const ADD_READ_SUB = "Say what you know about a player or line";
const ADD_SLIP = "Track a slip";
const ADD_SLIP_SUB = "Paste or screenshot a bet you placed";
const ADD_STARTSIT = "Check a start/sit";
const ADD_STARTSIT_SUB = "Compare two players for your lineup";

/* The honest arms. Each stub names the increment that fills it, so
 * nothing on this surface pretends to be finished.
 *
 * "Saving your own read is still being built" is GONE, the U5 way:
 * U6 built the sheet, so the admission would now be false, and a
 * false admission is worse than none. What the + menu says instead is
 * not a stub at all — it is a fact about what a read IS. A read is
 * about a player and a line, and the + menu can be tapped from
 * anywhere, so when there is no pick to attach one to it says so and
 * offers the way there. */
const READ_NEEDS_PICK =
  "A read is about one player and one line, so open a pick first and add it there.";
const ACTION_OPEN_PICK = "Open the pick";
const NOTE_ALERTS = "Alerts are not built yet. We have not decided which events should notify you.";
const STUB_REPORT = "The graded report on your reads is still being built.";
/* The two Fantasy sub-views were stubs until U5 and are not any more,
 * so their stub sentences are GONE rather than left behind: a promise
 * a screen no longer needs to make is a promise it should not be
 * making. Both sub-views now draw what they have and simply do not
 * draw what they do not — the credibility rule, which is why there is
 * no "coming soon" left on either of them. */
const STUB_STARTSIT = "Fantasy is here; the start/sit comparison is still being built.";
const SLATE_HEADER = "This week's lines";
const SLATE_BASIS = "our numbers vs fair market odds";
const LIVE_OVERLINE = "Closest to hitting";
const PICKS_OVERLINE = "Saved and placed";

/* ------------------------------------------------------------------
 * U3 — THE BETS SIDE'S OWN WORDS
 * ------------------------------------------------------------------
 * Every sentence a reader sees on the Screen list, the Pick card,
 * Track a slip and My picks is a constant here, for the reason the
 * rest of this file keeps them: a promise made in an expression is a
 * promise nobody can grep for. */

/* sec 5.4, the sort. Both of these read a number the exporter
 * published — `gap_pts` and `model_p` — and neither computes one. */
const SORT_GAP = "gap";
const SORT_CHANCE = "chance";
const SORTS = [[SORT_GAP, "Biggest gap"], [SORT_CHANCE, "Model chance"]];
const SORT_GROUP_LABEL = "Sort";

/* sec 5.4's gap text, and the sec 7.3 arm beside it. */
const GAP_VS = " vs the market";
const NO_REAL_GAP = "No real gap";

/* ...and what "vs the market" MEANS, said once on each surface the
 * phrase appears on (UI_ALPHA_SPEC sec 7). A number with a unit the
 * reader cannot name is a number he cannot use. */
const GAP_FOOTNOTE =
  "How far our number is from the fair market chance, in percentage points.";

/* UI_ALPHA_SPEC sec 5's two sentences, verbatim. The first rides
 * every blind-spot row, card and leg; the second heads the band they
 * are sorted into on the Biggest-gap view. They are OUR admission
 * about OUR model, so they are written once and said the same way
 * everywhere the reader can meet one. */
const BLIND_SPOT_NOTE =
  "a gap this size is usually our blind spot, not an edge";
const BLIND_SPOT_DIVIDER = "Probably our blind spots, not edges";

/* THE THREE PIECES OF ARITHMETIC THIS PAGE IS ALLOWED TO DO, named on
 * screen wherever their answer appears (UI_ALPHA_SPEC sec 4). Nothing
 * else here is computed: every other number is read off the exporter's
 * document or off the service's stored row. */
const CLIENT_GAP_RULE =
  "Shown only when our number beats the fair market chance by 3 points or more. That cut-off is this page's own rule, applied to a gap the file already published; anything smaller shows a dash.";
const CLIENT_BREAK_EVEN_NOTE =
  "Break-even is 1 divided by the payout multiple you entered — this page's own division, and the only thing it works out about the price.";
const CLIENT_PREVIEW_NOTE =
  "Preview only: this page multiplies the published chance of each leg together. When you save the slip the service works out the number and stores it, and that is the one you will see afterwards.";

/* D-123, and it rides every screen a product appears on. */
const INDEPENDENCE_NOTE =
  "Assumes the legs are independent. Legs that tend to hit or miss together are not modelled yet.";

/* sec 5.5, the Pick card. */
const PICK_WATCH_ADD = "Save to watchlist";
const PICK_WATCH_REMOVE = "Remove from watchlist";
const PICK_WATCH_SAVED = "Saved to your watchlist.";
const PICK_WATCH_GONE = "Removed from your watchlist.";
const PICK_COPY = "Copy pick to place it";
const PICK_COPIED = "Copied. Place it in your app, then bring the slip back.";
const PICK_PLACED = "I placed it";
const PICK_IMPLIES = "What the line implies";
const PICK_SHAPE = "Outcome chart";
const PICK_BAND = "Likely outcomes";
const PICK_BARS = "Chance";
const PICK_MODEL = "Model";
const PICK_MARKET = "Market, fair odds";
const PICK_CONTEXT = "Context";
/* The three marks on the range, in the words sec 7 sets for them. They
 * are the 10th, 50th and 90th percentile of the stat's own outcomes —
 * which is what "low end", "middle" and "high end" say to a reader who
 * has never met a percentile. Nothing about the numbers changed. */
const PICK_FLOOR = "Low end";
const PICK_MEDIAN = "Middle";
const PICK_CEILING = "High end";
const PICK_NO_PROP = "This player has no captured line this week, so there is no pick card to draw and nothing is invented in its place.";
const PICK_OTHER_MARKETS = "Other lines for him";

/* The read bar, and since U6 it opens the sheet it always named. The
 * sentence that used to stand in for the sheet is gone rather than
 * reworded, for the reason the Fantasy stubs went at U5. */
const ADD_READ_BUTTON = "+ Add your read";

/* ------------------------------------------------------------------
 * U6 — THE READ SHEET (UI_ALPHA_SPEC sec 6d, handoff sec 5.6)
 * ------------------------------------------------------------------
 * TWO STEPS, AND THE THIRD IS NOT DRAWN. The handoff's sheet has
 * three: Say it, Confirm, Your number. Your number is the effect
 * library's — a read probability, a "what moved it" list and a
 * reverse-mode sentence, none of which exists yet — so it is NOT
 * MOCKED, NOT SKELETONED and NOT PROMISED by a third step marker. The
 * step strip names the two steps this sheet has, and the sheet ends
 * at Confirm.
 *
 * THE CHIPS ARE HIS OWN WORDS. The handoff draws claim chips carrying
 * hierarchy paths; Addendum 2 of the reads brief is a governance
 * ruling that the taxonomy is invisible, and UI_ALPHA_SPEC sec 1
 * records the reconciliation: the chips render THE USER'S OWN TEXT
 * SPANS, with Drop and Add, and never a node path or a category name.
 * The service sends nothing else, so there is nothing else to draw.
 *
 * AND NOTHING SAYS "+0". Addendum 2's second ruling retires the
 * zero-effect display case outright: no read shows "no effect in the
 * data yet", because R0 shows no effect at all. The one sentence this
 * sheet can honestly say about a saved read is R0's own, which is
 * what the toast says. */
const READ_TITLE = "Your read";
const READ_STEP_SAY = "Say it";
const READ_STEP_CONFIRM = "Confirm";
const READ_HINT = "Say it your way. We'll work out how much it matters.";
const READ_PLACEHOLDER = "What do you know about this player?";
const READ_GO = "Read it";
const READ_BUSY = "Reading…";
const READ_AGAIN = "Read it again";
const READ_UNDERSTOOD = "Here's what we understood";
const READ_CHIPS_NOTE =
  "These are your own words, as we picked them up. Drop anything that isn't part of your read.";
const READ_DROP = "Drop";
const READ_ADD = "Add";
const READ_DROPPED = "Dropped";
const READ_EDIT = "Edit";
const READ_LOOKS_RIGHT = "Looks right";
const READ_CHANGED_NOTE =
  "You changed what you said, so it has to be read again before it counts.";
const READ_WOULD_READ = "This is what we would read:";
const READ_BANKED_NOTE =
  "Your words are saved already. Reading them again saves the shorter version beside them; nothing you wrote is thrown away.";
const READ_NOTHING_FOUND =
  "We could not match that to anything we track yet. It is saved, and it will be graded like everything else.";
const READ_EMPTY = "There is nothing to read yet. Say what you know first.";
const READ_SAVED_TOAST = "Saved. We'll grade it after the game.";
const READ_OFFLINE =
  "The service is not answering, so nothing was read and nothing was saved. Your words are still in the box.";
const READ_DEMO =
  "Sample data — a fabricated slate does not write to the real service, so nothing is saved from here.";
const READ_NO_PICK =
  "A read is about one player and one line, and this sheet was opened without one.";
/* THE CONNECT STATE IS MY PICKS', and it is the same state: the same
 * heading, the same button, the same promise that nothing is kept in
 * this browser instead. What is said in between names what THIS
 * sheet would store, because a sentence about a watchlist on a read
 * sheet would be true of the service and wrong about the screen. */
const READ_CONNECT_BODY =
  "Your reads are stored by the service, not in this browser. Paste the token and this sheet can save one; without it there is nowhere for a read to go and nothing is kept here instead.";

/* The deferrals, each named where it would have been. */
const DEFER_MATCHUP =
  "The matchup tile is on hold: its coverage rates and cornerback grades come from Pro Football Focus data, and each one needs its own sign-off before it can appear here.";

/* ------------------------------------------------------------------
 * sec 6a — READING A PICTURE
 * ------------------------------------------------------------------
 * THE ONE SENTENCE THIS WHOLE FEATURE STANDS ON, and it is on both
 * screens that use it: we read the picture, the reader confirms what
 * is right, and nothing is saved until he does. The picture is sent
 * to the service, read once and kept nowhere — not by the service and
 * not by this page. */
const SHOT_PROMISE =
  "We read the picture; you confirm what's right. Nothing is saved until you do.";
const SHOT_LABEL = "Screenshot";
const SHOT_PICK = "Choose a picture";
const SHOT_PICK_AGAIN = "Choose a different picture";
const SHOT_READ_SLIP = "Read the slip";
const SHOT_READ_TEAM = "Read the picture";
const SHOT_BUSY = "Reading the picture…";
const SHOT_EMPTY = "No picture chosen yet.";
const SHOT_PREVIEW = "The picture you chose";
const SHOT_TOO_BIG =
  "That picture is too large to send, so it was not sent. Take a plain screenshot rather than a full-resolution photo and try again.";
const SHOT_WRONG_KIND =
  "That file is not a picture we can read. A PNG, JPG, WEBP or GIF screenshot works.";
const SHOT_FAILED =
  "We could not read that picture. Nothing was saved. Type the legs in by hand, or try a clearer picture.";
const SHOT_NOTHING_FOUND =
  "We did not find anything we could read on that picture. Nothing was saved. Type it in by hand, or try a clearer picture.";
const SHOT_READ_DONE =
  "Read. Check every row before you save — these are our best reading of the picture, not your bet yet.";
const SHOT_LOCAL_NOTE =
  "The picture is sent to your service to be read and is not kept — not there, and not in this browser.";

/* sec 6a's second door: the Fantasy tab's team capture. */
const TEAM_ENTRY = "Add my team from a picture";
const TEAM_ENTRY_SUB =
  "A screenshot of your lineup becomes your team here. You confirm every row before anything is saved.";
const TEAM_CONFIRM_HEAD = "Check your lineup";
const TEAM_CONFIRM_BODY =
  "Every row below is our reading of the picture. Fix what is wrong, take off what is not yours, then save.";
const TEAM_SLOTS = "Your slots";
const TEAM_SLOT_LABEL = "Slot";
const TEAM_MATCHED = "Matched";
const TEAM_UNMATCHED = "Not matched";
const TEAM_UNMATCHED_NOTE =
  "We could not match these names to a player we know, so nothing was filled in for them. Type the name yourself, or leave the row off your team.";
const TEAM_KIND_LABEL = "Which team is this?";
const TEAM_KIND_SEASON = "Season long";
const TEAM_KIND_DFS = "DFS entry";
const TEAM_SAVE = "Save my team";
const TEAM_SAVED = "Saved. This is your team from now on.";
const TEAM_DROP = "Remove";
const TEAM_EMPTY =
  "No lineup read yet. Choose a picture of your lineup and we will read it.";
const TEAM_NOTHING_TO_SAVE =
  "Every row was removed, so there is no team to save.";
const TEAM_SALARY = "Salary";
const TEAM_CURRENT = "Your team now";
const TEAM_NONE_YET =
  "No team saved yet. Add one from a picture of your lineup.";
/* sec 8a: the team card's OWN connect line. It used to borrow the
 * picks service's, which talks about a watchlist and slips — the
 * right facts under the wrong heading. Same service, same token, the
 * subject of the sentence corrected. */
const TEAM_CONNECT =
  "Paste the token and your saved team appears. Teams are kept by the service, not in this browser.";
const TEAM_FROM = "Read from ";

/* sec 5.7, Track a slip. */
const TRACK_PASTE = "Paste";
const TRACK_MANUAL = "Manual";
const TRACK_INPUT_LABEL = "How the slip arrives";
const TRACK_PLACEHOLDER = "Paste the slip's text";
const TRACK_PARSE = "Match the legs";
const TRACK_ADD_LEG = "Add a leg";
const TRACK_LEGS = "Matched legs";
const TRACK_UNPARSED = "Not matched";
const TRACK_UNPARSED_NOTE =
  "These lines were not understood, so nothing was guessed from them. Add them by hand or leave them off the slip.";
const TRACK_SAME_LINE = "Same line you screened";
const TRACK_MOVED_TO = "Moved your way";
const TRACK_MOVED_AGAINST = "Moved against you";
const TRACK_OFF_LADDER = "We published no chance at this line, so none is shown";
const TRACK_UNMATCHED_LEG = "Not from your screen";
const TRACK_PAYOUT = "Payout multiple";
const TRACK_STAKE = "Stake";
const TRACK_VERDICT = "The slip, honestly";
const TRACK_ALL_HIT = "Model chance all legs hit";
const TRACK_BREAK_EVEN = "Break-even at this payout";
const TRACK_SAVE = "Track this slip";
const TRACK_SAVED = "Slip tracked. It is in My picks.";
const TRACK_WORST = "Moved most: ";
const TRACK_EMPTY =
  "Nothing is matched yet. Paste the slip's text, or add a leg by hand.";
const TRACK_BIGGER = "Worth taking at this payout, on these numbers.";
const TRACK_SMALLER = "Not worth taking at this payout, on these numbers.";
const TRACK_NO_VERDICT =
  "No verdict: a leg carries no published chance, so there is no product to take.";

/* sec 5.4's My picks segment (the owner's third). */
const TRACK_MANUAL_HINT = "e.g. D. Hale more 5.5 receptions";
const STORED_BY_SERVICE =
  "These two numbers were computed and stored by the service when the slip was saved; this page is reading them back.";
const NO_CAPTURED_ROWS =
  "No bookmaker line was saved for this slate, so there is nothing to screen. That means we saved none — not that the week is empty.";
const PICKS_WATCH = "Watchlist";
const PICKS_SLIPS = "Tracked slips";
const PICKS_EMPTY_WATCH = "Your watchlist is empty. Tap the bookmark on any pick to save it here.";
const PICKS_EMPTY_SLIPS = "No slips yet. Paste one in Track a slip and it appears here.";
const PICKS_REMOVE = "Remove";

/* THE CONNECT STATE. Without a token there is nowhere for a watchlist
 * or a slip to live, and this page does not pretend otherwise: it
 * says so and offers to take the token, exactly as the lab's reads
 * box does (R0's idiom). Nothing is kept locally as a stand-in. */
const CONNECT_HEAD = "Your picks live on your own service.";
const CONNECT_BODY =
  "Paste the token and your picks appear. Your watchlist and slips are stored by the service, not in this browser, and nothing is kept here instead.";
const CONNECT_BUTTON = "Paste the token";
const CONNECT_PROMPT =
  "Paste your token. It stays in this browser and goes only to your own service.";
const SERVICE_OFFLINE =
  "Your service is not answering right now, so nothing is shown. Nothing was lost — try again in a moment.";
const SERVICE_DEMO =
  "Sample data — a fabricated slate does not write to the real service, so the watchlist and the slips are read-only here.";

/* ------------------------------------------------------------------
 * U4 — BETS -> LIVE (UI_ALPHA_SPEC sec 6b, handoff sec 5.8 / 5.9)
 * ------------------------------------------------------------------
 * THE LAB'S RULE, PORTED WHOLE: this page renders stored numbers and
 * works none out. The service computes every chance, every band,
 * every state and every "needs N" and hands them over; what happens
 * here is the same two kinds of arithmetic the lab allows —
 *
 *   1. GEOMETRY. A stored `t` over the axis the answer declares, and
 *      a stored chance over the height of a box. It produces no
 *      quantity and is never shown as a number.
 *   2. PRESENTATION ROUNDING. 0.74 printed as "74%", a stored band
 *      printed as "74–81".
 *
 * There is NO THRESHOLD IN THIS FILE. Alive, Heating, Hit and Long
 * shot are read off `state` as the service sends them; the two
 * cut-offs behind them live on the service side, in one place
 * (`ops/reads_service/live.py`), exactly as the lab keeps them in the
 * document that authored them.
 *
 * AND THE SERIES IS ACCUMULATED, NEVER INVENTED. Each answer carries
 * the bet's own points — the chance before kickoff and the chance
 * now. This page appends the new one to the ones it was already
 * handed, so the line grows as the game does; nothing is
 * interpolated between two polls and nothing is carried past the last
 * one (honesty rule 7: stale data freezes). */

/* The cadence, and it is the SERVICE'S: `poll_interval_s` rides every
 * answer (the ruled upper bound on how often this page may ask)
 * and this is only the fallback before the first answer. */
const LIVE_POLL_MS = 60000;

/* Said under the list, so the reader knows what the screen is doing
 * and what it stops doing when he leaves it. */
const LIVE_POLL_NOTE =
  "This screen asks the service for new numbers about once a minute while it is open, and stops asking the moment you leave it.";

const LIVE_SERVICE_NOTE =
  "Every chance here was worked out by the service from what has actually happened in the game so far; this screen only draws them.";

const LIVE_CONNECT_HEAD = "Your live board needs your token.";
const LIVE_CONNECT_BODY =
  "Paste the token and your live bets appear. The chances come from your service, not this browser, so nothing is guessed at here.";
const LIVE_OFFLINE =
  "Your service is not answering right now, so no live chance is shown. The numbers you last saw are not carried forward.";
const LIVE_EMPTY =
  "Nothing is live yet. Bets you track show up here at kickoff.";
const LIVE_NO_SLATE =
  "This week's games have not loaded yet, so there is nothing to follow. Try again in a moment.";

/* The state's own word, so colour is never the only signal. The map
 * is the lab's, in the handoff's wording: a cashed bet reads "Hit" on
 * this surface (sec 5.8's chip set). */
const LIVE_STATE_WORDS = {
  pregame: "Pregame",
  alive: "Alive",
  heating: "Heating",
  long_shot: "Long shot",
  cashed: "Hit",
  lost: "Lost"
};

/* ...and the tone each one is drawn in (sec 3.1's live mapping:
 * alive slate, heating amber, hit positive, everything else muted). */
const LIVE_STATE_TONE = {
  pregame: "muted",
  alive: "read",
  heating: "heating",
  long_shot: "muted",
  cashed: "positive",
  lost: "muted"
};

const LIVE_NEEDS = "Needs ";
const LIVE_HIT_WORD = "Hit";
const LIVE_SETTLED = "Settled";
const LIVE_RANGE = "range ";
const LIVE_PREGAME_CHANCE = "Chance before kickoff";
const LIVE_SINCE_KICKOFF = " since kickoff";
const LIVE_CHART_LIVE = "Live chance";
const LIVE_CHART_DONE = "Chance";
const LIVE_DASHED_NOTE = "Dashed line = the chance before kickoff.";
const LIVE_SWINGS = "What moved it";
const LIVE_SUMMARY_HEAD = "Banked so far, beside what we projected";

/* The statline's two column heads when it carries banked values. The
 * projected one is the home table's own sentinel, reused rather than
 * re-spelled: it is the same column. */
const BANKED_HEAD = "NOW";
const LIVE_COUNTS = " live";
const LIVE_COUNTS_HIT = " hit";
const LIVE_OPEN = "Open the live card";
const LIVE_UPDATED = "Updated ";
const LIVE_UPDATED_TAIL = " ago";
const LIVE_FRESH = "Updated just now";

/* The card's sparkline and chart, in the handoff's own sizes. */
const LIVE_SPARK_W = 96;
const LIVE_SPARK_H = 32;
const LIVE_CHART_W = 320;
const LIVE_CHART_H = 168;
const LIVE_CHART_PAD = 10;
const LIVE_FULL_GAME_S = 3600;
const LIVE_QUARTER_S = 900;

/* ------------------------------------------------------------------
 * U5 — FANTASY: SEASON LONG (UI_ALPHA_SPEC sec 6c, handoff sec 5.2)
 * ------------------------------------------------------------------
 * THE CREDIBILITY RULE GOVERNS THIS WHOLE SCREEN. A capability we do
 * not have is NOT SHOWN: there is no greyed-out win chance, no "we
 * don't know yet", no apology. The opponent side of the matchup card
 * exists when an opponent lineup has been captured and does not exist
 * when one has not, and the FLEX section exists when a bench was
 * captured and does not exist when one was not. */

const LINEUP_HEAD = "Your lineup";
const LINEUP_SLOT = "SLOT";
const LINEUP_PLAYER = "PLAYER";
const LINEUP_RANGE = "RANGE";
const LINEUP_PROJ = "PROJ";
const LINEUP_OFF_SLATE =
  "He is not on this week's slate, so we have no projection for him. His name is the one your picture showed.";

/* THE TOTAL, AND WHAT IT IS. Sec 6c: "the sum of the lineup's
 * projections, its basis said in one plain sentence". It is the one
 * piece of arithmetic this screen does, so it says so. */
const TEAM_TOTAL = "Our projected total";
const TEAM_TOTAL_BASIS =
  "Added up from the lineup below, one player at a time. It is half-PPR scoring, and it does not yet subtract fumbles or interceptions, so a passer's share of it is high by whatever his interceptions would have cost.";
const TEAM_TOTAL_SKIPPED =
  "Left out of the total, because we have no projection for them: ";

/* THE OPPONENT. One door, and it is the U3c capture flow with the
 * side marker set — the same picture, the same confirm screen, the
 * same append-only store. */
const OPP_ENTRY = "Add opponent from a picture";
const OPP_ENTRY_SUB =
  "A picture of his lineup. Nothing is saved until you have checked it, exactly as with your own.";
const OPP_TOTAL = "His projected total";
const OPP_KIND_LABEL = "Whose lineup is this?";
const OPP_SIDE_MINE = "Mine";
const OPP_SIDE_THEIRS = "My opponent's";

/* THE COMPARISON, AND WHAT IT IS NOT. Sec 6c is explicit: a joint win
 * chance is NOT invented from independent per-player ranges. So the
 * card compares the two totals and names exactly what it compared. */
const COMPARE_HEAD = "What this compares";
const COMPARE_NOTE =
  "Projected totals, added player by player. It is not a chance of winning: working one out means modelling every player's game together, and that is not built yet.";
const COMPARE_AHEAD = "Ahead by ";
const COMPARE_BEHIND = "Behind by ";
const COMPARE_LEVEL = "Level on projected totals.";
const COMPARE_POINTS = " points";

/* SEC 5.2's FLEX call. Two cards, the captured one and the best
 * captured bench alternative; the swap moves the total and says so. */
const FLEX_HEAD = "The FLEX call";
const FLEX_IN = "In your lineup";
const FLEX_BENCH = "On your bench";
const FLEX_SWAP = "Start him instead";
const FLEX_SWAPPED = "Swapped. The total above has moved.";
const FLEX_BACK = "Put your captured lineup back";
const FLEX_BASIS =
  "Both numbers are the same half-PPR projection the table above draws. Nothing here is a recommendation.";

/* The FLEX slot as a lineup prints it, and the positions a FLEX may
 * be filled from. Both are the LEAGUE'S vocabulary, not ours, which
 * is why they are matched loosely against whatever the picture said. */
const FLEX_LABELS = ["FLEX", "W/R/T", "W/R", "WRT", "RB/WR/TE"];
const FLEX_POSITIONS = ["RB", "WR", "TE"];
const BENCH_LABELS = ["BN", "BE", "BENCH", "RES", "IR", "TAXI"];

/* ------------------------------------------------------------------
 * U5 — FANTASY: DFS (UI_ALPHA_SPEC sec 6c)
 * ------------------------------------------------------------------
 * The sheet the shape lineage already builds, restyled. EVERY string
 * in the three tables came off that sheet: this file supplies the
 * headings and the layout and not one fact. */

const DFS_TITLES = {
  stacks: "Stacks",
  players: "Where we differ from the crowd",
  boom_proxy: "The high-end stand-in"
};
const DFS_COLUMNS = "What each column is";
const DFS_EVIDENCE = "What the labels mean";
const DFS_SHOWING = "Showing the first ";
const DFS_OF = " of ";
const DFS_SHOWING_TAIL =
  " rows, in the sheet's own order. Nothing is re-sorted and nothing is dropped from the middle.";
const DFS_FOOTER_HEAD = "About this sheet";
const DFS_ENTRY_HEAD = "Your DraftKings entry";
const DFS_ENTRY_OWN = "Owned";
const DFS_ENTRY_PROJ = "Proj";
const DFS_OFFLINE_HEAD = "The DFS sheet hasn't loaded.";
const DFS_OFFLINE_BODY =
  "This view reads one file the weekly sheet is turned into on each deploy. It isn't here right now, so there is nothing true to draw and nothing is being guessed at.";
const DFS_OFFLINE_SCHEMA =
  "The DFS file that loaded is a shape this build does not know, so none of it is drawn. That is a deliberate refusal, not a failure to try.";
const DFS_UNDER_OWNED = "Both legs under-owned";

/* THE GROUP A GAME IS IN, in words. `spreadT2|totalT3` is a key the
 * sheet writes for a machine; the thirds it names are a fact a reader
 * can have, so they are spelled out here and the key stays in the
 * document exactly as it is (sec 7's mechanism: display strings live
 * apart from data keys). A label this pattern does not recognise is
 * drawn as it came, because a bucket we cannot read is not a bucket
 * we may rename. */
const BUCKET_THIRDS = ["bottom third", "middle third", "top third"];
const BUCKET_SPREAD = " by spread";
const BUCKET_TOTAL = " by total";
const DFS_STACK_R = "Correlation";
const DFS_STACK_TOTAL = "Both together";
const DFS_GAP = "Rank gap";
const DFS_BOOM = "High end";

/* How many rows of the two long tables are PAINTED. The document
 * carries every row — the DraftKings entry above reads it by id — and
 * this is a drawing decision on a phone, stated under the table it
 * applies to. */
const DFS_ROWS_DRAWN = 40;

/* ------------------------------------------------------------------
 * U7 + U-PROJECTIONS-FULL — THE PROJECTIONS TAB
 * (UI_ALPHA_SPEC sec 6e and sec 8b, handoff sec 5.3)
 * ------------------------------------------------------------------
 * THE LAB'S PLAYER BREAKDOWN, ON THIS SURFACE, OVER THE WHOLE WEEK.
 * U7 drew the lab's one-game file here; sec 8b replaces that read
 * with `projections.json` — the same exporter's second command, the
 * same per-player record, every game of the slate — because a reader
 * looking up his own players needs the other fifteen matchups and a
 * design sandbox's slice cannot give him one. THE LAB PAGE IS
 * UNTOUCHED and keeps its one-game file; this app no longer reads it.
 *
 * EVERY HONESTY RULE OF THAT PAGE COMES WITH IT, and they are the
 * reason this is a port and not a redesign:
 *
 *   * STORED NUMBERS ONLY. Every figure here is one the generation
 *     saved. Nothing is summed, nothing is rescaled, and a share
 *     stored as 0.62 is drawn as 0.62 rather than turned into a
 *     percentage this page invented a denominator for.
 *   * ABSENCES ARE NAMED. A value the generation did not carry draws
 *     a dash and the generation's OWN reason beside it — never a
 *     blank, and never a plausible number nobody computed.
 *   * THE ONE ARITHMETIC IS GEOMETRY. The likeliness strip divides
 *     each stored point by its own row's axis to place a mark. It
 *     produces no quantity, it is never shown as a number, and a row
 *     whose range is a single value draws no strip at all rather than
 *     asserting a spread the generation never produced.
 *
 * AND THE LAB'S VOCABULARY DOES NOT CROSS. "Quantile", "grid",
 * "p10/p90", "the chain", "TeamVolume.plays" are the right words in a
 * document other code reads and the wrong words on a screen (sec 7),
 * so every label and every reason on this screen goes through
 * `plainNote` on its way to the reader, exactly as the slate's and
 * the sheet's prose does. */

const PROJ_SCOPE =
  "Every game of this week, from our newest set of numbers. Every figure below is one we saved; anything missing says why.";
const PROJ_PICK_A_PLAYER = "Pick a player";
const PROJ_SEARCH_PLACEHOLDER = "Search players in this game";
const PROJ_SEARCH_BASIS =
  "Matches on the names in the game above. Use the arrows to change game.";
const PROJ_SEARCH_EMPTY = "Nobody in this game matches";
const PROJ_NO_PLAYERS =
  "We saved no player for this game, so there is nothing to draw and nothing is invented in its place.";
const PROJ_OFFLINE_HEAD = "The projections haven't loaded.";
const PROJ_OFFLINE_BODY =
  "This screen reads one file we write on each deploy. It isn't here right now, so there is nothing true to draw and nothing is being guessed at.";
const PROJ_OFFLINE_SCHEMA =
  "The projections file that loaded is a shape this build does not know, so none of it is drawn. That is a deliberate refusal, not a failure to try.";

/* The five saved points of a stat's outcomes, in the words sec 7 sets
 * for them. The keys stay p10..p90 in the document; these are what a
 * reader sees above the columns. */
const PROJ_POINTS = [
  ["Low end", 0], ["Low-mid", 1], ["Middle", 2],
  ["High-mid", 3], ["High end", 4]
];
const PROJ_MOVED_NOTE =
  "The small number beside each projection is how far it has moved since our first run of the week.";
const PROJ_WEEK_OPEN = "week opened at ";
/* The same fact under the cell, short enough for a column: the number
 * it moved FROM. The whole sentence rides the cell's own title. */
const PROJ_FROM = "from ";
const PROJ_NO_MOVE =
  "no number in the first run of the week, so there is nothing to compare";
const PROJ_RESULTS_HEAD = "All projected results";
const PROJ_NO_RESULTS = "This run carried no projected stat for him.";
/* A stat the run saved a range for but no projection. It is its own
 * sentence because it is its own fact: there IS something here, and
 * what is missing is the one number the statline reads. */
const PROJ_NO_MEAN =
  "This run saved a range for this stat but no projection of its own, so none is shown and none is worked out here.";

/* The likeliness line, and the word "likeliness" is the LAB's, not a
 * reader's. What the strip is, said plainly, once, above it. */
const PROJ_LIKELY = "how likely";
const PROJ_LIKELY_NOTE =
  "Each line is its own scale, from zero to the wider of that stat's high end and its projection: the pale band runs from the low end to the high end, the darker core is the middle half, the tick is the midpoint and the dot is the projection. A stat with only one possible value draws no line.";

const PROJ_CONTEXT_HEAD = "The circumstances";
const PROJ_CONTEXT_NOTE =
  "The circumstances this run happened in — read off the same row as the workings below, not numbers it multiplied.";
const PROJ_CHAIN_HEAD = "How the projection is built";
const PROJ_CHAIN_NOTE =
  "In the order it is worked out: the game line our volume model read, the team's volume, this player's shares, his opportunities, then the rates applied to them.";
const PROJ_CHAIN_ABSENT =
  "The workings are not available for this run.";
const PROJ_CEILING_LABEL =
  "Chance of a top-15% week at his position";
const PROJ_PROBABILITY = "probability";
const PROJ_FULL = "Full projection";
const PROJ_NOT_IN_FILE =
  "This week's projections do not carry him, so there is nothing to open for him and nothing is invented in its place.";
const PROJ_GENERATED = "Our numbers from ";

/* ------------------------------------------------------------------
 * U2 — THE SLATE DOCUMENT
 * ------------------------------------------------------------------
 * THE TWO PATHS, the lab's idiom exactly. Real is the default; the
 * fixture is reachable only by asking for it by name in the query
 * string, and when it is asked for the Sample-data tag stays on. */

const REAL_SLATE_URL = "../data/slate.json";
const DEMO_SLATE_URL = "../demo/slate.demo.json";

/* The one switch, read once. Anything but `?demo=1` is real mode. */
const DEMO = (function () {
  try {
    return window.location.search.indexOf("demo=1") !== -1;
  } catch (err) {
    return false;
  }
})();

const SLATE_URL = DEMO ? DEMO_SLATE_URL : REAL_SLATE_URL;

/* The schema tag the exporter writes. A document that does not carry
 * it is not this contract, and the page refuses it out loud rather
 * than reading fields out of a shape it does not know. */
const SLATE_SCHEMA = "slate-1";
const FETCH_TIMEOUT_MS = 15000;

/* U5's second document, on exactly the same two paths and the same
 * one switch. It is written by the shape side's own exporter from the
 * committed weekly sheet; this page reads it and computes nothing
 * from it. */
const REAL_DFS_URL = "../data/dfs.json";
const DEMO_DFS_URL = "../demo/dfs.demo.json";
const DFS_URL = DEMO ? DEMO_DFS_URL : REAL_DFS_URL;
const DFS_SCHEMA = "dfs-1";

/* U-PROJECTIONS-FULL's third document (UI_ALPHA_SPEC sec 8b), on the
 * same two paths and the same one switch.
 *
 * IT IS NO LONGER THE DESIGN SANDBOX'S ONE-GAME FILE. U7 read that
 * one, which is a SLICE — one game of the week, chosen for the
 * designer working on the page. A reader looking up his own players
 * needs the other fifteen games, so this screen reads
 * `projections.json`: the same exporter, the same record builders,
 * the same honesty rules, every game of the slate. The sandbox's file
 * is untouched and its page still reads it; this app no longer does.
 *
 * Read the same way as the other two: the schema tag first, then the
 * fields, and nothing derived. */
const REAL_PROJECTIONS_URL = "../data/projections.json";
const DEMO_PROJECTIONS_URL = "../demo/projections.demo.json";
const PROJECTIONS_URL = DEMO ? DEMO_PROJECTIONS_URL
  : REAL_PROJECTIONS_URL;
const PROJECTIONS_SCHEMA = "projections-1";

/* The eight stats the generation carries, with the app's own label and
 * the decimals each one reads in — the board's spellings, which are
 * the words on a box score. */
const PROJ_STATS = [
  ["Pass yds", "pass_yds", 0],
  ["Pass TD", "pass_tds", 2],
  ["Carries", "rush_att", 1],
  ["Rush yds", "rush_yds", 0],
  ["Targets", "targets", 1],
  ["Receptions", "receptions", 1],
  ["Rec yds", "rec_yds", 0],
  ["Any TD", "anytime_td", 2]
];

/* The positions a roster is grouped into, in the order they are
 * drawn. Anything else keeps its own name and sorts after them. */
const PROJ_POS_ORDER = ["QB", "RB", "WR", "TE", "FB"];

/* ------------------------------------------------------------------
 * U3 — THE PICKS SERVICE
 * ------------------------------------------------------------------
 * THE ONE HOST THIS APP NAMES, and it is the same deploy the lab's
 * read box already writes to (D-123: one service, one bearer token,
 * one user). The watchlist and the slips are USER-AUTHORED objects
 * and the site is static, so they live there and nowhere else — which
 * is why the honest arm below is a connect state and not a local
 * cache pretending to be storage.
 *
 * THE TOKEN IS THE READER'S OWN, kept in HIS browser under the house
 * key shape (`fe.<what>.v<n>`) and sent to this service and nowhere
 * else. It is the same key the lab's box uses, because it is the same
 * token for the same service, and both touches are guarded: storage
 * that refuses — a private window, blocked site data — leaves him
 * able to paste a token per visit rather than leaving the segment
 * broken. It is the ONLY thing this app ever writes to a browser. */

const SERVICE_URL = "https://fantasy-edge-production-ab88.up.railway.app";
const PICKS_TOKEN_KEY = "fe.reads.token.v1";

/* THE ONE DISPLAY RULE THIS FILE OWNS (handoff sec 7.3): a gap under
 * three points is not an edge and is never drawn as one. It lives
 * here, on the client, because it is a decision about a screen — the
 * exporter ships the number and says nothing about it. */
const GAP_MIN = 3;

/* THE SECOND DISPLAY RULE, AND THE ONLY OTHER THRESHOLD THIS FILE
 * OWNS. docs/DECISIONS.md, OWNER DIRECTION 2026-09-20 ("there has to
 * be some level of realism in there"), realised as UI_ALPHA_SPEC sec
 * 5: a published gap of twenty-five points or more is not an edge we
 * found, it is the shape of a blind spot we have already named — a
 * trailing window that believes one quiet game, and a negative tail
 * the simulator does not carry. It is the same species as GAP_MIN
 * above: a decision about a SCREEN, declared once, checkable against
 * the screen. Roughly five times the calibration layer's own
 * reliability band; moving it is a ledger edit, not a knob.
 *
 * IT CHANGES WHAT IS SAID, NEVER WHAT IS SHOWN. Every prop the
 * exporter published still renders, with its own gap, its own chance,
 * its own line and its own odds. A blind-spot candidate is SORTED
 * behind the moderate gaps in the one view that makes an edge claim
 * and is LABELLED wherever it appears. Nothing is filtered, nothing
 * is rounded away, and no number on any of these screens is a
 * different number because of this constant. */
const BLIND_SPOT_GAP_PTS = 25;

/* ...and the same shape for the Role trend, which sec 5.1 shows at
 * plus or minus five and hides below. */
const TREND_MIN = 5;

/* The Usage view's own threshold: a red-zone share of a quarter or
 * more is drawn positive. It is declared beside the other two even
 * though NOTHING reaches it today — the exporter publishes no
 * red-zone share at all — so the rule is written once and is already
 * right on the day a split is ingested. */
const RZ_MIN = 0.25;

/* The empty cell, sec 3.1's `disabled` grey. One character, one
 * constant, so a dash is never a hyphen somewhere else. */
const DASH = "—";
const UP = "▲";
const DOWN = "▼";

/* ------------------------------------------------------------------
 * the words — sec 5.1's views, headers and footnotes
 * ------------------------------------------------------------------ */

const VIEWS = [
  ["props", "Props"], ["fantasy", "Fantasy"], ["role", "Role"],
  ["usage", "Usage"], ["market", "Market"]
];

const VIEW_GROUP_LABEL = "Table view";

/* The two column headers per view, away-side order. The home side
 * mirrors them (sec 5.1: away · v1 · v2 | pos | v2 · v1 · home). */
const HEADS = {
  props: ["LINE", "GAP"],
  fantasy: ["PROJ", "RANGE"],
  role: ["SHARE", "TREND"],
  usage: ["PER GAME", "RED ZONE"],
  market: ["", ""]
};

/* ------------------------------------------------------------------
 * U-CASUAL — THE UNIT WORDS (UI_ALPHA_SPEC sec 8a)
 * ------------------------------------------------------------------
 * THE SHORTHAND IS DEAD. `cy`, `r`, `ry` and a bare `att` were unit
 * LETTERS: they saved four characters in a cell and cost a reader the
 * whole sentence, because nothing on the screen told him what one was
 * except a legend at the bottom explaining a code that only existed to
 * need explaining. The owner's bar is one line long — if he has to
 * work out what `cy` means, it is not casual friendly — and this is
 * the whole of the answer: a number carries a word he already owns.
 *
 * THE DOCUMENT DOES NOT MOVE. `slate.json` still ships `unit` and
 * `unit_word` per prop, because JSON keys are contracts and the
 * exporter's pins read them. This table is the DISPLAY side, keyed by
 * the prop's published `market` — the field that actually says what
 * the number is — and it is the only thing the cell reads. A market
 * this table has never met falls back to the document's own
 * `market_label` ("Receiving yards", "Passing touchdowns"), which is
 * already a phrase rather than a code; it never falls back to `unit`.
 *
 * THE SHORT WORD IS NOT THE LABEL. "pass yds" fits a phone cell and
 * "Passing yards" does not — this is the compact vocabulary sec 8a
 * asks for, and the long words still head the pick card.
 *
 * "catches" IS THE CASUAL WORD FOR RECEPTIONS and it is what a
 * compact cell says (sec 8a names it); "Receptions" still heads the
 * pick card, where there is room for the longer word. */
const UNIT_WORDS = {
  "passing yards": "pass yds",
  "passing touchdowns": "pass TDs",
  "rushing attempts": "carries",
  "rushing yards": "rush yds",
  "receptions": "catches",
  "receiving yards": "rec yds"
};

/* What the small word under a home-table line says, in full: the
 * stat, then the fact that the number IS a line. "88.5 / rush yds
 * line" reads as a sentence; "88.5ry" reads as a puzzle. */
const UNIT_LINE = " line";

/* The Usage column's own words, per position, for the same reason —
 * `a`, `o` and `t` were the same kind of code. A position this table
 * does not know draws its number with NO word rather than a letter:
 * the column head already says what it is, and a code is worse than
 * nothing. */
const USAGE_WORDS = {
  QB: "pass attempts",
  RB: "carries + targets",
  WR: "targets",
  TE: "targets"
};

/* THE LEGENDS, one per view, each its own sentinel. Sec 10 asked that
 * every unit be explained in the view footnote; sec 8a answers it a
 * better way — the unit is a word, so it explains itself, and the
 * footnote no longer has a code to translate. */
const LEGEND_PROPS =
  "The main line for this player, and how far our number sits from the fair market chance, in percentage points. The arrow and the number show only when we are 3 points or more above the market; anything smaller is a dash, because a gap that small is not an edge.";
const LEGEND_FANTASY =
  "Projected points in half-PPR scoring, added up from our own projected stats. It does not yet subtract fumbles or interceptions.";
const LEGEND_ROLE =
  "Share is the slice of his team's work our depth chart gives him, and each cell says which slice: pass attempts for a quarterback, share of the team's carries for a back, share of the team's targets for a receiver. Trend is the change against his prior four games, shown at 5 points or more.";
const LEGEND_USAGE =
  "Opportunities per game over the weeks already played. Each number says what it counts: pass attempts for a quarterback, carries plus targets for a back, targets for a receiver.";
const LEGEND_MARKET =
  "The chance of the side we lean to, from the line's open until now. The solid line is our number at each update; the dashed one is the bookmaker's fair odds at each saved price. It turns green when we are 3 points or more above the market.";

const LEGENDS = {
  props: LEGEND_PROPS, fantasy: LEGEND_FANTASY, role: LEGEND_ROLE,
  usage: LEGEND_USAGE, market: LEGEND_MARKET
};

/* THE CALIBRATION BASIS, per market and never blanket
 * (UI_ALPHA_SPEC sec 1, handoff sec 7.4). One sentence, pinned, under
 * the Props view — the only view on this screen that draws a
 * probability against a price. WHICH markets ride the layer is read
 * off the document's own `run.calibrated_markets` and off each prop's
 * own `calibration` field; this sentence says what that means. */
const CALIBRATION_NOTE =
  "Receptions, receiving yards, rushing attempts and rushing yards have been checked against two seasons of history; every other market here is newer, so treat its number as a lean, not a probability.";

/* The Fantasy view's range column. The exporter publishes no points
 * range and says why on every record; this is that reason in the
 * reader's words, under the column it explains. */
const RANGE_ABSENT =
  "Range is a dash because we do not save a range for total points yet: we save one for each stat, and stat ranges cannot simply be added together.";

/* ...and the Usage view's, for the same reason in a different place. */
const RZ_ABSENT =
  "Red-zone share is a dash because we do not store red-zone data yet: it needs plays split by field position, and nothing is estimated in its place.";

/* ------------------------------------------------------------------
 * U-CASUAL — THE "HOW TO READ THIS" DISCLOSURE (sec 8a)
 * ------------------------------------------------------------------
 * THE WALL COMES DOWN AND NOT ONE FACT GOES WITH IT. Every screen
 * here had grown a stack of honest paragraphs — what the number is,
 * what it is measured against, which season is left out, what we
 * refuse to invent — and the honesty was real while the reading was
 * impossible: four sentences of provenance between a reader and the
 * table they explain is a wall, and a wall is skipped.
 *
 * So each block becomes ONE SHORT LINE plus a tap. The line is what a
 * casual reader needs to use the screen; the tap holds every sentence
 * that was there before, unchanged, through the same plain-language
 * layer they always went through. Nothing is dropped, summarised away
 * or softened — an honesty rule that only survives behind a tap still
 * survives, and one nobody reads does not.
 *
 * ONE COMPONENT, used by every surface that had a block: Home,
 * Screen, Pick, Live, Fantasy, DFS and Projections. It is a native
 * `<details>`, so it works with no script, opens under a keyboard,
 * announces its own state to a screen reader and cannot animate
 * itself into a reduced-motion violation. */
const HOW_TO_READ = "How to read this";

/* The one short line per home view — what the two columns ARE, in a
 * sentence a reader finishes. Everything else about them is one tap
 * away. */
const SHORT_PROPS =
  "The bookmaker's main line for each player, and how far our number is from the market.";
const SHORT_FANTASY =
  "Projected points in half-PPR scoring.";
const SHORT_ROLE =
  "How much of his team's work our depth chart gives him, and which way it is moving.";
const SHORT_USAGE =
  "How many chances he has had per game so far this season.";
const SHORT_MARKET =
  "Our chance against the bookmaker's, from the line's open until now.";

const SHORTS = {
  props: SHORT_PROPS, fantasy: SHORT_FANTASY, role: SHORT_ROLE,
  usage: SHORT_USAGE, market: SHORT_MARKET
};

/* ...and the one short line the other surfaces lead with. */
const SHORT_SCREEN =
  "Every line we have a number for, biggest difference first.";
const SHORT_LIVE =
  "Live chances, updated about once a minute while this screen is open.";
const SHORT_PICK =
  "Our number for this line, and what the market is paying.";
const SHORT_TEAM =
  "Your lineup with our projection for each player.";
const SHORT_PROJECTIONS =
  "Every game of this week, with our projected stats for every player.";
const SHORT_BREAKDOWN =
  "Every stat we projected for him, how it has moved, and the numbers behind it.";
const SHORT_TOTAL =
  "Your starters' projections added up.";
/* The one short line on the matchup card, and it carries the sec 6c
 * meaning rather than deferring it: two totals compared, and no claim
 * about who wins. */
const SHORT_COMPARE =
  "Two projected totals side by side — not a chance of winning.";

/* ------------------------------------------------------------------
 * THE PLAIN-LANGUAGE LAYER (UI_ALPHA_SPEC sec 7)
 * ------------------------------------------------------------------
 * The footnotes the exporter writes into `slate.json` are ENGINEERING
 * prose. They name archive shapes, table names, method ids and the
 * rulings behind them, which is exactly right in a document other code
 * reads and exactly wrong on a screen: "quantile grid", "de-vigged",
 * "half_ppr_v1" and "(D-075 point 3)" tell a reader who bets on
 * Sundays nothing at all.
 *
 * THE JSON DOES NOT MOVE. No key is renamed and no value is rewritten
 * upstream — the document is a contract, and the board, the tests and
 * the exporter's own pins all read it as it stands. This layer sits
 * between that document and the page, and it is the ONLY place either
 * vocabulary meets the other.
 *
 * THE FACTS SURVIVE THE TRANSLATION. That is the whole rule: each
 * replacement below says the same source, the same removal and the
 * same absence its original said — what we used, what is missing, and
 * what we refuse to invent — in words that need no glossary. Nothing
 * is dropped because it is awkward; the ledger citations go because a
 * reader cannot look them up, not because the facts they carry are
 * inconvenient.
 *
 * TWO PARTS, applied in this order:
 *   1. PLAIN_NOTES — a distinctive fragment of an exporter sentence,
 *      and the plain sentence that replaces the whole of it.
 *   2. PLAIN_WORDS — the backstop. Anything that reaches the screen
 *      WITHOUT a match still loses its ledger citations and its
 *      shorthand, so a footnote added upstream next month cannot put
 *      "no-vig" or "D-075" in front of a reader before anyone here
 *      has noticed it arrived. */

const PLAIN_NOTES = [
  ["half_ppr_v1: the weighted sum",
    "Half-PPR scoring, added up from our own projected stats: 1 point " +
    "per 25 passing yards, 4 per passing touchdown, 1 per 10 rushing " +
    "or receiving yards, 0.5 per catch, 6 per touchdown. It does not " +
    "yet subtract interceptions or fumbles, so a passer's total is " +
    "high by whatever his interceptions would have cost."],
  ["the 10th, 50th and 90th percentile",
    "The low end, middle and high end of our own simulated outcomes " +
    "for this stat. They are the shape of those outcomes themselves, " +
    "not a range drawn around the projection."],
  ["per (player, market): each book's LATEST capture",
    "The line most bookmakers quote, at the price from whichever book " +
    "posted it most recently. It is a price a named book really " +
    "posted — never an average, never a best-of, never shopped around."],
  ["the implied totals and the spread are the ones the forward pass",
    "These are the team totals and the spread our projection actually " +
    "used, not numbers worked out again here."],
  ["the lean side's chance over time",
    "The chance of the side we lean to over time: one point each time " +
    "we update, and one for each bookmaker price we saved, with the " +
    "bookmaker's margin removed. It is only as detailed as those " +
    "saved prices are, and with fewer than two we say the line has " +
    "just posted rather than draw a line through a single dot."],
  ["this is a MEASURED market, not a counted one",
    "Yardage does not come in countable steps the way catches do, so " +
    "there are no outcome bars for it. The range of likely outcomes " +
    "is drawn instead."],
  ["points quantiles are not persisted",
    "We do not save a range for total points yet: we save one for " +
    "each stat, and stat ranges cannot simply be added together. " +
    "Saving one would take a change where the numbers are generated, " +
    "and nothing does that today."],
  ["the trailing weekly actuals for this player are not reachable",
    "We cannot reach this player's earlier weeks this season, so " +
    "there is no share to work out. Nothing is estimated from a " +
    "part-finished season."],
  ["aDOT is not an engine object",
    "We do not project average depth of target: our model works in " +
    "targets and yards per catch, which is not the same thing. " +
    "Nothing is estimated in its place."],
  ["only one capture of this line exists",
    "Only one price was saved for this line this week, so there is no " +
    "movement to report. A line quoted once has not moved."],
  ["how often he has been at or above this line",
    "How often he has finished at or above this line in the weeks " +
    "already played, counted season by season and never added " +
    "together, with the number of games beside each count. The sealed " +
    "test season is left out and does not appear here."],
  ["what this line implies is not derivable",
    "We cannot say what this line implies: it needs this player's " +
    "recent workload and conversion — targets and a catch rate, or " +
    "carries and yards per carry — and we do not have both. Nothing " +
    "is written from numbers nobody has."],
  ["a red-zone opportunity share is not derivable",
    "We do not store red-zone data: it needs plays split by field " +
    "position, and nothing is estimated in its place."],
  ["the line placed is outside this prop's published ladder",
    "The line you placed is outside the lines we published a chance " +
    "for, so none is shown. Working one out here would mean this page " +
    "computing a probability, and it does not do that."],
  ["the chain's persisted share for this player",
    "We could not read the share our depth chart actually gave this " +
    "player for this update, so none is shown. A share worked " +
    "backwards from the projected stats would not be that number."],
  ["the game line the volume model consumed",
    "We could not read the game line our projection used here, so " +
    "neither the totals nor the spread is stated. The schedule's own " +
    "closing numbers are a different thing."],
  ["no main line was captured for any of this player's key markets",
    "No main line was saved for any of this player's key markets, so " +
    "there is nothing to compare. That means we saved none — it is " +
    "not the model staying quiet."],
  ["no realized week of this season or of 2024",
    "No completed week of this season or of 2024 carries this stat " +
    "for him, so there is nothing to count. The two seasons are " +
    "counted and labelled separately and never added together."],
  ["the generation archived no usable grid",
    "We saved no usable set of outcomes for this stat, so no line " +
    "could be read off it. Nothing is estimated in its place."],
  ["no captured market line was found for this slate",
    "No bookmaker line was saved for this slate, so no player carries " +
    "a main line. The Props and Market views show dashes; Fantasy, " +
    "Role and Usage are unaffected, because none of them reads a price."],

  /* U5 — THE WEEKLY DFS SHEET'S OWN PROSE. Same rule as every entry
   * above it: the sheet's JSON is untouched, the FACTS survive, and
   * the governance prose that belongs in the ledger stays in the
   * ledger. Each caveat the sheet attaches to a table is kept — a
   * proxy still says it is a proxy, an assumption still says it is an
   * assumption, and an absence still says which file was looked for. */
  ["A PROJECTION HERE IS DRAWABLE-PPR",
    "Points on our own scoring, worked out from our projected stats: " +
    "1 per catch, 1 per 10 receiving or rushing yards, 1 per 25 " +
    "passing yards, 4 per passing touchdown, 6 per touchdown. It is " +
    "not DraftKings scoring — interceptions, fumbles, two-point " +
    "conversions and return touchdowns are left out of both sides. " +
    "It is shown here, never graded here."],
  ["RANKS ARE WITHIN POSITION",
    "Ranks are worked out inside each position, 1 being the highest, " +
    "and players who tie share the better rank. The gap is his " +
    "ownership rank minus his projection rank: a positive number " +
    "means we like him more than the crowd does."],
  ["THE BOOM PROXY IS COMONOTONIC BY ASSUMPTION",
    "This column assumes every one of a player's stats has a big game " +
    "at the same moment, which nothing in our data says is true. It " +
    "is the assumption that makes the number possible, and it is why " +
    "the number is a stand-in."],
  ["The live archive's existing 21-point quantile grids are NOT",
    "What we save for each stat is a set of likely outcomes for that " +
    "stat on its own. Adding the high ends of those together is not " +
    "the same thing as a high end for the player, and we do not " +
    "pretend it is."],
  ["THIS COLUMN IS A PROXY AND IS NEVER PRESENTED AS THE REAL NUMBER",
    "This column is a stand-in and is never presented as the real " +
    "number. It is not a high end we have measured; it is replaced " +
    "the day the real one exists."],
  ["OWNERSHIP IS READ OFF THE COMMITTED SUMMARIES",
    "Ownership is read off the ownership files already saved for this " +
    "week and from nowhere else — nothing is fetched. Every row that " +
    "could not be matched to a player is counted and named rather " +
    "than quietly dropped."],
  ["A SCHEMA LIMIT, STATED RATHER THAN WORKED AROUND",
    "Our projection rows carry a player id but no name, so an " +
    "ownership row we could not match by id cannot be matched by name " +
    "either. Those rows are counted as unmatched, and a player with " +
    "no ownership row is shown without one. No other source is " +
    "consulted for a name."],
  ["PER-TABLE ABSENCE",
    "A missing ownership file drops the ownership columns for that " +
    "week and says which file was looked for. It is not a failed run: " +
    "the rest of the sheet is drawn, and nothing is invented in the " +
    "gap."],
  ["THIS SHEET CONTAINS NO BET AND NO PLAY RECOMMENDATION",
    "This sheet contains no bet and no play. It is a private weekly " +
    "display: our own projections beside the ownership that was " +
    "captured, each column labelled as what it is. Nothing here is a " +
    "pick, a lock or an edge, and no number here has been graded " +
    "against a result."],
  ["PER TEAM, OFF THE LIVE PROJECTIONS THEMSELVES",
    "The passer and the receiver in each stack are chosen off our own " +
    "projections for that team, because nothing we save carries a " +
    "depth chart for them."],
  ["THE WEEK'S GAMES ARE PLACED IN THE S-010 BUCKETS",
    "Each game is placed in a group by its spread and its total, " +
    "using the cut values our own correlation study set, and the " +
    "correlation shown is the one that study measured for that group."],
  ["UNDER-OWNED (S-016): BOTH LEGS BELOW",
    "Under-owned means both players are below the middle ownership " +
    "for their position on this slate. It is a flag on a hypothesis " +
    "nobody has tested yet, not a claim that it wins."],
  ["NOTHING in this module compares a 2026 forecast",
    "Nothing on this sheet is graded against a 2026 result. It is a " +
    "display of this season's numbers; the scoring happens at the end " +
    "of the season, under its own sealed protocol."],

  /* ...and the six evidence classes, which are the sheet's own words
   * for how much each column is worth. They are the honesty of this
   * surface, so they are translated rather than dropped. */
  ["a key, not a claim",
    "A key, not a claim: a team, a player id, a position, a group " +
    "name."],
  ["the engine's own number, DISPLAYED and never scored here",
    "Our own projection, shown here and never graded here. Its record " +
    "is kept on the live scorecard, not on this sheet."],
  ["a measurement read off a committed capture file",
    "A measurement read off a file we saved — what the provider or " +
    "the contest actually said."],
  ["an ACCEPTED research result with support behind it",
    "An accepted research result with evidence behind it."],
  ["a stand-in computed under a STATED assumption",
    "A stand-in worked out under an assumption the data cannot " +
    "support. It is labelled, and the assumption is printed with the " +
    "table."],
  ["a display of a hypothesis that PREDATES ITS TEST",
    "A hypothesis shown before it has been tested. No claim about " +
    "chances, and no support behind it yet."],

  /* ...and the sheet's per-row reason codes. They are keys, written
   * for a machine, and each one is a real fact about that row: what
   * could not be read, named. Said in words. */
  /* ...and the two column meanings that are still ours rather than a
   * reader's after the word-level glossary has run. Each keeps the
   * fact and loses the machinery. */
  ["the S-010 spread x total bucket of the game",
    "Which group of games this one is in: its spread and its total, " +
    "each cut into thirds."],
  ["the draw-implied QB-pass x own-WR1-receiving correlation",
    "How closely the passer's yards and his own top receiver's yards " +
    "moved together in games like this one, measured in our own " +
    "study."],
  ["summed across the marginals AT ONE GRID POINT",
    "Every one of his stats read at the same high point of its own " +
    "range, then added together. That is the stand-in; it is not a " +
    "high end anyone has measured."],
  ["how many marginals the row actually had",
    "How many of his stats we had a range for."],

  ["live_projection_player_has_no_ownership_row",
    "No ownership was captured for one of these two, so the pair's " +
    "ownership is blank rather than filled in."],
  ["ownership_row_share_not_readable_for_this_player",
    "Ownership was captured for him, but the share on that row could " +
    "not be read, so none is shown. That is not the same as having no " +
    "row at all."],
  ["ownership_row_matched_no_live_projection_player",
    "This captured ownership row matched no player we project, so it " +
    "is counted rather than dropped."],
  ["no_ownership_summary_on_disk_for_this_week",
    "No ownership file was saved for this week, so the ownership " +
    "columns are blank. Nothing is estimated in their place."],
  ["no_t90_game_line_for_this_team_pooled_r_used",
    "No game line was saved for this team at the cutoff, so the " +
    "correlation shown is the one measured across all games rather " +
    "than this game's own group."],
  ["the_bucket_carries_no_r_pooled_r_used",
    "This game's group carries no measured correlation, so the one " +
    "shown is the figure measured across all games."],
  ["the_b_bucket_table_could_not_be_read_at_all",
    "The correlation table could not be read, so the figure shown is " +
    "the one measured across all games."],
  ["no_positional_median_ownership_on_this_slate",
    "There is no middle ownership for this position on this slate, so " +
    "the under-owned flag cannot be worked out and is not shown."],
  ["team_has_no_priced_passer_in_the_live_projections",
    "We project no passer for this team this week, so there is no " +
    "stack to draw for it."],
  ["team_has_no_priced_receiver_in_the_live_projections",
    "We project no receiver for this team this week, so there is no " +
    "stack to draw for it."],

  /* U7 — THE PROJECTIONS FILE'S OWN LABELS. Same rule as every entry
   * above: the JSON is untouched, the FACT survives, and the engine
   * object each label names — `TeamVolume.plays`, `ChainFit.td_rate`,
   * `PlayerMeans.catch_rate` — stays in the document where the code
   * that reads it lives. A reader is owed WHAT THE NUMBER IS, not
   * which class held it. */
  ["opponent (TeamEnvironment.opponent)", "who he plays"],
  ["kickoff (the live bundle's own stamp", "kickoff"],
  ["T-90 designation the eligible set consumed",
    "his injury designation, as it stood when we ran the numbers"],
  ["T-90 practice trend the eligible set consumed",
    "his practice trend, as it stood when we ran the numbers"],
  ["the market snapshot label the forecast read",
    "which saved set of game lines we read"],
  ["game line: spread, the team's own handicap",
    "game line: the spread, from his team's side (a negative number " +
    "means they are favoured)"],
  ["game line: total", "game line: the total both teams are expected " +
    "to score"],
  ["game line: this team's implied total",
    "game line: what his team alone is expected to score — the number " +
    "our plays model reads"],
  ["forecast team plays (TeamVolume.plays)",
    "how many plays we expect his team to run"],
  ["pass rate — p(dropback)", "how often we expect them to drop back " +
    "to pass"],
  ["team dropbacks (TeamVolume.dropbacks)",
    "how many dropbacks that comes to"],
  ["attempt rate: attempts per dropback",
    "how many of those dropbacks become a pass attempt rather than a " +
    "scramble or a sack"],
  ["team pass attempts (TeamVolume.attempts)",
    "how many pass attempts that comes to"],
  ["team targets (TeamVolume.team_targets)",
    "how many targets there are for the team to share"],
  ["team carries: the rush-opportunity pool",
    "how many carries there are for the team to share — the pool his " +
    "carry share is a share OF"],
  ["his target share as allocated",
    "his share of those targets, as our depth chart gave it to him"],
  ["his carry share as allocated",
    "his share of those carries, as our depth chart gave it to him"],
  ["his share of the team's pass attempts",
    "his share of the team's pass attempts"],
  ["catch rate per target (PlayerMeans.catch_rate)",
    "how many of his targets he catches"],
  ["yards per RECEPTION (PlayerMeans.yards_per_reception)",
    "his yards per catch — per CATCH, not per target"],
  ["yards per carry (PlayerMeans.yards_per_carry)",
    "his yards per carry"],
  ["yards per pass ATTEMPT", "his yards per pass attempt"],
  ["touchdown conversion by FIELD POSITION",
    "how often a play turns into a touchdown, by where on the field " +
    "it starts. These are league-wide rates, not his own, and our " +
    "numbers apply them to how much of each part of the field he " +
    "actually sees — so there is no single rate that is 'his', and " +
    "one is not made up here."],
  ["receiving touchdown conversion as ONE number",
    "his receiving touchdown rate as a single number — never saved, " +
    "because our numbers never use one"],
  ["rushing touchdown conversion as ONE number",
    "his rushing touchdown rate as a single number — never saved, " +
    "because our numbers never use one"],
  ["no explain rows exist for this generation",
    "This run saved no workings for these players, so there are none " +
    "to show. The workings are saved as the numbers are made and are " +
    "never rebuilt afterwards, so a run that saved none has none."],
  ["the generation stored no value and no reason",
    "This run saved neither a number nor a reason for this one, so " +
    "nothing is shown and nothing is guessed at."],
  ["the forward pass kept no TeamVolume for this team-week",
    "We did not keep the team's volume for this week, so this part of " +
    "the workings is not there to read. It is not worked out again " +
    "here from what came after it."],
  ["the attempt rate is a VolumeFit scalar",
    "We keep the attempts and the dropbacks but not the rate between " +
    "them, and dividing one by the other here would be a number we " +
    "made up rather than one we used."],
  ["this generation carried no T-90 designation for the player",
    "This run carried no injury designation for him — either no " +
    "injury report reached us in time, or he was not on one."],
  ["the forward pass kept no TeamAllocation for this team-week",
    "We did not keep the shares our depth chart handed out for this " +
    "week, so they are not there to read. Working them backwards " +
    "from the projected stats would not be those shares."],
  ["the forward pass kept no passer split for this team-week",
    "We did not keep how the team's pass attempts were split between " +
    "its passers for this week — and a week our depth chart gave no " +
    "passer has no split to keep. What we do hold is the attempts " +
    "themselves, not the split."],
  ["this forecast carries no per-attempt rate",
    "We multiply his attempts by his yards-per-attempt and keep the " +
    "PRODUCT — his passing yards. With the rate itself not saved, " +
    "dividing that product back out would be our arithmetic here, " +
    "not the rate our numbers used."],
  ["this forecast carries no touchdown conversion at all",
    "This run saved none of its touchdown rates, so the mapping is " +
    "not there to read. What we hold is the touchdowns those rates " +
    "produced, not the rates."],
  ["home team? (TeamEnvironment.is_home)", "is he at home?"],
  ["line vintage: the selected capture's stamp",
    "when the game line we read was saved"],
  ["line vintage: this game's T-90 moment",
    "this game's cutoff — ninety minutes before kickoff"],
  ["line vintage: minutes before T-90",
    "how long before that cutoff the game line we read was saved, in " +
    "minutes"],
  ["line vintage: the selection rule",
    "the rule that picked which saved game line to read"],
  ["the generation's band",
    "how much of the week's information this run had"],
  ["the slate's market bundle was not in hand",
    "We did not have the week's saved game lines when these numbers " +
    "were made, so the circumstances our volume model read cannot be " +
    "shown."],
  ["has no TeamEnvironment in the bundle the forecast read",
    "The saved game lines we read carry nothing for his team in this " +
    "game, so the circumstances are not there to show."],
  ["the bundle carries no live line vintage for this game",
    "No saved game line was picked for this game, so there is no " +
    "stamp to show for one."],
  ["this player is not in the team's allocated share vector",
    "Our depth chart gave him no share of this team's work, so there " +
    "is none to show."],
  ["this player is not one of the passers",
    "He is not one of the passers our numbers split this team's " +
    "attempts across, so no attempt share and no yards per attempt " +
    "were applied to him."],
  ["the forward pass produced no PlayerMeans for this player-week",
    "This run produced none of his own rates, so none of what was " +
    "applied to him can be shown."],
  ["the touchdown conversion the chain applies is a rate PER " +
   "FIELD-POSITION BUCKET",
    "Touchdown conversion is a rate per part of the field, mixed " +
    "over how much of each part he sees, so no single number is the " +
    "rate applied to him. The whole mapping is shown instead; " +
    "collapsing it into one figure would be our average here rather " +
    "than the rate our numbers used."]
];

/* The one exporter footnote that carries a value inside it: the stat
 * whose mean the engine does not produce. Its name is kept — and
 * where the exporter's name for it is a box-score abbreviation, the
 * sentence says the whole word, because a sentence has room for it
 * even where a column does not. */
const NO_ENGINE_STAT_RE = /the engine projects no ([^:]+):[^]*$/;
const STAT_WORDS = {
  "ints": "interceptions",
  "int": "interceptions",
  "pass att": "passing attempts",
  "pass yds": "passing yards",
  "rush yds": "rushing yards",
  "rec yds": "receiving yards",
  "rec": "receptions",
  "att": "attempts"
};

/* The backstop. Ledger citations first — they are dropped, not
 * translated, because the sentence around them already carries the
 * fact — then the shorthand, longest phrase first so a short pattern
 * never eats a longer one's words. */
const PLAIN_LEDGER_RE =
  /\s*\((?:the board's\s*)?[DS]-\d{3}[^)]*\)/g;
const PLAIN_WORDS = [
  [/\bquantile grid\b/gi, "set of likely outcomes"],
  [/\bquantile band\b/gi, "range"],
  [/\bquantiles?\b/gi, "ranges"],
  [/\bno-vig\b/gi, "fair"],
  [/\bde-vigged\b/gi, "with the bookmaker's margin removed"],
  [/\bde-vig\b/gi, "remove the bookmaker's margin"],
  [/\bvs mkt\b/gi, "vs the market"],
  [/\bhalf_ppr_v1\b/gi, "half-PPR scoring"],
  [/\bchain-ranked\b/gi, "depth-chart"],
  [/\bthe chain\b/gi, "the depth chart"],
  [/\baDOT\b/g, "average depth of target"],
  [/\bstats_nflverse_latest\b/gi, "our weekly stats table"],
  [/\blive_explain_rows\b/gi, "our own saved projection rows"],
  [/\bdistributions?\b/gi, "likely outcomes"],
  [/\bp10\b/gi, "low end"],
  [/\bp90\b/gi, "high end"],
  [/\brealized weeks\b/gi, "weeks already played"],
  [/\brealized\b/gi, "completed"],
  [/\batt share\b/gi, "pass attempt share"],
  [/\bcaptures\b/gi, "saved prices"],
  [/\bcapture\b/gi, "saved price"],
  /* U5's three, from the weekly sheet's shorthand. Each is a word we
   * use among ourselves for something a reader already has a word
   * for. */
  [/\bdrawable[- ]PPR\b/gi, "points on our own scoring"],
  /* ...and the SHAPE ledger's codes, the same rule sec 7 wrote for
   * the board's: a reader cannot look one up, and the sentence around
   * it already carries the fact. */
  [/\bthe S-0\d{2}\b/g, "our"],
  [/\bS-0\d{2}'s\b/g, "our"],
  [/\bS-0\d{2}\b/g, "our own research"],
  [/\bthe gsis id\b/gi, "our own player id"],
  [/\bgsis id\b/gi, "our own player id"],
  [/\bthe B table\b/g, "our correlation table"],
  /* ...and last of all, the field names themselves. An exporter
   * sentence that quotes one of its own stat keys — `rushing_yards`,
   * `pass_tds` — puts a column name in front of a reader; the key is
   * unchanged in the document and reads as words on the page. The
   * table names above are matched before this, so it only ever
   * reaches the leftovers. */
  [/\b[a-z]+(?:_[a-z0-9]+)+\b/g, function (key) {
    return key.replace(/_/g, " ");
  }]
];

/* Every exporter-written sentence goes through here on its way to the
 * screen, whether it lands in a legend, a caption or a tooltip. */
function plainNote(text) {
  const source = String(text || "");
  if (!source) return "";
  for (let index = 0; index < PLAIN_NOTES.length; index += 1) {
    if (source.indexOf(PLAIN_NOTES[index][0]) !== -1) {
      return PLAIN_NOTES[index][1];
    }
  }
  const stat = source.match(NO_ENGINE_STAT_RE);
  if (stat) {
    const named = stat[1].trim();
    return "We do not project " +
      (STAT_WORDS[named.toLowerCase()] || named) + ": our model " +
      "produces no completions, attempts or interceptions, so there " +
      "is no number to read and none is invented.";
  }
  let out = source.replace(PLAIN_LEDGER_RE, "");
  PLAIN_WORDS.forEach(function (pair) {
    out = out.replace(pair[0], pair[1]);
  });
  return out;
}

/* The statline keeps the exporter's own short labels — they are the
 * words on a box score and a reader knows them — with the one
 * exception sec 7 names: the initialism gets its meaning in the
 * tooltip, where it costs no width. */
const LABEL_EXPANSIONS = { adot: "average depth of target" };

function labelTitle(label) {
  return LABEL_EXPANSIONS[String(label || "").toLowerCase()] || "";
}

/* Sec 8: a market with fewer than two points has no shape to draw. */
const LINE_JUST_POSTED = "Line just posted";

/* Sec 8: no games this week. */
const NO_GAMES_SWITCHER = "No games this week";
const NO_GAMES_BODY =
  "The slate carries no game for this week, so there is no matchup to draw.";

/* THE HONEST OFFLINE ARM. The document either arrived or it did not;
 * there is no cached yesterday and no fabricated stand-in on a screen
 * whose whole claim is that its numbers are the engine's. */
const OFFLINE_HEAD = "The slate hasn't loaded.";
const OFFLINE_BODY =
  "This screen reads one file the exporter writes on each deploy. It isn't here right now, so there is nothing true to draw and nothing is being guessed at. The games below are sample data, exactly as the tag says.";
const OFFLINE_SCHEMA =
  "The slate file that loaded is a shape this build does not know, so none of it is drawn. That is a deliberate refusal, not a failure to try.";

/* Sec 5.1's expanded row and search overlay. */
const PROJECTED = "PROJECTED";
const FANTASY_ROW = "Fantasy";
const OPEN_PICK = "Open pick";
const SEARCH_PLACEHOLDER = "Search teams or players";
const SEARCH_CANCEL = "Cancel";
const SEARCH_HEADING = "THIS WEEK'S GAMES";
const SEARCH_HAS = "has ";
const SEARCH_EMPTY = "No games match";

/* A NAMED DEVIATION from sec 5.1, recorded where it is made: the
 * search there lists full team names beside the abbreviations, and
 * slate.json carries abbreviations only. A thirty-two-name table
 * written into this file would be the app inventing data the engine
 * never gave it, which is exactly what every other arm here refuses to
 * do — so the results list matches on the abbreviation and on the
 * player names the slate does carry, and says so under the input. */
const SEARCH_BASIS =
  "Matches on team abbreviation and on any player listed in the table.";

/* The market sparkline, sec 4: 84 x 24, model solid, book dashed, end
 * dot on the model line. The y-window is the CELL'S OWN range with a
 * floor on its width, so a line that barely moved is drawn as a line
 * that barely moved rather than amplified to fill the box. */
const SPARK_W = 84;
const SPARK_H = 24;
const SPARK_PAD = 2;
const SPARK_MIN_SPAN = 0.10;

/* ------------------------------------------------------------------
 * THE FIXTURES — fabricated, every one of them
 * ------------------------------------------------------------------
 * No real player appears on this surface. These names exist to give
 * the shell something of the right SHAPE to lay out: a week of games
 * for the switcher, a few rows for the stub lists. They are replaced
 * wholesale by `slate.json` at U2, and until then the Sample-data tag
 * is on the hero. */

/* "Week 5" IS GONE (sec 8a). It was a fixture string from the
 * handoff's drawing, and it sat in the Fantasy header telling every
 * reader the wrong week for as long as the real week was not five.
 * The week now comes from `slate.json`'s own run block — the same
 * place the team capture is stamped from, so the header and the saved
 * team can never disagree — and when no slate has loaded the header
 * simply says the scoring and claims no week at all. */
const SAMPLE_SCORING = "half-PPR";
const WEEK_WORD = "Week ";

const SAMPLE_GAMES = [
  { away: "HOU", home: "IND", when: "SUN 12:00" },
  { away: "ATL", home: "CAR", when: "SUN 12:00" },
  { away: "DET", home: "GB", when: "SUN 12:00" },
  { away: "PHI", home: "DAL", when: "SUN 3:25" },
  { away: "BUF", home: "MIA", when: "SUN 3:25" },
  { away: "CHI", home: "MIN", when: "SUN 7:20" }
];

/* The sec 4 skeleton row, six of them on the placeholder (sec 5.3). */
const SKELETON_WIDTHS = [62, 48, 70, 55, 66, 44];

/* sec 8a reaches the FIXTURES too. "rush att 15.5" and "Rec 3+" are
 * strings a reader meets on the stub rows, so they say the words the
 * real cells say — a fixture that speaks a vocabulary the product has
 * retired is a fixture that would put it back on the screen. */
const SAMPLE_SCREEN_ROWS = [
  { name: "D. Hale", note: "WR · vs IND · catches 4.5" },
  { name: "K. Ames", note: "RB · vs CAR · carries 15.5" },
  { name: "M. Okafor", note: "WR · vs GB · catches 5.5" }
];

const SAMPLE_LIVE_ROWS = [
  { name: "T. Rourke", note: "Carries 16+ · Q3" },
  { name: "L. Pryor", note: "Catches 3+ · Q2" }
];

const SAMPLE_WATCHLIST_ROWS = [
  { name: "D. Hale", note: "Watchlist · More 4.5 receptions" }
];

const SAMPLE_SLIP_ROWS = [
  { name: "Three-leg slip", note: "Tracked · placed elsewhere" }
];

const SAMPLE_LINEUP_SLOTS = ["QB", "RB", "RB2", "WR", "WR2", "TE", "FLEX"];

/* ------------------------------------------------------------------
 * THE ROUTE TABLE — board 16's map, one row per screen
 * ------------------------------------------------------------------
 * `tab` is the tab a route BELONGS to. For a root that is simply its
 * tab; for a detail it is the owner used only when the address is
 * typed in cold, because a detail opened by hand pushes onto whatever
 * stack the reader is standing in. */

const ROUTES = {
  home: { tab: "home", hash: "#/home", root: true },
  season: { tab: "fantasy", hash: "#/fantasy/season-long", root: true },
  dfs: { tab: "fantasy", hash: "#/fantasy/dfs", root: true },
  projections: { tab: "projections", hash: "#/projections", root: true },
  /* U7's own detail: ONE player's whole breakdown, pushed onto the
   * Projections stack. It is a detail and not a root, so the chevron
   * pops back to the list — and a Pick card's "Full projection" link
   * pushes it on THAT stack while switching tabs, which is the nav
   * model's cross-tab move rather than a second router. */
  projection: { tab: "projections", hash: "#/projections/player",
    root: false },
  screen: { tab: "bets", hash: "#/bets/screen", root: true },
  live: { tab: "bets", hash: "#/bets/live", root: true },
  picks: { tab: "bets", hash: "#/bets/my-picks", root: true },
  pick: { tab: "bets", hash: "#/pick", root: false },
  track: { tab: "bets", hash: "#/track", root: false },
  team: { tab: "fantasy", hash: "#/team", root: false },
  card: { tab: "bets", hash: "#/card", root: false },
  report: { tab: "home", hash: "#/report", root: false }
};

const TAB_ORDER = ["home", "fantasy", "projections", "bets"];

/* THE SUB-VIEWS, and the owner's amendment (UI_ALPHA_SPEC sec 3's
 * OWNER CAVEAT, 2026-09-19). The handoff gave Bets two sub-views
 * behind a remembered toggle; the owner extended that shape to
 * FANTASY — Season long and DFS — and added a third Bets segment, My
 * picks. It is ONE model, written once: a tab with sub-views has no
 * root of its own, its root IS whichever sub-view was last used, and
 * its toggle replaces that root rather than pushing onto it. A tab
 * missing from this table is its own root and has no toggle. */
const TAB_SUBS = {
  fantasy: ["season", "dfs"],
  bets: ["screen", "live", "picks"]
};

const SUB_LABELS = {
  season: "Season long",
  dfs: "DFS",
  screen: "Screen",
  live: "Live",
  picks: "My picks"
};

const SUB_GROUP_LABEL = { fantasy: "Fantasy view", bets: "Bets view" };

/* sec 2.2's five slots in the order they are drawn, with the raised
 * ink + in the middle. */
const TAB_SLOTS = [
  { tab: "home", label: "Home", icon: "home" },
  { tab: "fantasy", label: "Fantasy", icon: "star" },
  { tab: null, label: ADD_TITLE, icon: "plus" },
  { tab: "projections", label: "Projections", icon: "chart" },
  { tab: "bets", label: "Bets", icon: "ticket" }
];

/* sec 3.4 — 2px stroke line icons, round caps, drawn inline so the
 * page names no icon host. */
const ICONS = {
  home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  star: "M12 3l2.6 5.6 6 .6-4.5 4 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.5-4 6-.6z",
  chart: "M4 19V5M4 19h16M8 15l4-5 3 3 5-6",
  ticket: "M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4zM10 7v12",
  plus: "M12 5v14M5 12h14",
  back: "M15 18l-6-6 6-6",
  next: "M9 18l6-6-6-6",
  profile: "M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6",
  alerts: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
  search: "M20 20l-4-4",
  close: "M6 6l12 12M18 6L6 18",
  chevron: "M6 9l6 6 6-6"
};

/* ------------------------------------------------------------------
 * THE HERO ART — sec 5.1, parameter for parameter
 * ------------------------------------------------------------------
 * Single-hue and white-only. Eight concentric circles around the
 * centre ring, radius 120 to 374, opacity .13 fading to .03; four
 * dotted circles around EACH side ring, radius 58 to 118, opacity .07
 * to .035, which is what makes the interference pattern where they
 * cross the ripples; a soft radial glow behind the centre; and
 * monochrome film grain at 7%. No additional hues, and nothing here
 * moves. */

const HERO_BOX = { width: 390, height: 360 };
const HERO_CENTRE = { x: 195, y: 184 };
const HERO_SIDES = [50, 340];
const HERO_RINGS = [
  [120, 0.13], [146, 0.11], [174, 0.095], [206, 0.08],
  [242, 0.065], [282, 0.05], [326, 0.04], [374, 0.03]
];
const HERO_DOTTED = [[58, 0.07], [74, 0.055], [94, 0.045], [118, 0.035]];
const HERO_DASH = "2 5";
const HERO_GRAIN = 0.07;
const HERO_GLOW = 0.22;

/* ------------------------------------------------------------------
 * the shell's state — held for the visit, written nowhere
 * ------------------------------------------------------------------ */

const nav = {
  tab: "home",
  /* sec 2.3: one stack per tab, each starting at its own root */
  stacks: {
    home: ["home"],
    fantasy: ["season"],
    projections: ["projections"],
    bets: ["screen"]
  },
  /* sec 2.3, as the owner's amendment extends it: a tab with
   * sub-views remembers the last one used, for Fantasy exactly as for
   * Bets. Remembered for the visit; written nowhere. */
  subs: { fantasy: "season", bets: "screen" },

  /* THE FIRST PAINT IS AT REST, and this null is what says so.
   *
   * sec 2.5 is a table of transitions BETWEEN screens — a push, a tab
   * switch, a sheet rising. None of them is "the app opened": there
   * is no launch animation in the handoff and there should be none
   * here. Booting with a motion set made the whole of `#screen` fade
   * up from the ground colour on first paint, which cost a real
   * defect: anything that looks at the page inside those 180ms — a
   * screenshot, a slow first frame, a reader on a tired phone — sees
   * the app half-composited. The hero is the worst of it, because
   * #2F353D at 50% over the ground is #929598, a flat mid-grey, with
   * the ring strokes showing through as brighter lines.
   *
   * So `motion` starts null and `booted` starts false: the first
   * render draws the screen and its lists exactly as they will sit,
   * and every transition after that is a CHANGE THE READER CAUSED. */
  motion: null,
  booted: false,
  /* WHICH SHEET IS UP, not whether one is. U1 had one sheet — the +
   * menu — so a boolean said everything there was to say. U6 adds the
   * read sheet, which is THE SAME COMPONENT over the same scrim with
   * the same close rules, so this holds its name instead: "add",
   * "read", or false for none. One renderer, two bodies; a second
   * overlay would be a second set of closing rules to get wrong. */
  sheet: false,
  toast: null,
  game: 0,
  /* the player a pick was opened for. U3 reads it; U2 only sets it. */
  pick: null,

  /* U2's own state, and it is held for the visit exactly as the rest
   * of this object is: the slate document once it has arrived (or
   * null, which is a real and drawn state), the reason it did not,
   * the chosen view, the ONE open row — sec 5.1: one at a time — and
   * the search panel with whatever has been typed into it. */
  slate: null,
  slateNote: null,
  view: "props",
  exp: null,
  search: false,
  query: "",

  /* U3's own state, held for the visit like the rest of it. The
   * Screen list's sort; which prop a pick card was opened on; the
   * service's answers once they have arrived (null means "not asked
   * or not answered", which is a drawn state, not an empty list); and
   * the slip being built, which is a draft and not a stored thing
   * until the service says it is. */
  sort: SORT_GAP,
  pickMarket: null,
  watch: null,
  slips: null,
  picksAsked: false,
  picksOffline: false,
  picksBusy: "",
  hasToken: false,
  track: { input: "paste", text: "", legs: [], unparsed: [],
    payout: "", stake: "", saved: null },

  /* U3c's own state, and it is HELD FOR THE VISIT LIKE THE REST OF IT
   * — in memory, never in storage. A picture is a private thing; it
   * goes to the service to be read, it is drawn back as a preview
   * while the reader is looking at it, and it leaves with the tab.
   *
   * `shot` is the picture currently chosen (its data URL for the
   * preview, its base64 and media type for the request); `capture` is
   * what the last reading did — busy, a named failure, or nothing.
   * `team` is the PROPOSAL being confirmed: the slots as the service
   * resolved them, the kind the reader picked, and the saved receipt
   * once the service has it. None of it is a stored thing until the
   * service says so. */
  shot: { slip: null, team: null },
  capture: { busy: "", note: "" },
  team: { slots: null, kind: "season_long", side: "mine",
    surface: null, saved: null },
  teams: null,

  /* U5's own state, and it is held for the visit like the rest.
   *
   * `opponents` is the second side of the same store — the newest
   * confirmed lineup per kind for the team he is PLAYING — and null
   * means "not asked or not answered", which is a drawn state and not
   * an empty opponent.
   *
   * `flex` is the FLEX call, and it is A VIEW OF HIS OWN LINEUP,
   * never a write: the captured team is untouched in the store, the
   * table draws whoever this names in the FLEX slot, and putting it
   * back is one tap. `dfs` is the weekly sheet's document.
   *
   * THE FLEX SWAP IS NOT A CONFIRMATION. Nothing about it reaches the
   * service: a lineup in the store is a lineup somebody confirmed
   * from a picture, and a swap he is trying out on screen is not
   * that. He saves a new lineup by confirming a new picture, exactly
   * as he did the first one. */
  opponents: null,
  flex: null,
  dfs: null,
  dfsNote: null,
  dfsAsked: false,

  /* U4's own state, and it is held for the visit like the rest of it.
   *
   * `live` is the service's last answer (null means "not asked or not
   * answered", which is a drawn state and not an empty board);
   * `liveBet` is the bet the card is open on; `liveSwing` is the
   * selected dot; `livePoll` is the interval handle, which exists
   * ONLY while the segment is on screen and visible.
   *
   * `series` is the one thing this page accumulates: `{bet_id: [the
   * points the service has handed it, in the order they arrived]}`.
   * Every point in it came off an answer — none is interpolated,
   * none is carried forward past the last update, and the whole of it
   * is dropped when the tab is closed. */
  live: null,
  liveNote: null,
  liveAsked: false,
  liveOffline: false,
  liveBet: null,
  liveSwing: null,
  livePoll: null,
  livePollMs: null,
  series: {},

  /* U6's own state, and it is the DRAFT plus what the service said
   * about it — held for the visit, written nowhere.
   *
   * `text` is what he has typed (kept across a re-render so nothing
   * eats a sentence). `saved` is the service's answer once it has
   * one, which is what makes the read a banked thing rather than a
   * draft. `spans` are HIS OWN WORDS as the service handed them back,
   * and `dropped` is which of them he has taken off — an index set on
   * the chips, never a taxonomy.
   *
   * THERE IS NO `read_p` HERE AND NO PLACE FOR ONE. Step 3 is the
   * effect library's and is not mocked; a field waiting for it would
   * be the mock. */
  read: { player: null, market: null, line: null, side: null,
    step: 1, text: "", saved: null, spans: [], dropped: {},
    busy: false, note: "" },

  /* THE PROJECTIONS STATE (U7, widened to the whole slate at sec 8b).
   * `projections` is the breakdown document once it has arrived (null
   * means "not asked or not answered", which is a drawn state and not
   * an empty week), `projNote` the reason it did not, `projGame` the
   * index of the game the switcher is on, and `proj` is which player
   * the detail is open on plus whatever has been typed into the
   * roster search. */
  projections: null,
  projNote: null,
  projAsked: false,
  projGame: 0,
  proj: { player: null, query: "" }
};

/* ------------------------------------------------------------------
 * small helpers — the lab's, spelled the same way
 * ------------------------------------------------------------------ */

function esc(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function el(id) {
  return document.getElementById(id);
}

/* An animation is restarted by taking the class off, forcing the
 * layout to settle, and putting it back — sec 2.5's "restart the
 * animation on every change" for Swap, and the same mechanism for
 * every other named transition. Under reduced motion the class does
 * nothing at all, because the media query has already zeroed it. */
function restart(node, className) {
  if (!node) return;
  node.classList.remove(className);
  void node.offsetWidth;
  node.classList.add(className);
}

function icon(name, size, strokeWidth) {
  const width = size || 22;
  return '<svg width="' + width + '" height="' + width +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
    (strokeWidth || 2) + '" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true"><path d="' + esc(ICONS[name]) + '"></path></svg>';
}

/* ------------------------------------------------------------------
 * sec 2.3 — the navigation model
 * ------------------------------------------------------------------ */

function rootOf(tab) {
  /* a tab with sub-views has no root of its own: its root is
   * whichever sub-view was last used */
  return TAB_SUBS[tab] ? nav.subs[tab] : tab;
}

function currentStack() {
  return nav.stacks[nav.tab];
}

function currentRoute() {
  const stack = currentStack();
  return stack[stack.length - 1];
}

/* TAPPING A TAB RESETS THAT TAB TO ITS ROOT. Not "returns to where you
 * were": the handoff says reset, and a stack that survived the tap
 * would make the tab bar a history control. */
function selectTab(tab) {
  if (!nav.stacks[tab]) return;
  nav.tab = tab;
  nav.stacks[tab] = [rootOf(tab)];
  closeSheet();
  navigate(currentRoute(), "tab");
}

/* A DETAIL PUSHES onto the stack the reader is standing in, whichever
 * tab that is. */
function openDetail(route) {
  if (!ROUTES[route] || ROUTES[route].root) return;
  currentStack().push(route);
  closeSheet();
  navigate(route, "push");
}

/* A CROSS-TAB LINK (U7). The nav model already says what this means:
 * the detail PUSHES onto the stack of the tab it belongs to, and the
 * reader is moved to that tab. So back from it pops to that tab's
 * root, which is where he would have come from had he walked in.
 * This is the same push `openDetail` does — it just does it on
 * somebody else's stack, which is the one thing that function cannot
 * say. */
function openIn(tab, route) {
  if (!ROUTES[route] || ROUTES[route].root) return;
  if (!nav.stacks[tab]) return;
  nav.tab = tab;
  nav.stacks[tab] = [rootOf(tab), route];
  closeSheet();
  navigate(route, "push");
}

/* AND THE CHEVRON POPS. A root has nothing to pop to, so the chevron
 * is not drawn there. */
function goBack() {
  const stack = currentStack();
  if (stack.length < 2) return;
  stack.pop();
  navigate(currentRoute(), "pop");
}

/* A SUB-VIEW TOGGLE SWAPS THAT TAB'S ROOT WITHOUT PUSHING. The stack
 * is REPLACED, not extended, so back from a pick opened on Live
 * returns to Live and never to Screen — and the same is now true of
 * Fantasy's Season long and DFS. One function, both toggles: a second
 * copy of this rule is how two tabs drift apart. */
function swapSub(tab, sub) {
  const subs = TAB_SUBS[tab];
  if (!subs || subs.indexOf(sub) < 0) return;
  nav.subs[tab] = sub;
  nav.tab = tab;
  nav.stacks[tab] = [sub];
  navigate(sub, "tab");
}

/* An address that names a TAB rather than a screen — `#/fantasy`,
 * `#/bets` — resolves to that tab's REMEMBERED sub-view, and is then
 * normalised to that screen's own address. Links written before the
 * owner's amendment split Fantasy in two therefore still land
 * somewhere true instead of falling back to Home. */
const TAB_HASHES = { "#/fantasy": "fantasy", "#/bets": "bets" };

function routeFromHash() {
  const hash = String(window.location.hash || "");
  for (const name in ROUTES) {
    if (ROUTES[name].hash === hash) return name;
  }
  if (TAB_HASHES[hash]) return rootOf(TAB_HASHES[hash]);
  return "home";
}

/* The address always names the screen that is actually on top. An
 * empty hash, a tab-level hash or one that names nothing at all is
 * rewritten to the canonical one — with `replaceState`, so it does
 * not fire a second hashchange, draw a second time, or leave a dead
 * address in the reader's history to go back to. */
function normalizeHash() {
  const wanted = ROUTES[currentRoute()].hash;
  if (String(window.location.hash || "") === wanted) return;
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, "", wanted);
  } else {
    window.location.hash = wanted;
  }
}

/* Every move goes through the address, so the browser's own back
 * button walks the same stack the chevron does. */
function navigate(route, motion) {
  nav.motion = motion;
  nav.toast = null;
  const wanted = ROUTES[route].hash;
  if (String(window.location.hash) === wanted) {
    render();
    return;
  }
  window.location.hash = wanted;
}

/* A hash this file did not just write — the back button, a forward,
 * or an address typed in cold. The stack is reconciled to it rather
 * than fought with. */
function applyHash() {
  const route = routeFromHash();
  const stack = currentStack();
  if (stack[stack.length - 1] === route) return;

  const at = stack.indexOf(route);
  if (at >= 0) {
    nav.stacks[nav.tab] = stack.slice(0, at + 1);
    nav.motion = "pop";
    return;
  }
  const owner = ROUTES[route].tab;
  nav.tab = owner;
  if (ROUTES[route].root) {
    if (TAB_SUBS[owner]) nav.subs[owner] = route;
    nav.stacks[owner] = [route];
    nav.motion = "tab";
    return;
  }
  nav.stacks[owner] = [rootOf(owner), route];
  nav.motion = "push";
}

/* ------------------------------------------------------------------
 * sec 2.5 — the toast and the sheet
 * ------------------------------------------------------------------ */

/* One toast at a time, above the tab bar, optionally carrying one
 * action button. */
function showToast(text, actionLabel, actionRoute) {
  nav.toast = {
    text: text,
    label: actionLabel || "",
    route: actionRoute || ""
  };
  renderToast();
}

function closeToast() {
  nav.toast = null;
  renderToast();
}

/* ONE SHEET COMPONENT, TWO BODIES (U6). `kind` names which body is
 * drawn; everything else about it — the scrim, the handle, the rise,
 * Escape, tapping away — is the same because it is the same
 * component. */
function openSheet(kind) {
  nav.sheet = kind || "add";
  nav.toast = null;
  renderToast();
  renderSheet();
}

function closeSheet() {
  if (!nav.sheet) return;
  nav.sheet = false;
  renderSheet();
}

/* ------------------------------------------------------------------
 * sec 5.1 — the hero
 * ------------------------------------------------------------------ */

function heroArt() {
  const parts = [];
  parts.push('<svg class="heroart" viewBox="0 0 ' + HERO_BOX.width + ' ' +
    HERO_BOX.height + '" preserveAspectRatio="xMidYMid slice" ' +
    'aria-hidden="true" focusable="false">');
  parts.push('<defs>');
  /* THE GRAIN'S 7% LIVES INSIDE THE FILTER, and this is deliberate.
   *
   * A turbulence filter REPLACES its source graphic: what the rect
   * below paints is the noise itself, at full strength, over the
   * whole hero. The 7% is therefore the only thing standing between a
   * dark slate hero and a flat mid-grey one — and when it rode the
   * rect as an `opacity` attribute, a renderer that did not apply it
   * turned the whole hero #939597. That was seen in a headless render
   * and reproduced here by dropping the attribute.
   *
   * So the fade is now part of the filter RESULT: `feFuncA` scales
   * the noise's alpha to HERO_GRAIN before it is ever composited.
   * Same number, same look, but it is no longer an attribute that can
   * be lost. The rect is `fill="none"` for the same reason — if the
   * filter itself fails to resolve, the fallback paints nothing
   * rather than a slab of black. The failure direction is now always
   * "no grain", never "no hero". */
  parts.push('<filter id="appgrain" x="0" y="0" width="100%" height="100%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" ' +
    'stitchTiles="stitch"></feTurbulence>' +
    '<feColorMatrix type="saturate" values="0"></feColorMatrix>' +
    '<feComponentTransfer><feFuncA type="linear" slope="' + HERO_GRAIN +
    '"></feFuncA></feComponentTransfer></filter>');
  parts.push('<radialGradient id="appglow" cx="50%" cy="51%" r="60%">' +
    '<stop offset="0%" stop-color="#A9B6C6" stop-opacity="' + HERO_GLOW + '"></stop>' +
    '<stop offset="100%" stop-color="#A9B6C6" stop-opacity="0"></stop>' +
    '</radialGradient>');
  parts.push('</defs>');
  parts.push('<rect x="0" y="0" width="' + HERO_BOX.width + '" height="' +
    HERO_BOX.height + '" fill="url(#appglow)"></rect>');

  HERO_RINGS.forEach(function (ring) {
    parts.push('<circle cx="' + HERO_CENTRE.x + '" cy="' + HERO_CENTRE.y +
      '" r="' + ring[0] + '" fill="none" stroke="#FFFFFF" stroke-opacity="' +
      ring[1] + '" stroke-width="1"></circle>');
  });
  HERO_SIDES.forEach(function (cx) {
    HERO_DOTTED.forEach(function (ring) {
      parts.push('<circle cx="' + cx + '" cy="' + HERO_CENTRE.y + '" r="' +
        ring[0] + '" fill="none" stroke="#FFFFFF" stroke-opacity="' + ring[1] +
        '" stroke-width="1" stroke-dasharray="' + HERO_DASH + '"></circle>');
    });
  });

  parts.push('<rect x="0" y="0" width="' + HERO_BOX.width + '" height="' +
    HERO_BOX.height + '" fill="none" filter="url(#appgrain)"></rect>');
  parts.push('</svg>');
  return parts.join("");
}

/* The three nav rings: text only, no numbers (sec 4), each wired to
 * its own tab — and Bets to whichever sub-view was last used. */
function heroRings() {
  return [
    '<button class="ring side left" data-act="tab" data-tab="fantasy" ',
    'aria-label="Open Fantasy">', esc(TITLE_FANTASY), '</button>',
    '<button class="ring centre" data-act="tab" data-tab="projections" ',
    'aria-label="Open Projections">', esc(TITLE_PROJECTIONS), '</button>',
    '<button class="ring side right" data-act="tab" data-tab="bets" ',
    'aria-label="Open Bets">', esc(TITLE_BETS), '</button>'
  ].join("");
}

function heroTop() {
  return '<div class="herotop">' +
    (onFixtures()
      ? '<div class="sampletag">' + esc(SAMPLE_TAG) + '</div>'
      : '<div class="sampletag off"></div>') +
    '<div class="wordmark">' + esc(WORDMARK) + '</div>' +
    '<div class="heroicons">' +
    '<button class="iconbtn" data-act="open" data-route="report" ' +
    'aria-label="Your reads">' +
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'aria-hidden="true"><circle cx="12" cy="8" r="4"></circle>' +
    '<path d="' + esc(ICONS.profile) + '"></path></svg></button>' +
    '<button class="iconbtn" data-act="note" data-note="' + esc(NOTE_ALERTS) +
    '" aria-label="Alerts">' + icon("alerts") + '</button>' +
    '</div></div>';
}

function skeletonRows(widths) {
  return widths.map(function (width, index) {
    return '<div class="skelrow' + growClass() + '" style="--i:' +
      index + '">' +
      '<div class="skelbar lead"></div>' +
      '<div class="skelbar" style="width:' + width + '%"></div>' +
      '<div class="skelbar tail"></div></div>';
  }).join("");
}

function stubCard(overline, heading, body) {
  return '<div class="card">' +
    '<div class="overline">' + esc(overline) + '</div>' +
    '<div class="cardhead">' + esc(heading) + '</div>' +
    '<div class="cardbody">' + esc(body) + '</div></div>';
}

function stubRows(rows, mark, route) {
  return rows.map(function (row, index) {
    return '<button class="stubrow' + growClass() + '" style="--i:' +
      index + '" ' +
      'data-act="open" data-route="' + esc(route) + '" ' +
      'aria-label="' + esc(row.name + ", " + row.note + ". Sample row; " +
      mark) + '">' +
      '<span class="stubcol"><span class="stubname">' + esc(row.name) +
      '</span><span class="stubnote">' + esc(row.note) + '</span></span>' +
      '<span class="stubmark">' + esc(mark) + '</span></button>';
  }).join("");
}

/* ------------------------------------------------------------------
 * U2 — reading the slate document
 * ------------------------------------------------------------------ */

/* ONE fetch in this file, so there is one timeout and one error shape.
 * `no-store` because the file is rewritten on every deploy and a
 * cached yesterday is the one thing this screen must never show. */
async function getJSON(url, options) {
  const controller = new AbortController();
  const timer = window.setTimeout(function () { controller.abort(); },
    FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, Object.assign({
      signal: controller.signal, cache: "no-store" }, options || {}));
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------
 * U3 — the picks service, through that one fetch
 * ------------------------------------------------------------------ */

/* Both touches guarded, the lab's way: a browser that refuses storage
 * still lets him paste a token for the visit. */
function readToken() {
  try {
    return window.localStorage.getItem(PICKS_TOKEN_KEY) || "";
  } catch (err) {
    return "";
  }
}

function writeToken(token) {
  try {
    window.localStorage.setItem(PICKS_TOKEN_KEY, token);
    return true;
  } catch (err) {
    return false;
  }
}

/* Asked when he ASKS to connect, and on the first write that needs
 * it. Nothing is prompted merely to look at a screen. */
function askToken() {
  const held = readToken();
  if (held) return held;
  let typed = "";
  try {
    typed = window.prompt(CONNECT_PROMPT) || "";
  } catch (err) {
    typed = "";
  }
  typed = typed.trim();
  if (typed) writeToken(typed);
  nav.hasToken = !!typed;
  return typed;
}

/* Every call to the service carries the bearer token and nothing else
 * about the reader, and every one of them goes through the page's ONE
 * fetch, because a second one would be a second timeout and a second
 * error shape to get wrong. */
async function picksAsk(path, token, body, method) {
  const headers = { Authorization: "Bearer " + token };
  if (body) headers["Content-Type"] = "application/json";
  return getJSON(SERVICE_URL + path, {
    method: method || (body ? "POST" : "GET"),
    headers: headers,
    body: body ? JSON.stringify(body) : undefined
  });
}

/* The segment asks ONCE per visit. A fabricated slate never writes to
 * the real service and never reads from it either: a demo page that
 * loaded somebody's real watchlist would be a sample screen showing
 * real rows. */
async function loadPicks(force) {
  if (DEMO) return;
  if (nav.picksAsked && !force) return;
  const token = readToken();
  nav.hasToken = !!token;
  if (!token) {
    nav.picksAsked = true;
    render();
    return;
  }
  nav.picksAsked = true;
  try {
    const watch = await picksAsk("/watchlist", token, null);
    const slips = await picksAsk("/slips", token, null);
    nav.watch = (watch && watch.watchlist) || [];
    nav.slips = (slips && slips.slips) || [];
    nav.picksOffline = false;
  } catch (err) {
    nav.picksOffline = true;
  }
  render();
}

/* THE BOOKMARK. It is a state on the service, so the button waits for
 * the service to say so before it changes: "saved" here means the row
 * exists, exactly as "saved" means the ledger has it on a read. */
async function toggleWatch(playerId, market, line, side) {
  if (DEMO) {
    showToast(SERVICE_DEMO);
    return;
  }
  const token = askToken();
  if (!token) return;
  const held = watchedEntry(playerId, market);
  nav.picksBusy = playerId + "|" + market;
  render();
  try {
    if (held) {
      await picksAsk("/watchlist/remove", token,
        { player_id: playerId, market: market });
      nav.watch = (nav.watch || []).filter(function (row) {
        return !(row.player_id === playerId && row.market === market);
      });
      nav.picksOffline = false;
      nav.picksBusy = "";
      render();
      showToast(PICK_WATCH_GONE);
      return;
    }
    const saved = await picksAsk("/watchlist", token, {
      player_id: playerId, market: market, line: line, side: side });
    nav.watch = [{
      watchlist_id: saved.watchlist_id, player_id: playerId,
      market: market, line: saved.line === undefined ? line : saved.line,
      side: saved.side === undefined ? side : saved.side,
      added_at: saved.added_at || null, removed_at: null
    }].concat((nav.watch || []).filter(function (row) {
      return !(row.player_id === playerId && row.market === market);
    }));
    nav.picksOffline = false;
    nav.picksBusy = "";
    render();
    showToast(PICK_WATCH_SAVED);
  } catch (err) {
    /* Never a silent drop: the bookmark does not change and the line
     * under it says the service is not answering. */
    nav.picksOffline = true;
    nav.picksBusy = "";
    render();
  }
}

/* ------------------------------------------------------------------
 * U6 — THE READ, THROUGH THE SAME DOOR
 * ------------------------------------------------------------------
 * The same service, the same token, the same one fetch. `POST /read`
 * already takes the pick's own context — player, market, line, side —
 * so a read opened from a pick card arrives attached to that bet
 * without the service learning a new field for it.
 *
 * THE READ IS BANKED WHEN THE SERVICE SAYS SO, which is at "Read it"
 * and not at Confirm: the service interprets, validates and writes in
 * one transaction and only then answers, exactly as the lab's box has
 * always worked. So the confirm step is not a "do you want to save
 * this" gate — it is him checking that what we picked up is what he
 * meant, and the sheet says plainly that his words are already kept.
 *
 * DROPPING A CHIP IS THEREFORE AN EDIT, not a veto. The words come out
 * of the text and the shorter read is READ AGAIN — a second row beside
 * the first, because the ledger is append-only and a correction is a
 * thing that happened, not a thing that unhappens. The sheet says that
 * too, in one sentence, where he does it. */

function readOpen(playerId, market) {
  const person = playerOf(playerId);
  const prop = person ? propOf(person, market) : null;
  nav.read = {
    player: playerId || null,
    market: prop ? prop.market : (market || null),
    line: prop ? numberOrNull(prop.line) : null,
    side: prop ? prop.lean : null,
    step: 1, text: "", saved: null, spans: [], dropped: {},
    busy: false, note: ""
  };
  openSheet("read");
}

/* The chips he has NOT dropped, in the order they came back. */
function readKept() {
  return (nav.read.spans || []).filter(function (_span, index) {
    return !nav.read.dropped[index];
  });
}

function readHasDrops() {
  return (nav.read.spans || []).some(function (_span, index) {
    return !!nav.read.dropped[index];
  });
}

/* WHAT A DROP DOES TO THE TEXT, and it is the least this page can do
 * to it: the dropped fragment is cut out of what he wrote and the
 * seam is tidied. Nothing is rewritten, nothing is re-ordered and no
 * word he did not type is added. */
function readTextWithoutDrops() {
  let text = String(nav.read.text || "");
  /* NOTHING DROPPED, NOTHING TOUCHED. Even collapsing his spacing
   * would be this page editing words he wrote. */
  if (!readHasDrops()) return text;
  (nav.read.spans || []).forEach(function (span, index) {
    if (!nav.read.dropped[index]) return;
    text = text.split(span).join(" ");
  });
  return text.replace(/\s+/g, " ").replace(/\s+([.,;!?])/g, "$1").trim();
}

/* THE SAVE. Synchronous from his side, the lab's rule: the sheet
 * moves to the confirm step only once the ledger has the read. */
async function postRead() {
  if (nav.read.busy) return;
  if (DEMO) {
    nav.read.note = READ_DEMO;
    renderSheet();
    return;
  }
  const text = (nav.read.step === 2 ? readTextWithoutDrops()
    : String(nav.read.text || "")).trim();
  if (!text) {
    nav.read.note = READ_EMPTY;
    renderSheet();
    return;
  }
  if (!nav.read.player) {
    nav.read.note = READ_NO_PICK;
    renderSheet();
    return;
  }
  const token = askToken();
  if (!token) {
    renderSheet();
    return;
  }
  const body = { player_id: nav.read.player, text: text };
  if (nav.read.market) body.market = nav.read.market;
  if (nav.read.line !== null && nav.read.line !== undefined) {
    body.line = nav.read.line;
  }
  if (nav.read.side) body.side = nav.read.side;
  nav.read.busy = true;
  nav.read.note = "";
  renderSheet();
  try {
    const saved = await picksAsk("/read", token, body);
    nav.read.saved = saved;
    nav.read.text = saved && saved.text ? saved.text : text;
    /* THE CHIPS ARE WHAT THE SERVICE SENT AND NOTHING ELSE. No span
     * is worked out here: a page that split his sentence itself would
     * be showing him its own reading under the words "what we
     * understood". An answer with none is a real and drawn state. */
    nav.read.spans = (saved && Array.isArray(saved.spans))
      ? saved.spans : [];
    nav.read.dropped = {};
    nav.read.step = 2;
    nav.read.note = nav.read.spans.length ? "" : READ_NOTHING_FOUND;
  } catch (err) {
    /* Never a silent drop: the words stay in the box and the line
     * under it says the service is not answering. */
    nav.read.note = READ_OFFLINE;
  }
  nav.read.busy = false;
  renderSheet();
}

/* CONFIRM. The read is already banked, so this closes the sheet and
 * says the one thing R0 can honestly say about it — a promise with a
 * moment attached, which is the credibility rule's shape. */
function confirmRead() {
  closeSheet();
  showToast(READ_SAVED_TOAST);
}

/* ------------------------------------------------------------------
 * U4 — THE LIVE POLL
 * ------------------------------------------------------------------
 * Delivery is a CLIENT POLL and nothing else: no push, no socket, no
 * new credential (UI_ALPHA_SPEC sec 6b). The rules it keeps:
 *
 *   IT ASKS ONLY WHILE SOMEBODY IS LOOKING. The interval exists while
 *   the Live segment or the Live card is the screen AND the tab is
 *   visible, and it is cleared the moment either stops being true —
 *   a backgrounded phone must not poll a service all afternoon.
 *
 *   IT KEEPS THE SERVICE'S CADENCE. `poll_interval_s` rides the
 *   answer, so the page never holds a cadence the service did not
 *   state.
 *
 *   IT ACCUMULATES WHAT IT WAS HANDED. Each answer's points are
 *   appended to the series already held for that bet, in the order
 *   they arrived, and a point that is not newer than the last one
 *   held is not appended twice. Nothing is computed. */

function liveOnScreen() {
  const route = currentRoute();
  return route === "live" || route === "card";
}

function liveHidden() {
  try {
    return document.visibilityState === "hidden";
  } catch (err) {
    return false;
  }
}

function livePollMs() {
  const stated = nav.live && numberOrNull(nav.live.poll_interval_s);
  return stated === null ? LIVE_POLL_MS : stated * 1000;
}

/* THE ONE PLACE THE POLL IS TURNED ON OR OFF. `render()` calls it on
 * every screen change and the visibility listener calls it when the
 * tab is hidden or shown, so there is no path that leaves an interval
 * running behind a screen nobody is on. */
function syncLivePoll() {
  const wanted = !DEMO && nav.hasToken && liveOnScreen() && !liveHidden();
  if (!wanted) {
    if (nav.livePoll) {
      window.clearInterval(nav.livePoll);
      nav.livePoll = null;
    }
    return;
  }
  const every = livePollMs();
  if (nav.livePoll && nav.livePollMs !== every) {
    /* THE CADENCE IS THE SERVICE'S. The first answer states it, and
     * an interval armed before that answer is re-armed to it rather
     * than kept on this file's fallback. */
    window.clearInterval(nav.livePoll);
    nav.livePoll = null;
  }
  if (!nav.livePoll) {
    nav.livePollMs = every;
    nav.livePoll = window.setInterval(function () {
      loadLive(true);
    }, every);
  }
  /* The first ask is immediate and every later one is the interval's.
   * `liveAsked` is what keeps this from being a second poll: a render
   * that happens between two ticks asks nothing. */
  loadLive(false);
}

/* ONE ANSWER, ACCUMULATED. Every point here came off the service; the
 * only decision this function makes is whether a point is new, and it
 * makes it by comparing the stored `t` it was handed. */
function accumulate(answer) {
  (answer.bets || []).forEach(function (bet) {
    const held = nav.series[bet.bet_id] || [];
    (bet.trace || []).forEach(function (point) {
      const last = held.length ? held[held.length - 1] : null;
      if (last && !(point.t > last.t)) return;
      held.push(point);
    });
    nav.series[bet.bet_id] = held;
  });
}

function seriesFor(bet) {
  if (!bet) return [];
  const held = nav.series[bet.bet_id];
  return held && held.length ? held : (bet.trace || []);
}

async function loadLive(force) {
  if (DEMO) return;
  if (nav.liveAsked && !force) return;
  const token = readToken();
  nav.hasToken = !!token;
  if (!token) {
    nav.liveAsked = true;
    render();
    return;
  }
  const week = slateWeekNumbers();
  if (!week) {
    nav.liveAsked = true;
    nav.liveNote = LIVE_NO_SLATE;
    render();
    return;
  }
  nav.liveAsked = true;
  try {
    const answer = await picksAsk(
      "/live?season=" + encodeURIComponent(week.season) +
      "&week=" + encodeURIComponent(week.week), token, null);
    nav.live = answer;
    nav.liveNote = null;
    nav.liveOffline = false;
    accumulate(answer);
  } catch (err) {
    /* Never a silent drop and never a stale number dressed as a fresh
     * one: the board says the service is not answering and the line
     * stops where the last update left it. */
    nav.liveOffline = true;
  }
  render();
}

/* Which slate to ask about. The slate document already says, so the
 * page does not derive a second answer to that question. */
function slateWeekNumbers() {
  const run = nav.slate && nav.slate.run;
  const season = run ? numberOrNull(run.season) : null;
  const week = run ? numberOrNull(run.week) : null;
  if (season === null || week === null) return null;
  return { season: season, week: week };
}

/* ------------------------------------------------------------------
 * U3c — READING A PICTURE
 * ------------------------------------------------------------------
 * The picture goes to the service, which reads it under a schema our
 * own code built and answers with a PROPOSAL. Nothing about that
 * answer is stored anywhere until the reader confirms it: a slip goes
 * through the same Track this slip button a pasted one does, and a
 * team goes through Save my team.
 *
 * THE PICTURE IS NEVER KEPT. It is held in memory for as long as the
 * reader is looking at the preview and it is written to no storage —
 * the token is still the only thing this app puts in his browser. */

/* What a browser may hand over. The same four the service reads, and
 * a file that is not one of them is refused HERE, before anything is
 * sent: telling him on the spot beats a round trip to be told no. */
const SHOT_TYPES = ["image/png", "image/jpeg", "image/webp",
  "image/gif"];

/* The three doors, in the service's own words for them. The toggle
 * says "Screenshot" to the reader and the stored row says
 * `screenshot`, which is the mapping done in one place. */
const SLIP_INPUTS = { paste: "paste", manual: "manual",
  shot: "screenshot" };

/* FOUR MEGABYTES, the service's own cap, checked on this side too so
 * an oversized picture is named rather than uploaded and refused. It
 * is the service's number; this is not a second rule. */
const SHOT_MAX_BYTES = 4 * 1024 * 1024;

/* A chosen file -> `{ url, b64, media }`, or a named refusal. The
 * data URL is what the preview draws; the part after the comma is
 * what the service reads. */
function readShot(file) {
  return new Promise(function (resolve, reject) {
    if (!file) {
      reject(new Error(SHOT_WRONG_KIND));
      return;
    }
    if (SHOT_TYPES.indexOf(file.type) < 0) {
      reject(new Error(SHOT_WRONG_KIND));
      return;
    }
    if (file.size > SHOT_MAX_BYTES) {
      reject(new Error(SHOT_TOO_BIG));
      return;
    }
    const reader = new FileReader();
    reader.onerror = function () {
      reject(new Error(SHOT_FAILED));
    };
    reader.onload = function () {
      const url = String(reader.result || "");
      const comma = url.indexOf(",");
      if (comma < 0) {
        reject(new Error(SHOT_FAILED));
        return;
      }
      resolve({ url: url, b64: url.slice(comma + 1),
        media: file.type, name: file.name || "" });
    };
    reader.readAsDataURL(file);
  });
}

/* The picture chosen, held for the preview. Choosing a new one
 * clears the last reading: a preview of one picture beside the rows
 * of another is the worst screen this feature could draw. */
function chooseShot(which, file) {
  nav.capture = { busy: "", note: "" };
  readShot(file).then(function (shot) {
    nav.shot[which] = shot;
    if (which === "team") {
      nav.team.slots = null;
      nav.team.saved = null;
    } else {
      nav.track.saved = null;
    }
    render();
  }).catch(function (err) {
    nav.shot[which] = null;
    nav.capture = { busy: "", note: err.message || SHOT_FAILED };
    render();
  });
}

/* THE READING. One request, through the page's one fetch, carrying
 * the bearer token and the picture and nothing else about the
 * reader. The answer is a proposal and is drawn as one. */
async function readPicture(which) {
  if (DEMO) {
    showToast(SERVICE_DEMO);
    return;
  }
  const shot = nav.shot[which];
  if (!shot || nav.capture.busy) return;
  const token = askToken();
  if (!token) return;
  nav.capture = { busy: which, note: "" };
  render();
  try {
    const answer = await picksAsk("/capture", token, {
      kind: which === "team" ? "lineup" : "slip",
      image_b64: shot.b64, media_type: shot.media });
    nav.capture = { busy: "", note: "" };
    nav.picksOffline = false;
    if (which === "team") {
      takeTeamProposal(answer);
    } else {
      takeSlipProposal(answer);
    }
  } catch (err) {
    /* Never a silent drop and never a half-read: the rows the reader
     * had stay as they were and the line under the button says what
     * happened. */
    nav.capture = { busy: "", note: SHOT_FAILED };
    nav.picksOffline = true;
    render();
  }
}

/* A SLIP PROPOSAL JOINS THE FLOW A PASTED SLIP ALREADY USES. Each
 * extracted leg is written back out as one line of text and put
 * through `parseSlip` — the SAME parser, so there is one rule for
 * what counts as a leg whichever door it came through, and a row we
 * cannot match to a published prop falls to manual entry exactly as
 * an unparsed pasted line does.
 *
 * Where the service resolved a name against our own crosswalk, the
 * line is written with the name THAT PLAYER is listed under here,
 * because matching our own spelling to our own slate is what the
 * parser is good at. Where it did not, the picture's own words are
 * used and the row falls through honestly. */
function takeSlipProposal(answer) {
  const legs = (answer && answer.legs) || [];
  if (!legs.length) {
    nav.capture = { busy: "", note: SHOT_NOTHING_FOUND };
    render();
    return;
  }
  parseIntoTrack(legs.map(shotLegLine).join("\n"));
  showToast(SHOT_READ_DONE);
}

function shotLegLine(leg) {
  const person = leg.resolved ? playerOf(leg.player_id) : null;
  return [person ? person.name : (leg.player_text || ""),
    leg.side === "less" ? "less" : "more",
    leg.line === null || leg.line === undefined ? "" : leg.line,
    leg.market || ""].join(" ").replace(/\s+/g, " ").trim();
}

/* A TEAM PROPOSAL IS HELD FOR CONFIRMATION and nothing else. Every
 * row is editable and removable before Save my team, and the rows we
 * could not match say so rather than being filled in with a guess. */
function takeTeamProposal(answer) {
  const slots = (answer && answer.slots) || [];
  if (!slots.length) {
    nav.capture = { busy: "", note: SHOT_NOTHING_FOUND };
    render();
    return;
  }
  nav.team.surface = (answer && answer.surface_text) || null;
  nav.team.saved = null;
  nav.team.slots = slots.map(function (slot) {
    const person = slot.resolved ? playerOf(slot.player_id) : null;
    return {
      slot_label: slot.slot_label || "",
      player_id: slot.resolved ? slot.player_id : null,
      player_text: slot.player_text || "",
      name: person ? person.name : "",
      salary: slot.salary === undefined ? null : slot.salary,
      opponent_text: slot.opponent_text || null,
      resolved: !!slot.resolved
    };
  });
  render();
  showToast(SHOT_READ_DONE);
}

/* THE CONFIRMATION. What is sent is what is on the screen after the
 * reader has edited it — never what the picture said. */
async function saveTeam() {
  if (DEMO) {
    showToast(SERVICE_DEMO);
    return;
  }
  const slots = nav.team.slots || [];
  if (!slots.length || nav.picksBusy === "team") return;
  const token = askToken();
  if (!token) return;
  const week = slateWeek();
  if (!week) return;
  nav.picksBusy = "team";
  render();
  try {
    const saved = await picksAsk("/team", token, {
      /* U5: WHOSE LINEUP THIS IS travels with the confirmation, so
       * the store keeps his team and his opponent's apart without
       * anything here having to remember which is on screen. */
      kind: nav.team.kind, side: nav.team.side,
      season: week.season, week: week.week,
      slots: slots.map(function (slot) {
        return {
          slot_label: slot.slot_label,
          player_id: slot.player_id,
          player_text: slot.player_text,
          salary: slot.salary,
          opponent_text: slot.opponent_text
        };
      })
    });
    nav.team.saved = saved;
    nav.teams = null;
    nav.opponents = null;
    /* A newly confirmed lineup is a different lineup, so the FLEX
     * call starts again from what the picture actually said. */
    nav.flex = null;
    nav.picksOffline = false;
    nav.picksBusy = "";
    render();
    loadTeams(true);
    showToast(TEAM_SAVED);
  } catch (err) {
    nav.picksOffline = true;
    nav.picksBusy = "";
    render();
  }
}

/* The teams the service is holding, asked for once per visit like
 * the watchlist and the slips beside them. */
async function loadTeams(force) {
  if (DEMO) return;
  const token = readToken();
  if (!token) return;
  if (nav.teams && !force) return;
  try {
    const answer = await picksAsk("/team", token, null);
    nav.teams = (answer && answer.teams) || {};
    /* U5: the other side of the same answer. An opponent nobody has
     * captured is simply absent from it, which is what the matchup
     * card reads to decide whether it has two sides or one. */
    nav.opponents = (answer && answer.opponents) || {};
    nav.picksOffline = false;
  } catch (err) {
    nav.picksOffline = true;
  }
  render();
}

/* ------------------------------------------------------------------
 * U5 — THE DFS DOCUMENT
 * ------------------------------------------------------------------
 * `loadSlate`'s rule, applied to the second document: it either
 * arrived or it did not, there is no cached yesterday, and a shape
 * this build does not know is refused out loud rather than read
 * field by field on a guess. */
async function loadDfs() {
  nav.dfsAsked = true;
  try {
    const document = await getJSON(DFS_URL);
    if (!document || document.dfs_schema !== DFS_SCHEMA) {
      nav.dfs = null;
      nav.dfsNote = DFS_OFFLINE_SCHEMA;
    } else {
      nav.dfs = document;
      nav.dfsNote = null;
    }
  } catch (err) {
    nav.dfs = null;
    nav.dfsNote = DFS_OFFLINE_BODY;
  }
  render();
}

/* ASKED FOR WHEN IT IS LOOKED AT, once. `syncLivePoll`'s rule without
 * the poll: the weekly sheet does not change while the reader is on
 * the screen, so this is one request the first time the DFS sub-view
 * is drawn and nothing after it. A reader who never opens the tab
 * never fetches it. */
function syncDfs() {
  if (nav.dfsAsked) return;
  if (currentRoute() !== "dfs") return;
  loadDfs();
}

/* U7 — THE BREAKDOWN DOCUMENT, read exactly as the other two are: the
 * schema tag before any field, the honest arm when it does not
 * arrive, and nothing carried forward from a document that failed its
 * own contract. */
async function loadProjections() {
  nav.projAsked = true;
  try {
    const document = await getJSON(PROJECTIONS_URL);
    if (!document ||
        document.projections_schema !== PROJECTIONS_SCHEMA) {
      nav.projections = null;
      nav.projNote = PROJ_OFFLINE_SCHEMA;
    } else {
      nav.projections = document;
      nav.projNote = null;
    }
  } catch (err) {
    nav.projections = null;
    nav.projNote = PROJ_OFFLINE_BODY;
  }
  render();
}

/* ...and asked for on the same rule, on either of the two screens
 * that read it: a reader who never opens Projections never fetches
 * it, and one who arrives straight on a player's breakdown from a
 * pick card fetches it once, there. */
function syncProjections() {
  if (nav.projAsked) return;
  const route = currentRoute();
  if (route !== "projections" && route !== "projection") return;
  loadProjections();
}

/* The season and week the confirmed team is FOR. It is the slate
 * document's own, never this page's clock: a team stamped with a week
 * nothing else on the screen agrees with is a team nobody can read
 * back. Without a document there is nothing to stamp and the save
 * does not happen. */
function slateWeek() {
  const run = nav.slate && nav.slate.run;
  if (!run || !run.season || !run.week) {
    showToast(OFFLINE_BODY);
    return null;
  }
  return { season: run.season, week: run.week };
}

/* THE SAVE. The slip's own numbers come BACK from the service, which
 * computed and stored them; the preview this page drew before the
 * save is replaced by the stored answer rather than kept beside it. */
async function saveSlip() {
  if (DEMO) {
    showToast(SERVICE_DEMO);
    return;
  }
  const legs = nav.track.legs;
  if (!legs.length || nav.picksBusy === "slip") return;
  const token = askToken();
  if (!token) return;
  nav.picksBusy = "slip";
  render();
  try {
    const saved = await picksAsk("/slips", token, {
      /* WHICH DOOR THE SLIP CAME THROUGH, recorded because it is a
       * fact about the slip. The three doors produce the same object
       * and the same arithmetic prices it; which one it was is worth
       * knowing when a leg turns out wrong. */
      input: SLIP_INPUTS[nav.track.input] || "paste",
      source: null,
      stake: numberOrNull(nav.track.stake),
      payout_multiple: numberOrNull(nav.track.payout),
      legs: legs.map(function (leg) {
        return {
          player_id: leg.player_id, player_text: leg.text,
          market: leg.market, side: leg.side,
          line_placed: leg.line_placed,
          line_screened: leg.line_screened,
          p_at_screened: leg.p_at_screened,
          p_at_placed: leg.p_at_placed,
          /* What he saw at save time, stored as submitted. */
          blind_spot: leg.blind_spot,
          p_reason: leg.p_reason
        };
      })
    });
    nav.track.saved = saved;
    nav.slips = null;
    nav.picksAsked = false;
    nav.picksOffline = false;
    nav.picksBusy = "";
    render();
    showToast(TRACK_SAVED);
  } catch (err) {
    nav.picksOffline = true;
    nav.picksBusy = "";
    render();
  }
}

async function loadSlate() {
  try {
    const loaded = await getJSON(SLATE_URL);
    /* THE SCHEMA TAG IS READ BEFORE ANY FIELD IS. A document that does
     * not say which iteration it is could be anything, and reading a
     * field out of a shape this build does not know is how a page
     * comes to draw a number that means something else. */
    if (!loaded || loaded.slate_schema !== SLATE_SCHEMA) {
      nav.slateNote = OFFLINE_SCHEMA;
    } else {
      nav.slate = loaded;
    }
  } catch (err) {
    nav.slateNote = OFFLINE_BODY;
  }
  nav.game = 0;
  nav.exp = null;
  /* U4: the live board is asked for a SEASON AND A WEEK, and the
   * slate is where they come from. A board that gave up before the
   * document arrived asks again now that it has. */
  nav.liveAsked = false;
  nav.liveNote = null;
  render();
}

/* REAL DATA IS REAL. The tag labels fixtures, so it comes off exactly
 * when a real document is driving the screen — and stays on in demo
 * mode, where the document is fabricated by design. */
function onFixtures() {
  return DEMO || !nav.slate;
}

function games() {
  return (nav.slate && nav.slate.games) || [];
}

function currentGame() {
  const list = games();
  if (!list.length) return null;
  return list[Math.min(nav.game, list.length - 1)] || null;
}

function playerOf(id) {
  if (!id || !nav.slate || !nav.slate.players) return null;
  return nav.slate.players[id] || null;
}

function calibratedMarkets() {
  return (nav.slate && nav.slate.run &&
    nav.slate.run.calibrated_markets) || [];
}

/* ------------------------------------------------------------------
 * formatting — stored numbers, printed; never a number derived here
 * ------------------------------------------------------------------ */

/* A projected quantity at the precision it can carry. Big counts read
 * whole, small ones to a decimal, rates to two — one rule, so the same
 * number never reads two ways in two columns. */
function num(value) {
  if (value === null || value === undefined) return DASH;
  const size = Math.abs(value);
  if (size >= 100) return String(Math.round(value));
  if (size >= 10) return value.toFixed(1);
  if (size >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

function pct(value) {
  if (value === null || value === undefined) return DASH;
  return Math.round(value * 100) + "%";
}

function signed(points) {
  const up = points >= 0;
  return (up ? UP : DOWN) + Math.abs(points);
}

/* ------------------------------------------------------------------
 * THE DISCLOSURE — ONE renderer, and the only one (sec 8a)
 * ------------------------------------------------------------------
 * `howLines` turns the sentences a surface used to stack into the
 * body of the expander, through `plainNote` — the same translation
 * they went through when they stood in the reader's way, so nothing
 * about what they SAY has changed, only where they sit.
 *
 * `howToRead` is the shell: a native `<details>` with a 44px summary
 * (sec 9), no animation of any kind (so `prefers-reduced-motion` has
 * nothing to turn off), and no state of its own — a reader who opens
 * it and taps a row does not have to open it again, because the app
 * re-renders around it only when the data under it changes. */
function howLines(lines) {
  return (lines || []).filter(function (line) {
    return line !== null && line !== undefined && String(line) !== "";
  }).map(function (line) {
    return '<p class="howline">' + esc(plainNote(line)) + '</p>';
  }).join("");
}

function howToRead(body, label) {
  if (!body) return "";
  return '<details class="howto"><summary class="howsum">' +
    esc(label || HOW_TO_READ) + icon("chevron", 12, 2.5) +
    '</summary><div class="howbody">' + body + '</div></details>';
}

/* The pair, for the surfaces that simply have a list of sentences. */
function disclosure(lines, label) {
  return howToRead(howLines(lines), label);
}

/* THE ONE SHORT LINE ABOVE IT. A block is a short line and a tap, and
 * writing the two together is how they stay that way. */
function explainer(summary, lines, label) {
  return '<div class="legend">' + esc(summary) + '</div>' +
    disclosure(lines, label);
}

/* ------------------------------------------------------------------
 * THE STATLINE — ONE renderer, and the only one
 * ------------------------------------------------------------------
 * UI_ALPHA_SPEC sec 1's standing requirement: projection value · stat
 * label · threshold, rendered IDENTICALLY wherever a statline appears.
 * The home expanded row is its first consumer; the pick card (U3), the
 * live card (U4) and the projections merge (U7) are the next three,
 * and each of them calls THIS FUNCTION rather than laying out its own
 * rows, which is the whole reason it takes a plain list of entries and
 * knows nothing about where it is drawn.
 *
 * An entry is `{label, value, reason, threshold}`. A null value draws
 * the sec 8 dash and carries its reason as the cell's own title, so an
 * absence is explained where it is seen and never just blank. The
 * threshold slot is optional — the home table has none, the pick card
 * and the live card do — and a banked value (U4) arrives as a second
 * entry list beside the projected one, not as a second renderer. */
function statline(entries) {
  /* THE BANKED COLUMN IS THE SAME COMPONENT, not a second one (U4).
   * A list whose entries carry `banked` draws one more cell per row —
   * what the game has actually produced, beside what we projected —
   * and a list without it is byte for byte the row the home table and
   * the pick card have always drawn. */
  const paired = (entries || []).some(function (entry) {
    return entry && "banked" in entry;
  });
  return '<div class="statline' + (paired ? " banked" : "") + '">' +
    (paired
      ? '<div class="statrow stathead">' +
        '<span class="statlabel"></span>' +
        '<span class="statbanked">' + esc(BANKED_HEAD) + '</span>' +
        '<span class="statvalue">' + esc(PROJECTED) +
        '</span></div>'
      : "") +
    (entries || []).map(function (entry) {
    const absent = entry.value === null || entry.value === undefined;
    const spelled = labelTitle(entry.label);
    const off = entry.banked === null || entry.banked === undefined;
    return '<div class="statrow">' +
      '<span class="statlabel"' +
      (spelled ? ' title="' + esc(spelled) + '"' : "") + '>' +
      esc(entry.label) + '</span>' +
      (entry.threshold
        ? '<span class="statthreshold">' + esc(entry.threshold) +
          '</span>'
        : "") +
      (paired
        ? '<span class="statbanked' + (off ? " absent" : "") + '"' +
          (off && entry.banked_reason
            ? ' title="' + esc(plainNote(entry.banked_reason)) + '"'
            : "") + '>' +
          (off ? DASH : esc(num(entry.banked))) + '</span>'
        : "") +
      '<span class="statvalue' + (absent ? " absent" : "") + '"' +
      (absent && entry.reason
        ? ' title="' + esc(plainNote(entry.reason)) + '"'
        : "") + '>' +
      (absent ? DASH : esc(num(entry.value))) + '</span></div>';
  }).join("") + '</div>';
}

/* ------------------------------------------------------------------
 * U3 — READING THE PROPS
 * ------------------------------------------------------------------
 * Every function in this block is a LOOKUP. The exporter published a
 * ladder, a distribution, a quantile band, a sentence and four
 * tiles per prop; these find the right one and hand it to a renderer.
 * None of them derives a probability, and the three places this page
 * is allowed to work something out are each named on screen where
 * their answer appears. */

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return isFinite(parsed) ? parsed : null;
}

/* Every (player, prop) on the slate, once, with the game each one
 * belongs to so a row can say who he is playing. */
function allProps() {
  const out = [];
  games().forEach(function (game) {
    ["away", "home"].forEach(function (side) {
      (game.players[side] || []).forEach(function (id) {
        const person = playerOf(id);
        if (!person) return;
        (person.props || []).forEach(function (prop) {
          out.push({ id: id, person: person, prop: prop, game: game,
            side: side });
        });
      });
    });
  });
  return out;
}

function opponentOf(game, side) {
  return side === "away" ? game.home : game.away;
}

function gameOfPlayer(playerId) {
  let found = null;
  games().forEach(function (game) {
    ["away", "home"].forEach(function (side) {
      if ((game.players[side] || []).indexOf(playerId) >= 0) {
        found = { game: game, side: side };
      }
    });
  });
  return found;
}

function propOf(person, market) {
  if (!person) return null;
  const list = person.props || [];
  for (let index = 0; index < list.length; index += 1) {
    if (list[index].market === market) return list[index];
  }
  return person.key_prop
    ? propOf(person, person.key_prop.market)
    : (list[0] || null);
}

/* The prop the pick card is standing on: the one the row named, or
 * this player's key prop when the address carries no market. */
function pickProp() {
  const person = playerOf(nav.pick);
  if (!person) return null;
  if (nav.pickMarket) {
    const named = (person.props || []).filter(function (prop) {
      return prop.market === nav.pickMarket;
    })[0];
    if (named) return named;
  }
  if (person.key_prop) {
    return propOf(person, person.key_prop.market);
  }
  return (person.props || [])[0] || null;
}

/* SEC 7.3, ONCE, AND THE ONLY PLACE IT LIVES. The exporter ships
 * `gap_pts` and says nothing about whether it is an edge. */
function isEdge(prop) {
  return !!prop && prop.gap_pts >= GAP_MIN;
}

/* UI_ALPHA_SPEC sec 5, ONCE, AND THE ONLY PLACE IT LIVES. Same shape
 * as `isEdge` above and for the same reason: the Screen's sort, the
 * Screen's note, the Pick card, the home cell and a saved slip's leg
 * all ask THIS question, so they cannot come to disagree about what a
 * blind-spot candidate is. */
function isBlindSpot(prop) {
  return !!prop && prop.gap_pts >= BLIND_SPOT_GAP_PTS;
}

/* The Biggest-gap view's two bands, as a number to sort on: moderate
 * gaps first, blind-spot candidates behind them. It is an ORDER, not
 * a filter — every row is still in the list. */
function gapBand(prop) {
  return isBlindSpot(prop) ? 1 : 0;
}

function gapText(prop) {
  if (!isEdge(prop)) return NO_REAL_GAP;
  return (prop.gap_pts > 0 ? "+" : "") + prop.gap_pts + GAP_VS;
}

/* A rung is LOOKED UP, never interpolated: the exporter published
 * every line it read, and a line it did not read has no number here
 * (UI_ALPHA_SPEC sec 4's LINE_OFF_LADDER). */
function rungAt(prop, line) {
  const rungs = (prop && prop.alt_ladder) || [];
  for (let index = 0; index < rungs.length; index += 1) {
    if (rungs[index].line === line) return rungs[index];
  }
  return null;
}

/* The published chance of one SIDE at one rung. Both sides ride every
 * rung, so this is a read and not a subtraction. */
function rungChance(rung, side) {
  if (!rung) return null;
  return side === "less" ? rung.p_less : rung.p_more;
}

function watchedEntry(playerId, market) {
  const rows = nav.watch || [];
  for (let index = 0; index < rows.length; index += 1) {
    if (rows[index].player_id === playerId &&
        rows[index].market === market && !rows[index].removed_at) {
      return rows[index];
    }
  }
  return null;
}

/* ------------------------------------------------------------------
 * THE MARKET SPARKLINE — sec 4, 84 x 24
 * ------------------------------------------------------------------ */

/* The y-window is the CELL'S OWN range, widened to a floor so a line
 * that barely moved is drawn as a line that barely moved. Both series
 * share the window, or the two would not be comparable — which is the
 * only thing this chart is for. */
function sparkWindow(series) {
  const values = [];
  (series || []).forEach(function (point) {
    if (point.model_p !== null && point.model_p !== undefined) {
      values.push(point.model_p);
    }
    if (point.book_p !== null && point.book_p !== undefined) {
      values.push(point.book_p);
    }
  });
  if (!values.length) return null;
  let lo = Math.min.apply(null, values);
  let hi = Math.max.apply(null, values);
  const span = hi - lo;
  if (span < SPARK_MIN_SPAN) {
    const grow = (SPARK_MIN_SPAN - span) / 2;
    lo -= grow;
    hi += grow;
  }
  return { lo: lo, hi: hi };
}

function sparkY(value, box) {
  const scale = (value - box.lo) / (box.hi - box.lo);
  const usable = SPARK_H - SPARK_PAD * 2;
  return SPARK_PAD + (1 - Math.max(0, Math.min(1, scale))) * usable;
}

/* One path through the points that HAVE the reading asked for. The
 * series is honest about its sparsity — a stamp may carry a model
 * reading and no book price — so nothing is interpolated across a gap
 * and nothing is carried forward; the path simply joins the points
 * that exist, at their own places on the x-axis. */
function sparkPath(series, key) {
  const box = sparkWindow(series);
  if (!box) return "";
  const last = Math.max(1, series.length - 1);
  const parts = [];
  series.forEach(function (point, index) {
    const value = point[key];
    if (value === null || value === undefined) return;
    const x = SPARK_PAD + (index / last) * (SPARK_W - SPARK_PAD * 2);
    parts.push((parts.length ? "L" : "M") + x.toFixed(1) + " " +
      sparkY(value, box).toFixed(1));
  });
  return parts.join(" ");
}

function lastOf(series, key) {
  let held = null;
  (series || []).forEach(function (point) {
    if (point[key] !== null && point[key] !== undefined) {
      held = point;
    }
  });
  return held;
}

function marketCell(person, big) {
  const series = (person && person.market_series) || [];
  if (series.length < 2) {
    return '<span class="justposted">' + esc(LINE_JUST_POSTED) +
      '</span>';
  }
  const box = sparkWindow(series);
  const model = lastOf(series, "model_p");
  const book = lastOf(series, "book_p");
  const stroke = big ? "var(--positive)" : "var(--ink)";
  const dot = model
    ? '<circle cx="' + (SPARK_W - SPARK_PAD) + '" cy="' +
      sparkY(model.model_p, box).toFixed(1) +
      '" r="2.5" fill="' + stroke + '"></circle>'
    : "";
  return '<span class="spark">' +
    '<svg width="' + SPARK_W + '" height="' + SPARK_H + '" viewBox="0 0 ' +
    SPARK_W + ' ' + SPARK_H + '" role="img" aria-label="' +
    esc("Model " + pct(model && model.model_p) + " against book " +
      pct(book && book.book_p)) + '">' +
    '<path d="' + esc(sparkPath(series, "book_p")) +
    '" fill="none" stroke="var(--subtle)" stroke-width="1.4" ' +
    'stroke-dasharray="3 2"></path>' +
    '<path d="' + esc(sparkPath(series, "model_p")) +
    '" fill="none" stroke="' + stroke +
    '" stroke-width="1.8" stroke-linejoin="round"></path>' + dot +
    '</svg>' +
    '<span class="sparknums"><b>' + esc(pct(model && model.model_p)) +
    '</b> vs ' + esc(pct(book && book.book_p)) + '</span></span>';
}

/* ------------------------------------------------------------------
 * THE FIVE VIEWS — one cell's two values, per sec 5.1's table
 * ------------------------------------------------------------------ */

/* THE UNIT WORD A CELL SAYS, and the two rules behind it (sec 8a):
 * the market decides the word, and an unknown market says the
 * document's own phrase rather than its letter. */
function unitWord(prop) {
  if (!prop) return "";
  const known = UNIT_WORDS[String(prop.market || "")];
  if (known) return known;
  const label = String(prop.market_label || "");
  return label ? label.toLowerCase() : "";
}

function usageWord(person) {
  return USAGE_WORDS[String((person && person.pos) || "")
    .toUpperCase()] || "";
}

/* `{v1, v1unit, v2, tone, big}`. `tone` colours v2 and `big` tints
 * the whole cell; all of them are decided HERE, because all of them
 * are display rules. A quantity the exporter left null comes back as
 * a dash with its own reason on it, never as a zero, and `v1unit` is
 * the word under the number (sec 8a) or "" where the number needs
 * none. */
function cellValues(person) {
  const empty = { v1: DASH, v1unit: "", v2: DASH, tone: "absent",
    big: false };
  if (!person) return empty;

  if (nav.view === "props") {
    const prop = person.key_prop;
    if (!prop) return empty;
    /* NUMBER FIRST, THEN A WORD (sec 8a). The line is the number a
     * reader came for and it is drawn at cell size; the word under it
     * says what the number counts, in the vocabulary he already has.
     * The unit LETTER the document still carries is never read here. */
    const word = unitWord(prop);
    /* SEC 7.3, AND THIS IS THE WHOLE OF IT. At GAP_MIN and above the
     * gap is an edge and is drawn as one; below it the cell is a grey
     * dash, never a small number a reader could take for one. The
     * rule itself lives in `isEdge`, once, so the home table and the
     * Screen list cannot come to disagree about what an edge is.
     *
     * AND UI_ALPHA_SPEC SEC 5 CAPS IT. The exporter already keeps
     * blind-spot candidates out of `key_prop` where it can; where
     * EVERY key-market prop a player has is at or above the
     * threshold it falls back to priority order, and that cell must
     * not then wear the arrow — the sec 7.3 arrow is an edge claim
     * and a blind spot is not an edge. The LINE still draws: nothing
     * about this player's cell is hidden, only the claim. */
    const big = isEdge(prop) && !isBlindSpot(prop);
    return { v1: num(prop.line),
      v1unit: word ? word + UNIT_LINE : "",
      v2: big ? signed(prop.gap_pts) : DASH,
      tone: big ? "positive" : "absent", big: big };
  }

  if (nav.view === "fantasy") {
    const points = person.fantasy && person.fantasy.proj;
    return { v1: num(points), v1unit: "", v2: DASH, tone: "absent",
      big: false };
  }

  if (nav.view === "role") {
    const role = person.role || {};
    const trend = role.trend_pts_vs_prior4;
    const shown = trend !== null && trend !== undefined &&
      Math.abs(trend) >= TREND_MIN;
    return { v1: pct(role.share), v1unit: "",
      v2: shown ? signed(trend) : DASH,
      tone: shown ? (trend > 0 ? "positive" : "negative") : "absent",
      big: false };
  }

  if (nav.view === "usage") {
    const usage = person.usage || {};
    const opp = usage.opp_per_game;
    const share = usage.rz_share;
    const hot = share !== null && share !== undefined &&
      share >= RZ_MIN;
    const absent = opp === null || opp === undefined;
    return {
      v1: absent ? DASH : num(opp),
      /* The same rule as the props cell: a word, or nothing at all.
       * The `opp_unit` letter the document carries is never read. */
      v1unit: absent ? "" : usageWord(person),
      v2: share === null || share === undefined ? DASH : pct(share),
      tone: hot ? "positive" : "absent", big: false };
  }

  /* market: the cell IS the sparkline, so it has no v1 or v2 — but it
   * still carries the tint, because the gap is the same gap. */
  const prop = person.key_prop;
  return { v1: "", v1unit: "", v2: "", tone: "absent",
    big: isEdge(prop) };
}

function cellLabel(person, team, slot) {
  if (!person) return team + " " + slot + ", no player listed";
  const values = cellValues(person);
  if (nav.view === "market") {
    const model = lastOf(person.market_series, "model_p");
    const book = lastOf(person.market_series, "book_p");
    return person.name + ", " + person.team + " " + person.pos +
      ", model " + pct(model && model.model_p) + " against book " +
      pct(book && book.book_p);
  }
  return person.name + ", " + person.team + " " + person.pos + ", " +
    HEADS[nav.view][0] + " " + values.v1 +
    (values.v1unit ? " " + values.v1unit : "") + ", " +
    HEADS[nav.view][1] + " " + values.v2;
}

/* The two inner layouts, mirrored. The away side reads name, v1, v2
 * outward from the centre; the home side reads v2, v1, name inward —
 * which is what sec 5.1 means by a mirrored table and is why the two
 * are written as one function with a side. */
function cellBody(person, side) {
  const values = cellValues(person);
  if (nav.view === "market") {
    const spark = marketCell(person, values.big);
    const name = '<span class="cellname">' +
      esc(person ? person.name : DASH) + '</span>';
    return side === "away" ? name + spark : spark + name;
  }
  const name = '<span class="cellname">' +
    esc(person ? person.name : DASH) + '</span>';
  /* THE NUMBER, THEN ITS WORD UNDER IT (sec 8a). One span when there
   * is no word to say — a points total, a share — and a two-line
   * stack when there is, so the number keeps cell size and the word
   * sits under it small rather than being welded to its last digit. */
  const one = '<span class="cellv1">' +
    '<span class="cellnum">' + esc(values.v1) + '</span>' +
    (values.v1unit
      ? '<span class="cellunit">' + esc(values.v1unit) + '</span>'
      : "") + '</span>';
  const two = '<span class="cellv2 ' + values.tone + '">' +
    esc(values.v2) + '</span>';
  return side === "away" ? name + one + two : two + one + name;
}

function playerCell(id, side, team, slot) {
  const person = playerOf(id);
  const values = cellValues(person);
  const classes = ["cellbtn", side, nav.view];
  if (values.big) classes.push("tinted");
  if (!person) classes.push("empty");
  /* The cell is a button whether or not it has a player in it, so the
   * seven rows keep their shape and the grid never reflows between
   * views. An empty one is disabled rather than silently inert. */
  return '<button class="' + classes.join(" ") +
    '" data-act="player" data-player="' + esc(id || "") + '"' +
    (person ? "" : " disabled") + ' aria-label="' +
    esc(cellLabel(person, team, slot)) + '">' +
    cellBody(person, side) + '</button>';
}

/* ------------------------------------------------------------------
 * THE EXPANDED ROW — sec 5.1, two cards on a ground panel
 * ------------------------------------------------------------------ */

function expandedCard(id) {
  const person = playerOf(id);
  if (!person) {
    return '<div class="expcard empty">' + esc(DASH) + '</div>';
  }
  const points = person.fantasy && person.fantasy.proj;
  return '<div class="expcard">' +
    '<div class="exphead"><span class="expname">' +
    esc(person.name) + '</span><span class="expteam">' +
    esc(person.team + " " + person.pos) + '</span></div>' +
    '<div class="overline" title="' +
    esc(plainNote(person.projected_line_template)) + '">' +
    esc(PROJECTED) +
    '</div>' +
    statline(person.projected_line) +
    '<div class="statrow exppoints"><span class="statlabel">' +
    esc(FANTASY_ROW) + '</span><span class="statvalue">' +
    esc(num(points)) + '</span></div>' +
    '<button class="openpick" data-act="player" data-player="' +
    esc(id) + '">' + esc(OPEN_PICK) + '</button></div>';
}

function expandedRow(game, index) {
  return '<div class="exprow' + growClass() + '">' +
    expandedCard(game.players.away[index]) +
    expandedCard(game.players.home[index]) + '</div>';
}

/* ------------------------------------------------------------------
 * THE TABLE — seven mirrored rows, sec 5.1
 * ------------------------------------------------------------------ */

function tableHead(game) {
  const heads = HEADS[nav.view];
  return '<div class="thead">' +
    '<div class="tside away"><span class="tteam">' + esc(game.away) +
    '</span><span class="th1">' + esc(heads[0]) +
    '</span><span class="th2">' + esc(heads[1]) + '</span></div>' +
    '<div class="tpos">POS</div>' +
    '<div class="tside home"><span class="th2">' + esc(heads[1]) +
    '</span><span class="th1">' + esc(heads[0]) +
    '</span><span class="tteam">' + esc(game.home) + '</span></div>' +
    '</div>';
}

function tableRows(game) {
  const slots = game.slots || [];
  return slots.map(function (slot, index) {
    const open = nav.exp === index;
    return '<div class="trow' + (open ? " open" : "") +
      (index % 2 ? " alt" : "") + '">' +
      playerCell(game.players.away[index], "away", game.away, slot) +
      '<button class="posbtn' + (open ? " open" : "") +
      '" data-act="row" data-row="' + index +
      '" aria-expanded="' + open + '" aria-label="' +
      esc((open ? "Hide" : "Show") + " projected stats for the " +
        slot + " row") + '">' +
      '<span class="posname">' + esc(slot) + '</span>' +
      icon("chevron", 12, 2.5) + '</button>' +
      playerCell(game.players.home[index], "home", game.home, slot) +
      '</div>' + (open ? expandedRow(game, index) : "");
  }).join("");
}

/* THE UNIT KEY IS GONE (sec 8a), and gone rather than reworded. It
 * existed for exactly one reason — the cells carried letters — and
 * the cells carry words now, so the sentence that translated the
 * letters has nothing left to translate. A legend decoding the codes
 * in the cells above it was the clearest possible proof that those
 * cells were not casual friendly.
 *
 * WHETHER THE CALIBRATION SENTENCE APPLIES is still read off the
 * document, not assumed: it is shown when a prop on this screen
 * belongs to one of the markets the run block names, or when one does
 * not — which is both arms, and is exactly why the sentence names
 * both. It moved behind the tap; it did not move out. */
function legendFor(game) {
  if (nav.view === "props") {
    return LEGEND_PROPS + " " + CALIBRATION_NOTE;
  }
  if (nav.view === "fantasy") {
    return LEGEND_FANTASY + " " + RANGE_ABSENT;
  }
  if (nav.view === "usage") return LEGEND_USAGE + " " + RZ_ABSENT;
  return LEGENDS[nav.view];
}

/* THE FOOTNOTE WALL BECOMES A LINE AND A TAP (sec 8a). The view's own
 * legend and every note the exporter wrote onto this game are all
 * still here, still translated, still in full — under "How to read
 * this" instead of between the reader and the table. */
function footnotes(game) {
  const lines = [legendFor(game)].concat(game.notes || []);
  const body = lines.map(function (line) {
    return '<p class="howline">' + esc(plainNote(line)) + '</p>';
  }).join("");
  return '<div class="legend">' + esc(SHORTS[nav.view]) + '</div>' +
    howToRead(body);
}

function viewToggle() {
  return '<div class="viewseg" role="group" aria-label="' +
    esc(VIEW_GROUP_LABEL) + '">' + VIEWS.map(function (view) {
      return '<button data-act="view" data-view="' + esc(view[0]) +
        '" aria-pressed="' + (nav.view === view[0]) + '">' +
        esc(view[1]) + '</button>';
    }).join("") + '</div>';
}

/* Sec 4's game line strip: three cells on a ground panel. Each one is
 * a stored number or a dash — the exporter ships the line the forecast
 * CONSUMED, and where it had none the strip says so rather than
 * falling back to a different number that would look the same. */
function lineStrip(game) {
  const cells = [
    [game.away + " TOTAL", num(game.implied_total_away)],
    ["SPREAD", game.spread_label || DASH],
    [game.home + " TOTAL", num(game.implied_total_home)]
  ];
  return '<div class="linestrip" title="' +
    esc(plainNote(game.line_basis)) + '">' +
    cells.map(function (cell) {
      return '<div class="linecell"><span class="linelabel">' +
        esc(cell[0]) + '</span><span class="linevalue">' +
        esc(cell[1]) + '</span></div>';
    }).join("") + '</div>';
}

/* ------------------------------------------------------------------
 * THE GAME SWITCHER — sec 4
 * ------------------------------------------------------------------ */

function kickoffLabel(stamp) {
  if (!stamp) return "";
  const when = new Date(stamp);
  if (isNaN(when.getTime())) return "";
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  let hour = when.getHours();
  hour = hour % 12 || 12;
  const minutes = String(when.getMinutes()).padStart(2, "0");
  return days[when.getDay()] + " " + hour + ":" + minutes;
}

/* ONE SWITCHER, TWO SCREENS (sec 8b). Home walks the slate's games
 * and Projections walks the projection file's; the component is the
 * same one, and it takes the list, the index and WHICH ACTION its
 * arrows fire rather than reading `nav` for itself.
 *
 * `search` is the action its centre button fires, or "" for a screen
 * that has no game search to open — on Projections the search box
 * below it is a PLAYER search within the game, so the matchup renders
 * as a label rather than a button that promises something else. */
function switcher(game, list, index, step, search) {
  const count = (list || []).length;
  const dots = (list || []).map(function (unused, at) {
    return '<span class="' + (at === index ? "on" : "") + '"></span>';
  }).join("");
  const when = kickoffLabel(game.kickoff);
  const position = esc(when ? when + " · " : "") + (index + 1) +
    ' OF ' + count;
  const teams = '<span class="teams">' + esc(game.away) +
    ' <span class="at">@</span> ' + esc(game.home) +
    (search ? icon("search", 15, 2.5) : "") + '</span>';
  const middle = search
    ? '<button class="matchup" data-act="' + esc(search) +
      '" aria-label="' +
      esc(game.away + " at " + game.home + (when ? ", " + when : "") +
        ". Search games") + '">' + teams +
      '<span class="when">' + position + '</span></button>'
    : '<div class="matchupflat">' + teams +
      '<span class="when">' + position + '</span></div>';
  return '<div class="switcher">' +
    '<button class="arrow" data-act="' + esc(step) +
    '" data-step="-1" ' +
    'aria-label="Previous game">' + icon("back", 20, 2.5) + '</button>' +
    middle +
    '<button class="arrow" data-act="' + esc(step) + '" data-step="1" ' +
    'aria-label="Next game">' + icon("next", 20, 2.5) + '</button>' +
    '</div>' +
    '<div class="dots" aria-hidden="true">' + dots + '</div>';
}

/* ------------------------------------------------------------------
 * THE MATCHUP CARD — the only table on Home
 * ------------------------------------------------------------------ */

function matchBody(game) {
  return lineStrip(game) + viewToggle() +
    '<div class="table" id="matchtable">' + tableHead(game) +
    tableRows(game) + '</div>' + footnotes(game);
}

function matchCard() {
  const game = currentGame();
  if (!game) {
    /* Sec 8: no games this week. The switcher says so and the table is
     * replaced by an empty state — not by a skeleton, which would
     * promise something that is coming. */
    return '<div class="matchcard" id="matchcard">' +
      '<div class="switcher"><div class="matchupflat">' +
      esc(NO_GAMES_SWITCHER) + '</div></div>' +
      '<div class="legend">' + esc(NO_GAMES_BODY) + '</div></div>';
  }
  return '<div class="matchcard" id="matchcard">' +
    switcher(game, games(), nav.game, "game", "search-open") +
    matchBody(game) + '</div>';
}

/* THE OFFLINE ARM. The shell's own stub, with the honest note: the
 * sample games below it are labelled by the Sample-data tag in the
 * hero, which stays on for exactly as long as they are what is on
 * screen. */
function matchStub() {
  const game = SAMPLE_GAMES[nav.game % SAMPLE_GAMES.length];
  const dots = SAMPLE_GAMES.map(function (unused, index) {
    return '<span class="' +
      (index === nav.game % SAMPLE_GAMES.length ? "on" : "") +
      '"></span>';
  }).join("");
  return '<div class="matchcard" id="matchcard">' +
    '<div class="switcher">' +
    '<button class="arrow" data-act="game" data-step="-1" ' +
    'aria-label="Previous game">' + icon("back", 20, 2.5) + '</button>' +
    '<div class="matchupflat"><span class="teams">' + esc(game.away) +
    ' <span class="at">@</span> ' + esc(game.home) + '</span>' +
    '<span class="when">' + esc(game.when) + '</span></div>' +
    '<button class="arrow" data-act="game" data-step="1" ' +
    'aria-label="Next game">' + icon("next", 20, 2.5) + '</button>' +
    '</div><div class="dots" aria-hidden="true">' + dots + '</div>' +
    '<div class="tablestub" id="tablestub">' +
    '<div class="skeleton" aria-hidden="true">' +
    skeletonRows(SKELETON_WIDTHS) + '</div></div>' +
    '<div class="cardhead offhead">' + esc(OFFLINE_HEAD) + '</div>' +
    '<div class="legend">' + esc(nav.slateNote || OFFLINE_BODY) +
    '</div></div>';
}

/* ------------------------------------------------------------------
 * THE GAME SEARCH OVERLAY — sec 5.1
 * ------------------------------------------------------------------ */

function playersIn(game) {
  const out = [];
  ["away", "home"].forEach(function (side) {
    (game.players[side] || []).forEach(function (id) {
      const person = playerOf(id);
      if (person) out.push(person);
    });
  });
  return out;
}

/* THE "HAS N GAPS" CHIP COUNTS WHAT THE TABLE WILL DRAW, and after
 * UI_ALPHA_SPEC sec 5 that is the same two questions the cell asks.
 * A chip that counted a blind-spot key prop would promise an edge one
 * tap before the cell declines to draw one — the ledger's own words,
 * "never dresses a blind-spot row as an edge", one level up. */
function gapsIn(game) {
  return playersIn(game).filter(function (person) {
    return isEdge(person.key_prop) && !isBlindSpot(person.key_prop);
  }).length;
}

/* THE FILTER. Team abbreviation and player name, case-insensitively,
 * and the first matching player becomes the "has ..." hint — which is
 * the whole reason a player search on a GAME list makes sense. */
function searchResults() {
  const query = String(nav.query || "").trim().toLowerCase();
  const out = [];
  games().forEach(function (game, index) {
    const people = playersIn(game);
    const hay = [game.away, game.home].concat(
      people.map(function (person) { return person.name; }))
      .join(" ").toLowerCase();
    if (query && hay.indexOf(query) < 0) return;
    let hit = null;
    if (query) {
      people.some(function (person) {
        if (person.name.toLowerCase().indexOf(query) >= 0) {
          hit = person.name;
          return true;
        }
        return false;
      });
    }
    out.push({ index: index, game: game, hit: hit,
      gaps: gapsIn(game) });
  });
  return out;
}

function renderSearch() {
  const node = el("searchoverlay");
  if (!node) return;
  if (!nav.search) {
    node.hidden = true;
    node.innerHTML = "";
    return;
  }
  const results = searchResults();
  const when = function (game) {
    const label = kickoffLabel(game.kickoff);
    return label ? label : "";
  };
  const rows = results.map(function (result) {
    const bits = [result.game.away + " at " + result.game.home];
    const time = when(result.game);
    if (time) bits.push(time);
    if (result.hit) bits.push(SEARCH_HAS + result.hit);
    return '<button class="gameresult' +
      (result.index === nav.game ? " current" : "") +
      '" data-act="pick-game" data-game="' + result.index +
      '" aria-label="' + esc(bits.join(", ")) + '">' +
      '<span class="gamecol"><span class="gamename">' +
      esc(result.game.away + " @ " + result.game.home) +
      '</span><span class="gamesub">' + esc(bits.slice(1).join(" · ")) +
      '</span></span>' +
      (result.gaps
        ? '<span class="gapchip">' + result.gaps +
          (result.gaps === 1 ? " gap" : " gaps") + '</span>'
        : "") + '</button>';
  }).join("");
  node.innerHTML = '<button class="scrim" data-act="search-close" ' +
    'aria-label="Close search"></button>' +
    '<div class="searchpanel motion-drop" role="dialog" ' +
    'aria-modal="true" aria-label="Search games">' +
    '<div class="searchbar">' + icon("search", 18, 2.5) +
    '<input class="searchinput" id="gamesearch" type="text" ' +
    'autocomplete="off" placeholder="' + esc(SEARCH_PLACEHOLDER) +
    '" aria-label="Search games" value="' + esc(nav.query) + '">' +
    '<button class="searchcancel" data-act="search-close">' +
    esc(SEARCH_CANCEL) + '</button></div>' +
    '<div class="searchbasis">' + esc(SEARCH_BASIS) + '</div>' +
    '<div class="overline">' + esc(SEARCH_HEADING) + '</div>' +
    rows +
    (results.length ? "" :
      '<div class="legend">' + esc(SEARCH_EMPTY + ' "' + nav.query +
        '".') + '</div>') +
    '</div>';
  node.hidden = false;
}

/* ------------------------------------------------------------------
 * the screens
 * ------------------------------------------------------------------ */

function renderHome() {
  return '<div class="hero">' + heroArt() + heroTop() + heroRings() +
    '<div class="herofade"></div></div>' +
    (nav.slate ? matchCard() : matchStub());
}

function lineupSkeleton() {
  return '<div class="skeleton" aria-hidden="true">' +
    SAMPLE_LINEUP_SLOTS.map(function (slot, index) {
      return '<div class="skelrow' + growClass() + '" style="--i:' +
      index + '">' +
        '<div class="skelbar lead"></div>' +
        '<div class="skelbar" style="width:' +
        SKELETON_WIDTHS[index % SKELETON_WIDTHS.length] + '%"></div>' +
        '<div class="skelbar tail"></div></div>';
    }).join("") + '</div>';
}

/* THE WEEK THE SLATE SAYS IT IS (sec 8a). `slate.json`'s run block is
 * the one clock this app reads; a header that derived its own would be
 * a second opinion about which week the reader is looking at. */
function slateWeekWord() {
  const run = (nav.slate && nav.slate.run) || {};
  const week = numberOrNull(run.week);
  return week === null ? "" : WEEK_WORD + week;
}

function fantasyHead() {
  const week = slateWeekWord();
  return '<div class="pagehead"><div class="pagetitle">' +
    esc(TITLE_FANTASY) + '</div><div class="pagemeta">' +
    esc((week ? week + " · " : "") + SAMPLE_SCORING) +
    '</div></div>' + subToggle("fantasy");
}

/* sec 6a — THE TEAM-CAPTURE ENTRY POINT, on both Fantasy sub-views.
 * The lineup TABLE is still being built (it lands with the Fantasy
 * increment); what is live here is the door: a picture of a lineup
 * becomes the team, and the team it saved is named back. */
function teamEntryCard(kind) {
  const held = (nav.teams || {})[kind];
  return '<div class="card"><div class="overline">' +
    esc(TEAM_CURRENT) + '</div>' +
    '<div class="cardbody">' +
    esc(held
      ? teamHeldLine(held)
      : (nav.hasToken ? TEAM_NONE_YET : TEAM_CONNECT)) + '</div>' +
    '<button class="primary" data-act="team-open" data-kind="' +
    esc(kind) + '">' + esc(TEAM_ENTRY) + '</button>' +
    '<div class="legend">' + esc(TEAM_ENTRY_SUB) + '</div></div>';
}

/* What the saved team says about itself. Counts and a week — no
 * projection, because the lineup table is not built yet and a total
 * nobody computed is exactly the thing this app does not draw. */
function teamHeldLine(held) {
  const slots = (held.slots || []).length;
  return slots + (slots === 1 ? " slot" : " slots") +
    ", saved for week " + held.week + ".";
}

/* ------------------------------------------------------------------
 * U5 — SEASON LONG (UI_ALPHA_SPEC sec 6c, handoff sec 5.2)
 * ------------------------------------------------------------------
 * THE LINEUP IS THE CAPTURE'S; THE NUMBERS ARE THE EXPORTER'S. Every
 * row here is a slot the reader confirmed from a picture, joined to
 * `slate.json` by the player id the service resolved. A slot we could
 * not resolve keeps the words the picture showed and carries no
 * number at all — the join is ours, and a projection hung on a guess
 * would be worse than a dash. */

function heldTeam(kind) {
  return (nav.teams || {})[kind] || null;
}

function heldOpponent(kind) {
  return (nav.opponents || {})[kind] || null;
}

/* Which slot is the FLEX, and which are the bench, in the league's
 * own vocabulary rather than ours. A label this list does not know is
 * neither: it is simply a starting slot, which is the safe reading. */
function labelIn(list, label) {
  const text = String(label || "").toUpperCase().replace(/\s+/g, "");
  return list.some(function (name) {
    return text.indexOf(name.replace(/\s+/g, "")) === 0;
  });
}

function isFlexSlot(label) {
  return labelIn(FLEX_LABELS, label);
}

function isBenchSlot(label) {
  return labelIn(BENCH_LABELS, label);
}

/* ONE ROW PER CONFIRMED SLOT, joined once. Everything below reads
 * this and nothing re-joins. */
function lineupRows(held) {
  return ((held && held.slots) || []).map(function (slot, index) {
    const person = slot.player_id ? playerOf(slot.player_id) : null;
    const fan = (person && person.fantasy) || null;
    const where = slot.player_id ? gameOfPlayer(slot.player_id) : null;
    return {
      index: index,
      label: slot.slot_label || "",
      player_id: slot.player_id || null,
      /* HIS OWN WORDS WHERE WE HAVE NO PLAYER. The picture said a
       * name; we say the same name back rather than a blank row. */
      name: person ? person.name : (slot.player_text || DASH),
      person: person,
      fan: fan,
      proj: fan && fan.proj !== null && fan.proj !== undefined
        ? fan.proj : null,
      game: where
        ? (where.side === "away"
          ? "at " + where.game.home
          : "vs " + where.game.away)
        : (slot.opponent_text || ""),
      bench: isBenchSlot(slot.slot_label),
      flex: isFlexSlot(slot.slot_label)
    };
  });
}

/* THE STARTERS, WITH THE FLEX CALL APPLIED. The store is untouched:
 * this swaps the row the table draws, and `nav.flex` is the whole of
 * the change. */
function startingRows(rows, mine) {
  const starters = rows.filter(function (row) { return !row.bench; });
  /* THE CALL IS ON HIS OWN LINEUP AND ON NOBODY ELSE'S. The opponent's
   * rows go through this same function — one reader, one shape — and
   * they are never swapped: a start/sit decision belongs to the man
   * making it, and applying it to the other team would move a number
   * he cannot move. */
  if (!mine || !nav.flex) return starters;
  const chosen = rows.filter(function (row) {
    return row.player_id === nav.flex;
  })[0];
  if (!chosen) return starters;
  return starters.map(function (row) {
    if (!row.flex) return row;
    return {
      index: row.index, label: row.label,
      player_id: chosen.player_id, name: chosen.name,
      person: chosen.person, fan: chosen.fan, proj: chosen.proj,
      game: chosen.game, bench: false, flex: true, swapped: true
    };
  });
}

/* THE ONE PIECE OF ARITHMETIC THIS SCREEN DOES, and it says so on
 * screen: the projections added up, and the rows that had none named
 * rather than counted as zero. */
function lineupTotal(rows) {
  let total = 0;
  let counted = 0;
  const skipped = [];
  rows.forEach(function (row) {
    if (row.proj === null) {
      skipped.push(row.name);
      return;
    }
    total += row.proj;
    counted += 1;
  });
  return { total: counted ? total : null, counted: counted,
    skipped: skipped };
}

/* Sec 4's range bar, on points rather than on a market line. It is
 * drawn ONLY where the document carries a low and a high end; where
 * it does not, the cell is the sec 3.1 dash and the table's own
 * footnote says why (the same sentence Home's Fantasy view uses). */
const POINTS_RANGE_W = 88;
const POINTS_RANGE_H = 18;

function pointsRange(fan) {
  const lo = fan && fan.p10;
  const hi = fan && fan.p90;
  if (lo === null || lo === undefined || hi === null ||
      hi === undefined) {
    return null;
  }
  const proj = fan.proj === null || fan.proj === undefined
    ? lo : fan.proj;
  const top = Math.max(hi, proj, 30);
  const at = function (value) {
    return ((Math.max(0, value) / top) * (POINTS_RANGE_W - 8) +
      4).toFixed(1);
  };
  const mid = (POINTS_RANGE_H / 2).toFixed(1);
  return '<span class="rangebar"><svg width="' + POINTS_RANGE_W +
    '" height="' + POINTS_RANGE_H + '" viewBox="0 0 ' +
    POINTS_RANGE_W + ' ' + POINTS_RANGE_H + '" role="img" ' +
    'aria-label="' + esc(PICK_FLOOR + " " + num(lo) + ", " +
      PICK_CEILING.toLowerCase() + " " + num(hi)) + '">' +
    '<line x1="4" y1="' + mid + '" x2="' + (POINTS_RANGE_W - 4) +
    '" y2="' + mid + '" stroke="var(--track)" stroke-width="2"></line>' +
    '<line x1="' + at(lo) + '" y1="' + mid + '" x2="' + at(hi) +
    '" y2="' + mid + '" stroke="var(--border-strong)" ' +
    'stroke-width="6" stroke-linecap="round"></line>' +
    '<circle cx="' + at(proj) + '" cy="' + mid +
    '" r="3.5" fill="var(--ink)"></circle></svg></span>';
}

function lineupRow(row, index) {
  const bar = pointsRange(row.fan);
  const classes = ["lineuprow"];
  if (row.flex) classes.push("flex");
  return '<button class="' + classes.join(" ") + growClass() +
    '" style="--i:' + Math.min(index, 8) + '" data-act="player" ' +
    'data-player="' + esc(row.player_id || "") + '"' +
    (row.person ? "" : " disabled") + ' aria-label="' +
    esc(row.label + ", " + row.name + ", " +
      LINEUP_PROJ.toLowerCase() + " " +
      (row.proj === null ? DASH : num(row.proj))) + '">' +
    '<span class="lineupslot">' + esc(row.label) + '</span>' +
    '<span class="lineupwho"><span class="lineupname">' +
    esc(row.name) + '</span>' +
    (row.game
      ? '<span class="lineupgame">' + esc(row.game) + '</span>'
      : "") + '</span>' +
    '<span class="lineupbar">' +
    (bar || '<span class="lineuprange absent"' +
      (row.fan && row.fan.range_reason
        ? ' title="' + esc(plainNote(row.fan.range_reason)) + '"'
        : "") + '>' + esc(DASH) + '</span>') + '</span>' +
    '<span class="lineupproj' + (row.proj === null ? " absent" : "") +
    '"' + (row.proj === null && !row.person
      ? ' title="' + esc(LINEUP_OFF_SLATE) + '"'
      : "") + '>' +
    esc(row.proj === null ? DASH : num(row.proj)) + '</span></button>';
}

function lineupTable(rows) {
  const anyRange = rows.some(function (row) {
    return !!pointsRange(row.fan);
  });
  const offSlate = rows.some(function (row) {
    return !row.person;
  });
  return '<div class="card"><div class="overline">' +
    esc(LINEUP_HEAD) + '</div>' +
    '<div class="lineuphead">' +
    '<span class="lineupslot">' + esc(LINEUP_SLOT) + '</span>' +
    '<span class="lineupwho">' + esc(LINEUP_PLAYER) + '</span>' +
    '<span class="lineupbar">' + esc(LINEUP_RANGE) + '</span>' +
    '<span class="lineupproj">' + esc(LINEUP_PROJ) + '</span>' +
    '</div>' +
    rows.map(lineupRow).join("") +
    /* sec 8a: the scoring rule, the missing points range and the
     * off-slate note are three paragraphs under a lineup table. One
     * line and a tap; all three survive inside, and the two that are
     * conditional are still only said when they are true. */
    explainer(SHORT_TEAM, [LEGEND_FANTASY,
      anyRange ? "" : RANGE_ABSENT,
      offSlate ? LINEUP_OFF_SLATE : ""]) + '</div>';
}

/* THE MATCHUP CARD, and the whole of sec 6c's rule about it. OUR
 * total always. HIS total and the comparison ONLY where an opponent
 * lineup has been captured — and the comparison is of TWO TOTALS,
 * named as such. No joint chance is invented from per-player ranges;
 * the sentence under it says exactly what was compared, so the
 * absence of a win chance is a fact stated once rather than a hole
 * the reader has to notice. */
function matchupCard(mine, theirs) {
  const ours = lineupTotal(mine);
  const his = theirs ? lineupTotal(theirs) : null;
  const both = ours.total !== null && his && his.total !== null;
  const edge = both ? ours.total - his.total : null;
  return '<div class="card teamcard">' +
    '<div class="teamtotals">' +
    '<div class="teamside"><div class="overline">' +
    esc(TEAM_TOTAL) + '</div><div class="teambig">' +
    esc(ours.total === null ? DASH : num(ours.total)) +
    '</div></div>' +
    (his
      ? '<div class="teamside them"><div class="overline">' +
        esc(OPP_TOTAL) + '</div><div class="teambig">' +
        esc(his.total === null ? DASH : num(his.total)) +
        '</div></div>'
      : "") + '</div>' +
    (both
      ? '<div class="teamverdict ' +
        (edge > 0 ? "positive" : (edge < 0 ? "negative" : "absent")) +
        '">' + esc(edge === 0
          ? COMPARE_LEVEL
          : (edge > 0 ? COMPARE_AHEAD : COMPARE_BEHIND) +
            num(Math.abs(edge)) + COMPARE_POINTS) + '</div>'
      : "") +
    /* THE SKIPPED PLAYERS STAY IN THE OPEN. They are a fact about the
     * number directly above them — it is not everybody's — and a
     * total that quietly left somebody out is the one thing on this
     * card that must not need a tap. */
    (ours.skipped.length
      ? '<div class="legend">' + esc(TEAM_TOTAL_SKIPPED +
        ours.skipped.join(", ") + ".") + '</div>'
      : "") +
    /* sec 8a. The SHORT LINE carries the meaning that matters at a
     * glance — these are two projected totals, not a chance of
     * winning — and the full basis and the full sec 6c sentence sit
     * under the tap, unchanged. */
    explainer(both ? SHORT_COMPARE : SHORT_TOTAL,
      [TEAM_TOTAL_BASIS, both ? COMPARE_NOTE : ""],
      both ? COMPARE_HEAD : HOW_TO_READ) + '</div>';
}

/* SEC 5.2's FLEX call, and sec 6c's shape for it: the captured FLEX
 * player and the best captured bench alternative at an eligible
 * position. NO BENCH CAPTURED, OR NO ELIGIBLE MAN ON IT, AND THIS
 * SECTION DOES NOT RENDER — a capability we do not have is not shown,
 * and a one-sided "call" is not a call. */
function flexAlternative(rows) {
  const bench = rows.filter(function (row) {
    return row.bench && row.person && row.proj !== null &&
      FLEX_POSITIONS.indexOf(String(row.person.pos || "")) >= 0;
  });
  bench.sort(function (a, b) { return b.proj - a.proj; });
  return bench[0] || null;
}

/* THE RATIONALE, AND IT IS A FACT AND NOT AN OPINION. It is read off
 * the role and usage blocks the exporter already publishes, and it
 * says only what those blocks carry: a share where one exists, a
 * workload where one exists, and nothing at all where neither does. */
function flexReason(row) {
  const parts = [];
  const role = (row.person && row.person.role) || {};
  const usage = (row.person && row.person.usage) || {};
  if (role.share !== null && role.share !== undefined) {
    parts.push(pct(role.share) + " " +
      plainNote(role.share_label || "share"));
  }
  if (usage.opp_per_game !== null && usage.opp_per_game !== undefined) {
    /* The casual word, not the document's own — sec 8a's rule is the
     * same wherever a workload is said out loud. */
    const word = usageWord(row.person);
    parts.push(num(usage.opp_per_game) + (word ? " " + word : "") +
      " a game over " + usage.opp_games +
      (usage.opp_games === 1 ? " game" : " games"));
  }
  return parts.join(" · ");
}

function flexCard(row, current) {
  const bar = pointsRange(row.fan);
  const reason = flexReason(row);
  return '<div class="flexcard' + (current ? " current" : "") + '">' +
    '<div class="overline">' + esc(current ? FLEX_IN : FLEX_BENCH) +
    '</div>' +
    '<div class="flexname">' + esc(row.name) + '</div>' +
    '<div class="flexmeta">' +
    esc((row.person ? row.person.pos + " · " : "") + row.game) +
    '</div>' +
    '<div class="flexproj">' + esc(num(row.proj)) + '</div>' +
    (bar || '<span class="lineuprange absent">' + esc(DASH) +
      '</span>') +
    (reason
      ? '<div class="flexreason">' + esc(reason) + '</div>'
      : "") +
    (current
      ? (nav.flex
        ? '<button class="flexswap" data-act="flex-clear">' +
          esc(FLEX_BACK) + '</button>'
        : "")
      : '<button class="flexswap" data-act="flex-swap" ' +
        'data-player="' + esc(row.player_id) + '">' + esc(FLEX_SWAP) +
        '</button>') + '</div>';
}

function flexSection(rows) {
  const starters = startingRows(rows, true);
  const current = starters.filter(function (row) {
    return row.flex;
  })[0];
  if (!current || !current.person) return "";
  const other = flexAlternative(rows);
  if (!other || other.player_id === current.player_id) return "";
  return '<div class="card"><div class="overline">' +
    esc(FLEX_HEAD) + '</div>' +
    '<div class="flexpair">' + flexCard(current, true) +
    flexCard(other, false) + '</div>' +
    '<div class="legend">' + esc(FLEX_BASIS) + '</div></div>';
}

function renderFantasySeason() {
  const held = heldTeam("season_long");
  /* NO TEAM CAPTURED YET AND THE DOOR IS THE SCREEN (sec 6c). There
   * is no empty table, no zeroed total and no promise: the one thing
   * to do here is the one thing on screen. */
  if (!held) {
    return '<div class="page">' + fantasyHead() +
      teamEntryCard("season_long") + lineupSkeleton() + '</div>';
  }
  const rows = lineupRows(held);
  const starters = startingRows(rows, true);
  const opponent = heldOpponent("season_long");
  const theirs = opponent
    ? startingRows(lineupRows(opponent), false) : null;
  return '<div class="page">' + fantasyHead() +
    matchupCard(starters, theirs) +
    lineupTable(starters) +
    flexSection(rows) +
    /* THE OPPONENT DOOR, and it is only offered while there is no
     * opponent to show. Once one is captured the card above carries
     * both sides and the door has done its job. */
    (opponent ? "" : opponentEntryCard()) +
    teamEntryCard("season_long") + '</div>';
}

function opponentEntryCard() {
  return '<div class="card"><button class="primary" ' +
    'data-act="team-open" data-kind="season_long" ' +
    'data-side="opponent">' + esc(OPP_ENTRY) + '</button>' +
    '<div class="legend">' + esc(OPP_ENTRY_SUB) + '</div></div>';
}

/* ------------------------------------------------------------------
 * U5 — DFS (UI_ALPHA_SPEC sec 6c)
 * ------------------------------------------------------------------
 * The weekly sheet, restyled and NOT re-said. Every label, every
 * meaning, every rule and every absence sentence below was written by
 * the sheet; this page lays them out and translates them through the
 * same plain-language layer every other exporter sentence goes
 * through. Nothing here computes a number. */

function dfsTable(name) {
  return ((nav.dfs && nav.dfs.tables) || {})[name] || null;
}

function dfsSentence(key) {
  return ((nav.dfs && nav.dfs.sentences) || {})[key] || "";
}

/* The sheet's players table, by id, so the reader's own entry can be
 * joined to it. Built once per render that needs it. */
function dfsPlayerIndex() {
  const table = dfsTable("players");
  const index = {};
  ((table && table.rows) || []).forEach(function (row) {
    index[String(row.player_id)] = row;
  });
  return index;
}

/* WHY AN OWNERSHIP CELL IS EMPTY, in the sheet's own words. A table
 * whose ownership file was missing carries its own absence sentence;
 * a player who simply had no ownership row is covered by the sheet's
 * stated join limit. Either way the sentence is the sheet's. */
function ownershipAbsence() {
  const table = dfsTable("players");
  const absence = (table && table.absence) || [];
  if (absence.length) return absence.join(" ");
  return dfsSentence("name_join_limit");
}

function evidenceChip(label) {
  const meaning = ((nav.dfs && nav.dfs.evidence_classes) ||
    {})[label] || "";
  return '<span class="evidence"' +
    (meaning ? ' title="' + esc(plainNote(meaning)) + '"' : "") + '>' +
    esc(label) + '</span>';
}

function dfsColumnList(table) {
  const columns = (table && table.columns) || [];
  if (!columns.length) return "";
  return '<div class="overline">' + esc(DFS_COLUMNS) + '</div>' +
    '<div class="colnotes">' + columns.map(function (column) {
      return '<div class="colnote"><span class="colname">' +
        esc(column.column) + '</span>' + evidenceChip(
        column.evidence_class) + '<span class="colmeaning">' +
        esc(plainNote(column.meaning)) + '</span></div>';
    }).join("") + '</div>';
}

function dfsRules(table) {
  return ((table && table.rules) || []).map(function (rule) {
    return '<div class="legend">' + esc(plainNote(rule.text)) +
      '</div>';
  }).join("");
}

function dfsAbsence(table) {
  return ((table && table.absence) || []).map(function (line) {
    return '<div class="legend">' + esc(plainNote(line)) + '</div>';
  }).join("");
}

function dfsTrim(table, drawn) {
  const total = (table && table.n_rows) || 0;
  if (total <= drawn) return "";
  return '<div class="legend">' + esc(DFS_SHOWING + drawn + DFS_OF +
    total + DFS_SHOWING_TAIL) + '</div>';
}

/* sec 8a: a table's rules and its column meanings are S-016's words
 * and every one of them survives — inside the tap, where a reader who
 * wants to know what a column means can find them all in one place
 * rather than reading four paragraphs to reach the table.
 *
 * THE ABSENCE SENTENCES AND THE TRIM LINE STAY IN THE OPEN, because
 * each is about what is NOT on the screen in front of him: a table
 * that had no data, or rows that were not drawn. Those are not
 * background. */
function dfsSection(name, body, drawn) {
  const table = dfsTable(name);
  const rules = dfsRules(table);
  const columns = dfsColumnList(table);
  return '<div class="card"><div class="cardhead">' +
    esc(DFS_TITLES[name]) + '</div>' +
    (table && table.present ? body(table) : "") +
    dfsAbsence(table) +
    (table && table.present ? dfsTrim(table, drawn) : "") +
    howToRead(rules + columns) + '</div>';
}

function bucketWords(label) {
  const parts = String(label || "").match(
    /^spreadT([123])\|totalT([123])$/);
  if (!parts) return String(label || "");
  return BUCKET_THIRDS[Number(parts[1]) - 1] + BUCKET_SPREAD + " · " +
    BUCKET_THIRDS[Number(parts[2]) - 1] + BUCKET_TOTAL;
}

function stackCards(table) {
  return '<div class="stacklist">' + (table.rows || []).map(
    function (row, index) {
      return '<div class="stackcard' + growClass() + '" style="--i:' +
        Math.min(index, 8) + '">' +
        '<div class="stacktop"><span class="stackteam">' +
        esc(row.team) + '</span>' +
        (row.under_owned
          ? '<span class="chip read">' + esc(DFS_UNDER_OWNED) +
            '</span>'
          : "") + '</div>' +
        '<div class="stacknums">' +
        '<span class="stacknum"><b>' +
        esc(num(row.combined_projection)) + '</b>' +
        esc(DFS_STACK_TOTAL) + '</span>' +
        '<span class="stacknum"><b>' + esc(num(row.stack_r)) + '</b>' +
        esc(DFS_STACK_R) + '</span>' +
        (row.qb_ownership === undefined
          ? ""
          : '<span class="stacknum"><b>' +
            esc(row.qb_ownership === null
              ? DASH : pct(row.qb_ownership)) + '</b>QB ' +
            esc(DFS_ENTRY_OWN.toLowerCase()) + '</span>') +
        (row.wr1_ownership === undefined
          ? ""
          : '<span class="stacknum"><b>' +
            esc(row.wr1_ownership === null
              ? DASH : pct(row.wr1_ownership)) + '</b>WR ' +
            esc(DFS_ENTRY_OWN.toLowerCase()) + '</span>') +
        '</div>' +
        '<div class="stackmeta">' + esc(bucketWords(row.bucket)) +
        '</div>' +
        (row.note
          ? '<div class="stackmeta">' + esc(plainNote(row.note)) +
            '</div>'
          : "") + '</div>';
    }).join("") + '</div>';
}

function gapRows(table) {
  return '<div class="gaplist">' +
    (table.rows || []).slice(0, DFS_ROWS_DRAWN).map(
      function (row, index) {
        return '<div class="gaprow' + growClass() + '" style="--i:' +
          Math.min(index, 8) + '">' +
          '<span class="gapcol"><span class="gapname">' +
          esc(row.name || row.player_id) + '</span>' +
          '<span class="gapmeta">' +
          esc(row.position + " · " + row.team) + '</span></span>' +
          '<span class="gapnums">' +
          '<span class="gapnum"><b>' + esc(num(row.projection)) +
          '</b>' + esc(DFS_ENTRY_PROJ) + '</span>' +
          (row.ownership === undefined
            ? ""
            : '<span class="gapnum"><b>' +
              esc(row.ownership === null ? DASH : pct(row.ownership)) +
              '</b>' + esc(DFS_ENTRY_OWN) + '</span>') +
          (row.rank_gap === undefined
            ? ""
            : '<span class="gapnum big"><b>' +
              esc(row.rank_gap === null ? DASH : String(row.rank_gap)) +
              '</b>' + esc(DFS_GAP) + '</span>') +
          '</span></div>';
      }).join("") + '</div>';
}

function boomRows(table) {
  return '<div class="gaplist">' +
    (table.rows || []).slice(0, DFS_ROWS_DRAWN).map(
      function (row, index) {
        return '<div class="gaprow' + growClass() + '" style="--i:' +
          Math.min(index, 8) + '">' +
          '<span class="gapcol"><span class="gapname">' +
          esc(row.name || row.player_id) + '</span>' +
          '<span class="gapmeta">' +
          esc(row.position + " · " + row.team) + '</span></span>' +
          '<span class="gapnums">' +
          '<span class="gapnum"><b>' + esc(num(row.projection)) +
          '</b>' + esc(DFS_ENTRY_PROJ) + '</span>' +
          '<span class="gapnum big"><b>' +
          esc(row.boom_proxy === null ? DASH : num(row.boom_proxy)) +
          '</b>' + esc(DFS_BOOM) + '</span></span></div>';
      }).join("") + '</div>';
}

/* THE READER'S OWN ENTRY, above the three tables. His players, our
 * projection and the sheet's ownership beside each, joined by the id
 * the service resolved. A player the sheet does not carry gets a
 * dash; an ownership the sheet does not carry gets a dash and the
 * sheet's own sentence about why. */
function dkEntryCard() {
  const held = heldTeam("dfs_entry");
  if (!held) return teamEntryCard("dfs_entry");
  const index = dfsPlayerIndex();
  const slots = held.slots || [];
  let anyMissingOwnership = false;
  const body = slots.map(function (slot, position) {
    const row = slot.player_id ? index[String(slot.player_id)] : null;
    const person = slot.player_id ? playerOf(slot.player_id) : null;
    const owned = row && "ownership" in row ? row.ownership : null;
    if (!row || owned === null || owned === undefined) {
      anyMissingOwnership = true;
    }
    return '<div class="gaprow' + growClass() + '" style="--i:' +
      Math.min(position, 8) + '">' +
      '<span class="gapcol"><span class="gapname">' +
      esc((row && row.name) || (person && person.name) ||
        slot.player_text || DASH) + '</span>' +
      '<span class="gapmeta">' +
      esc([slot.slot_label || "",
        slot.salary === null || slot.salary === undefined
          ? "" : TEAM_SALARY + " " + slot.salary].filter(
        function (part) { return part; }).join(" · ")) +
      '</span></span>' +
      '<span class="gapnums">' +
      '<span class="gapnum"><b>' +
      esc(row ? num(row.projection) : DASH) + '</b>' +
      esc(DFS_ENTRY_PROJ) + '</span>' +
      '<span class="gapnum big"><b>' +
      esc(owned === null || owned === undefined ? DASH : pct(owned)) +
      '</b>' + esc(DFS_ENTRY_OWN) + '</span></span></div>';
  }).join("");
  const absence = anyMissingOwnership ? ownershipAbsence() : "";
  return '<div class="card"><div class="cardhead">' +
    esc(DFS_ENTRY_HEAD) + '</div>' +
    '<div class="gaplist">' + body + '</div>' +
    (absence
      ? '<div class="legend">' + esc(plainNote(absence)) + '</div>'
      : "") + '</div>';
}

/* THE NO-BET FOOTER STAYS IN THE OPEN, always. S-016 binds it as a
 * fixed sentence on the sheet — this page contains no bet and no play
 * recommendation — and a promise about what a screen is NOT does not
 * go behind a tap. The two background rules beside it do. */
function dfsFooter() {
  const footer = dfsSentence("no_bet_footer");
  if (!footer) return "";
  return '<div class="card"><div class="overline">' +
    esc(DFS_FOOTER_HEAD) + '</div>' +
    '<div class="cardbody">' + esc(plainNote(footer)) + '</div>' +
    disclosure([dfsSentence("season_rule"),
      dfsSentence("ownership_rule")]) + '</div>';
}

function renderFantasyDfs() {
  if (!nav.dfs) {
    return '<div class="page">' + fantasyHead() +
      '<div class="card"><div class="cardhead">' +
      esc(DFS_OFFLINE_HEAD) + '</div><div class="cardbody">' +
      esc(nav.dfsNote || DFS_OFFLINE_BODY) + '</div></div>' +
      teamEntryCard("dfs_entry") + lineupSkeleton() + '</div>';
  }
  return '<div class="page">' + fantasyHead() +
    dkEntryCard() +
    dfsSection("stacks", stackCards, Infinity) +
    dfsSection("players", gapRows, DFS_ROWS_DRAWN) +
    dfsSection("boom_proxy", boomRows, DFS_ROWS_DRAWN) +
    dfsFooter() + '</div>';
}

/* ------------------------------------------------------------------
 * sec 6a — THE TEAM CONFIRM SCREEN
 * ------------------------------------------------------------------
 * The picture proposes; this screen is where the reader says what is
 * right. Every row can be edited and removed, an unmatched row says
 * so rather than being filled in, and the save button is the only
 * thing on this page that writes anything anywhere. */

function teamKindToggle() {
  return '<div class="card"><div class="overline">' +
    esc(TEAM_KIND_LABEL) + '</div>' +
    '<div class="seg" role="group" aria-label="' +
    esc(TEAM_KIND_LABEL) + '">' +
    [["season_long", TEAM_KIND_SEASON],
      ["dfs_entry", TEAM_KIND_DFS]].map(function (pair) {
      return '<button data-act="team-kind" data-kind="' +
        esc(pair[0]) + '" aria-pressed="' +
        (nav.team.kind === pair[0]) + '">' + esc(pair[1]) +
        '</button>';
    }).join("") + '</div></div>';
}

/* U5's second question, and the same shape as the first: whose lineup
 * the picture was. It is a fact only he knows, so he answers it, and
 * the answer travels with the confirmation into the store. */
function teamSideToggle() {
  return '<div class="card"><div class="overline">' +
    esc(OPP_KIND_LABEL) + '</div>' +
    '<div class="seg" role="group" aria-label="' +
    esc(OPP_KIND_LABEL) + '">' +
    [["mine", OPP_SIDE_MINE],
      ["opponent", OPP_SIDE_THEIRS]].map(function (pair) {
      return '<button data-act="team-side" data-side="' +
        esc(pair[0]) + '" aria-pressed="' +
        (nav.team.side === pair[0]) + '">' + esc(pair[1]) +
        '</button>';
    }).join("") + '</div></div>';
}

function teamSlotRows() {
  const slots = nav.team.slots || [];
  if (!slots.length) {
    return '<div class="card"><div class="cardbody">' +
      esc(nav.team.slots ? TEAM_NOTHING_TO_SAVE : TEAM_EMPTY) +
      '</div></div>';
  }
  const unmatched = slots.filter(function (slot) {
    return !slot.resolved;
  }).length;
  return '<div class="card"><div class="overline">' +
    esc(TEAM_SLOTS) + '</div>' +
    slots.map(function (slot, index) {
      return '<div class="teamslot' + growClass() + '" style="--i:' +
        Math.min(index, 8) + '">' +
        '<div class="legtop"><span class="slotlabel">' +
        esc(slot.slot_label || TEAM_SLOT_LABEL) + '</span>' +
        '<span class="slotstate ' +
        (slot.resolved ? "positive" : "absent") + '">' +
        esc(slot.resolved ? TEAM_MATCHED : TEAM_UNMATCHED) +
        '</span></div>' +
        (slot.resolved
          ? '<div class="slotname">' + esc(slot.name) + '</div>'
          : '<input class="trackline" id="teamslot' + index +
            '" type="text" autocomplete="off" aria-label="' +
            esc(TEAM_SLOT_LABEL + " " +
              (slot.slot_label || index + 1)) +
            '" value="' + esc(slot.player_text) + '">') +
        '<div class="slotmeta">' +
        esc([slot.opponent_text || "",
          slot.salary === null || slot.salary === undefined
            ? "" : TEAM_SALARY + " " + slot.salary].filter(
          function (part) { return part; }).join(" · ")) +
        '</div>' +
        '<button class="legdrop" data-act="team-drop" data-slot="' +
        index + '" aria-label="' + esc(TEAM_DROP + " " +
          (slot.name || slot.player_text)) + '">' + esc(TEAM_DROP) +
        '</button></div>';
    }).join("") +
    (unmatched
      ? '<div class="legend">' + esc(TEAM_UNMATCHED_NOTE) + '</div>'
      : "") + '</div>';
}

function renderTeam() {
  const slots = nav.team.slots || [];
  return '<div class="page">' + detailHead(TITLE_TEAM) +
    '<div class="card"><div class="cardhead">' +
    esc(TEAM_CONFIRM_HEAD) + '</div>' +
    /* THE PROMISE ITSELF is on the picker below, beside the button
     * that does the reading, so it is said once per screen and it is
     * said where the act happens. */
    '<div class="cardbody">' + esc(TEAM_CONFIRM_BODY) + '</div>' +
    (nav.team.surface
      ? '<div class="legend">' + esc(TEAM_FROM + nav.team.surface) +
        '</div>'
      : "") + '</div>' +
    shotPicker("team", "shot-team", SHOT_READ_TEAM) +
    teamSlotRows() + teamKindToggle() + teamSideToggle() +
    '<div class="card">' +
    (nav.team.saved
      ? '<div class="cardbody">' + esc(TEAM_SAVED) + '</div>'
      : '<button class="primary" data-act="team-save"' +
        (slots.length ? "" : " disabled") + '>' +
        esc(nav.picksBusy === "team" ? "…" : TEAM_SAVE) +
        '</button>') +
    (nav.picksOffline
      ? '<div class="legend">' + esc(SERVICE_OFFLINE) + '</div>'
      : "") + '</div></div>';
}

/* ------------------------------------------------------------------
 * U-PROJECTIONS-FULL — EVERY GAME, EVERY PLAYER (sec 8b)
 * ------------------------------------------------------------------
 * The breakdown U7 built, over the WHOLE SLATE. The document is a
 * list of games, each with its own game block and its own players, so
 * this screen gains exactly one thing U7 did not have: the HOME
 * SWITCHER, the same component, over the same kind of list. Under it
 * the roster, the search and the per-player breakdown are what they
 * already were — every honesty rule of the lab's page came across at
 * U7 and none of them is touched by there being sixteen games instead
 * of one.
 * ------------------------------------------------------------------ */

function projGames() {
  return (nav.projections && nav.projections.games) || [];
}

/* THE GAME ON SCREEN. `nav.projGame` is an index into the file's own
 * list, clamped rather than trusted: a document that arrives with
 * fewer games than the one before it must not leave the screen
 * pointing past its end. */
function projGame() {
  const list = projGames();
  if (!list.length) return null;
  return list[Math.min(nav.projGame, list.length - 1)] || null;
}

/* The players of the SELECTED game, which is what the roster lists
 * and what the search matches against — the lab's own scope, with the
 * switcher covering the rest of the week (sec 8b). */
function projPlayers() {
  const block = projGame();
  return (block && block.players) || [];
}

/* ...and the lookup that spans the WHOLE file, because a reader who
 * followed the link from a pick card is asking for one man and does
 * not know or care which block he is in. It answers with the player
 * AND the index of his game, so the screen can move the switcher to
 * him rather than telling him he is not here. */
function projFind(playerId) {
  const games = projGames();
  for (let g = 0; g < games.length; g += 1) {
    const people = games[g].players || [];
    for (let i = 0; i < people.length; i += 1) {
      if (people[i].player_id === playerId) {
        return { player: people[i], game: g };
      }
    }
  }
  return null;
}

function projPlayerOf(playerId) {
  const found = projFind(playerId);
  return found ? found.player : null;
}

/* The player the detail is open on: the one asked for, or — for a
 * reader who arrived on the list and has not chosen yet — the first
 * of the game on screen. Never a silent substitution for a man who is
 * not in the file: `projPlayerOf` returning null is a drawn state. */
function projSelected() {
  if (nav.proj.player) return projPlayerOf(nav.proj.player);
  const all = projPlayers();
  return all.length ? all[0] : null;
}

/* The week the file is for, said in the app's words. The MATCHUP is
 * no longer part of this line: the switcher says which game it is,
 * where a reader can also change it. */
function projMeta() {
  const run = (nav.projections && nav.projections.run) || {};
  const week = numberOrNull(run.week);
  return week === null ? "" : WEEK_WORD + week;
}

/* The game one player is in, for the line under his name on his own
 * breakdown screen. */
function projWhere(player) {
  const found = player ? projFind(player.player_id) : null;
  const block = found ? projGames()[found.game] : null;
  const game = block && block.game;
  if (!game) return "";
  return String(game.away || "") + " @ " + String(game.home || "");
}

/* sec 5.1's search, on this screen's own list. The idiom is the home
 * switcher's — a 16px input, a basis line under it that says what is
 * being matched, and the sec 8 empty state naming what was typed. */
function projSearch() {
  const query = String(nav.proj.query || "");
  return '<div class="card projsearch">' +
    '<div class="searchbar">' + icon("search", 18, 2.5) +
    '<input class="searchinput" id="projsearch" type="text" ' +
    'autocomplete="off" placeholder="' +
    esc(PROJ_SEARCH_PLACEHOLDER) + '" aria-label="' +
    esc(PROJ_SEARCH_PLACEHOLDER) + '" value="' + esc(query) + '">' +
    '</div><div class="searchbasis">' + esc(PROJ_SEARCH_BASIS) +
    '</div></div>';
}

function projMatches() {
  const query = String(nav.proj.query || "").trim().toLowerCase();
  const all = projPlayers();
  if (!query) return all;
  return all.filter(function (player) {
    return String(player.name || "").toLowerCase().indexOf(query) !== -1;
  });
}

/* The roster, grouped by position the way the file lists it. Each row
 * is a real button at a real size (sec 9) and pushes that player's
 * breakdown. */
function projRoster(list) {
  const groups = {};
  list.forEach(function (player) {
    const pos = String(player.pos || "").toUpperCase() || DASH;
    (groups[pos] = groups[pos] || []).push(player);
  });
  const order = PROJ_POS_ORDER.filter(function (pos) {
    return groups[pos];
  }).concat(Object.keys(groups).filter(function (pos) {
    return PROJ_POS_ORDER.indexOf(pos) === -1;
  }).sort());
  return order.map(function (pos) {
    return '<div class="card projgroup"><div class="overline">' +
      esc(pos) + '</div>' + groups[pos].map(function (player, index) {
        return '<button class="projrow' + growClass() + '" style="--i:' +
          index + '" data-act="projection" data-player="' +
          esc(player.player_id) + '" aria-label="' +
          esc(PROJ_FULL + ": " + player.name) + '">' +
          '<span class="projname">' + esc(player.name) + '</span>' +
          '<span class="projteam">' + esc(player.team) + '</span>' +
          '</button>';
      }).join("") + '</div>';
  }).join("");
}

function renderProjections() {
  const head = '<div class="pagehead"><div class="pagetitle">' +
    esc(TITLE_PROJECTIONS) + '</div><div class="pagemeta">' +
    esc(nav.projections ? projMeta() : "") + '</div></div>';
  /* THE HONEST ARM, unchanged by there being more games in the file:
   * no document, nothing drawn, and the sentence says which kind of
   * absence it is. */
  if (!nav.projections) {
    return '<div class="page">' + head +
      '<div class="card"><div class="cardhead">' +
      esc(PROJ_OFFLINE_HEAD) + '</div><div class="cardbody">' +
      esc(nav.projNote || PROJ_OFFLINE_BODY) + '</div></div></div>';
  }
  const game = projGame();
  return '<div class="page">' + head +
    /* THE HOME SWITCHER, the same renderer (sec 8b). Its search
     * affordance is off here because the search on this screen is a
     * PLAYER search within the game, which is the lab's own scope —
     * the arrows are what cover the rest of the week. */
    (game
      ? '<div class="card projswitch">' +
        switcher(game.game, projGames(), nav.projGame, "proj-game",
          "") + '</div>'
      : "") +
    projSearch() +
    '<div class="overline projpick">' + esc(PROJ_PICK_A_PLAYER) +
    '</div><div class="projlist" id="projlist">' + projListBody() +
    '</div>' + explainer(SHORT_PROJECTIONS, [PROJ_SCOPE]) + '</div>';
}

/* The list under the search, and the sec 8 empty state that belongs
 * to whichever emptiness it is: nobody matched what was typed, or the
 * file carries nobody at all. It is its own function because the
 * keystroke handler redraws THIS and nothing else. */
function projListBody() {
  const list = projMatches();
  if (list.length) return projRoster(list);
  const typed = String(nav.proj.query || "").trim();
  return '<div class="card"><div class="cardbody">' +
    esc(typed ? PROJ_SEARCH_EMPTY + ' "' + typed + '"'
      : PROJ_NO_PLAYERS) + '</div></div>';
}

/* ALL PROJECTED RESULTS. One block per stat the generation carried a
 * number for — a stat with neither a projection nor a range is not a
 * result and is not drawn — carrying the projection, what has moved
 * since the week opened, the likeliness line and the five saved
 * points of that stat's outcomes.
 *
 * A BLOCK RATHER THAN A WIDE TABLE ROW, and that is a decision about
 * a phone. Eight columns of five-figure numbers cannot fit 360px, so
 * the lab's table would either scroll sideways — taking the
 * likeliness line half off the screen with it, which is the one thing
 * on this screen that has to be seen whole — or drop two of the five
 * points, which would be hiding a number the generation saved. The
 * block keeps every figure and puts the line at full width. */
function projResults(player) {
  const blocks = PROJ_STATS.filter(function (stat) {
    return numberOrNull((player.proj || {})[stat[1]]) !== null ||
      Array.isArray((player.stat_quantiles || {})[stat[1]]);
  }).map(function (stat) {
    const points = (player.stat_quantiles || {})[stat[1]];
    const spread = PROJ_POINTS.map(function (point) {
      const value = Array.isArray(points) ? points[point[1]] : null;
      return '<span class="ppoint"><span class="ppointlabel">' +
        esc(point[0]) + '</span><span class="ppointvalue">' +
        esc(projNumber(value, stat[2])) + '</span></span>';
    }).join("");
    return '<div class="pstat"><div class="pstathead">' +
      '<span class="pstatname">' + esc(stat[0]) + '</span>' +
      projMoved(player, stat[1], stat[2]) +
      '<span class="pstatproj">' +
      esc(projNumber((player.proj || {})[stat[1]], stat[2])) +
      '</span></div>' +
      projLikely(points, (player.proj || {})[stat[1]]) +
      '<div class="ppoints">' + spread + '</div></div>';
  }).join("");
  if (!blocks) {
    return '<div class="cardbody">' + esc(PROJ_NO_RESULTS) + '</div>';
  }
  return '<div class="presults">' + blocks + '</div>';
}

/* A saved number at the precision it can carry. The page never
 * rescales one: a share saved as 0.62 is drawn as 0.62. */
function projNumber(value, places) {
  const number = numberOrNull(value);
  if (number === null) return DASH;
  return number.toFixed(places);
}

/* THE LIKELINESS LINE. The lab's L2 strip: each stat's own scale, 0 to
 * the wider of its high end and its projection, with the marks placed
 * by the one division this screen is allowed to do.
 *
 * A DEGENERATE ROW DRAWS NOTHING, and that is the point of the guard
 * rather than an accident of it. No range, a point that is not a
 * number, no projection, a scale with nothing above zero, or a low
 * end equal to the high end — the Any TD row whose whole visible
 * range is 0 — would each draw a strip asserting a spread the
 * generation never produced. Every one of them returns "". */
function projLikely(points, mean) {
  if (!Array.isArray(points)) return "";
  const low = numberOrNull(points[0]);
  const lowMid = numberOrNull(points[1]);
  const middle = numberOrNull(points[2]);
  const highMid = numberOrNull(points[3]);
  const high = numberOrNull(points[4]);
  const centre = numberOrNull(mean);
  const marks = [low, lowMid, middle, highMid, high, centre];
  for (let index = 0; index < marks.length; index += 1) {
    if (marks[index] === null) return "";
  }
  if (low === high) return "";
  const top = Math.max(high, centre);
  if (!(top > 0)) return "";
  return '<div class="like"><span class="plikelab">' +
    esc(PROJ_LIKELY) + '</span><span class="likezero">0</span>' +
    '<span class="liketrack">' +
    '<span class="likespan" style="left:' + projShare(low, top) +
    ';width:' + projShare(high - low, top) + '"></span>' +
    '<span class="likecore" style="left:' + projShare(lowMid, top) +
    ';width:' + projShare(highMid - lowMid, top) + '"></span>' +
    '<span class="liketick" style="left:' + projShare(middle, top) +
    '"></span>' +
    '<span class="likedot" style="left:' + projShare(centre, top) +
    '"></span></span></div>';
}

/* ONE MARK'S PLACE on one row's scale, as a CSS percentage. It is
 * GEOMETRY: a saved number over its own row's scale, clamped so a
 * projection above the high end cannot push a mark off the track it
 * belongs to. It produces no quantity and is never shown as a
 * number. */
function projShare(value, top) {
  const part = (value / top) * 100;
  return Math.min(100, Math.max(0, part)).toFixed(2) + "%";
}

function projMoved(player, key, places) {
  const moved = numberOrNull((player.movement || {})[key]);
  const opened = numberOrNull((player.week_open || {})[key]);
  if (moved === null) {
    return '<span class="pmv flat" title="' + esc(PROJ_NO_MOVE) +
      '">' + esc(DASH) + '</span>';
  }
  /* Rounded FIRST, then signed: a move of -0.004 carries shown to one
   * decimal is not a fall, and "-0.0" would read as one. */
  const rounded = Number(moved.toFixed(places));
  const shown = (rounded > 0 ? "+" : "") +
    (rounded === 0 ? Math.abs(rounded) : rounded).toFixed(places);
  const family = rounded > 0 ? "up" : (rounded < 0 ? "dn" : "flat");
  const from = opened === null ? DASH : opened.toFixed(places);
  return '<span class="pmv ' + family + '" title="' +
    esc(PROJ_WEEK_OPEN + from + " · " + PROJ_MOVED_NOTE) + '">' +
    esc(shown) + '<span class="pmvsub">' + esc(PROJ_FROM + from) +
    '</span></span>';
}

/* A MAPPING THE GENERATION SAVED WHOLE, drawn as the small table it
 * is: one row per (profile, bucket). The touchdown conversion is a
 * rate PER PART OF THE FIELD, applied as a mixture over how much of
 * each part a player sees, so there is no single number that is "his"
 * — collapsing them into one would be arithmetic this page invented.
 * Anything that is not a mapping of mappings returns "" and the caller
 * draws the saved text as it stands. */
function projBuckets(text) {
  let mapping;
  try {
    mapping = JSON.parse(text);
  } catch (err) {
    return "";
  }
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) {
    return "";
  }
  const rows = [];
  Object.keys(mapping).forEach(function (profile) {
    const buckets = mapping[profile];
    if (!buckets || typeof buckets !== "object" ||
        Array.isArray(buckets)) {
      return;
    }
    Object.keys(buckets).forEach(function (bucket) {
      const rate = numberOrNull(buckets[bucket]);
      rows.push('<tr><th scope="row">' + esc(profile) + " · " +
        esc(bucket) + '</th><td>' +
        esc(rate === null ? DASH : rate.toFixed(3)) + '</td></tr>');
    });
  });
  if (!rows.length) return "";
  return '<table class="pbuckets"><tbody>' + rows.join("") +
    '</tbody></table>';
}

/* ONE CELL, BOTH TABLES: the value the generation saved, or the
 * sentence saying what it did not carry — and the sentence is the
 * generation's own, put through the plain-language layer on its way
 * to the page. Text is drawn as it was saved; this page does not
 * re-format a value it did not compute. */
function projCell(cell) {
  if (cell && cell.value !== null && cell.value !== undefined) {
    if (typeof cell.value === "number") {
      return '<td class="pelval">' + esc(projElement(cell.value)) +
        '</td>';
    }
    const buckets = projBuckets(cell.value);
    if (buckets) return '<td class="pelval">' + buckets + '</td>';
    return '<td class="pelval ptext">' + esc(cell.value) + '</td>';
  }
  return '<td class="preason">' + esc(DASH) + ' (' +
    esc(plainNote((cell && cell.reason) || "")) + ')</td>';
}

/* An element's value at the precision the number deserves: a share or
 * a rate is a fraction and wants its digits, a count of plays does
 * not. Nothing is rescaled — 0.62 is 0.62, never "62%", because the
 * saved number is the one our numbers used. */
function projElement(value) {
  const number = numberOrNull(value);
  if (number === null) return DASH;
  const size = Math.abs(number);
  if (size < 1) return number.toFixed(3);
  if (size < 20) return number.toFixed(2);
  return number.toFixed(1);
}

function projRows(player, block, which) {
  const order = (block && block.order) || [];
  const labels = (block && block.labels) || {};
  const pooled = (block && block.pooled) || [];
  const pooledLabel = (block && block.pooled_label) || "";
  return order.map(function (element) {
    const cell = (player[which] || {})[element] || {};
    const tag = (pooled.indexOf(element) !== -1 && pooledLabel)
      ? '<span class="ptag">' + esc(plainNote(pooledLabel)) + '</span>'
      : "";
    return '<tr class="pelrow"><th scope="row">' +
      esc(plainNote(labels[element] || element)) + tag + '</th>' +
      projCell(cell) + '</tr>';
  }).join("");
}

function projContext(player) {
  const block = (nav.projections && nav.projections.context) || {};
  const rows = projRows(player, block, "context");
  if (!rows) return "";
  return '<div class="card"><div class="overline">' +
    esc(PROJ_CONTEXT_HEAD) + '</div><div class="legend">' +
    esc(PROJ_CONTEXT_NOTE) + '</div>' +
    '<div class="ptscroll"><table class="ptable pel"><tbody>' + rows +
    '</tbody></table></div></div>';
}

function projChain(player) {
  const block = (nav.projections && nav.projections.elements) || {};
  const rows = projRows(player, block, "elements");
  const share = numberOrNull(player.p_ceiling);
  const probability = share === null ? ""
    : '<tr class="pelrow"><th scope="row">' +
      esc(PROJ_CEILING_LABEL) + '<span class="ptag">' +
      esc(PROJ_PROBABILITY) + '</span></th><td class="pelval">' +
      esc(pct(share)) + '</td></tr>';
  const absent = block.generation_id ? ""
    : '<div class="cardbody">' + esc(PROJ_CHAIN_ABSENT) + ' ' +
      esc(plainNote(block.absent_reason || "")) + '</div>';
  return '<div class="card"><div class="overline">' +
    esc(PROJ_CHAIN_HEAD) + '</div><div class="legend">' +
    esc(PROJ_CHAIN_NOTE) + '</div>' + absent +
    '<div class="ptscroll"><table class="ptable pel"><tbody>' + rows +
    probability + '</tbody></table></div></div>';
}

/* THE SHARED STATLINE, on its third surface (UI_ALPHA_SPEC sec 1).
 * The same renderer the home expanded rows and the pick card call —
 * every stat this run carried a projection for, with the absence
 * idiom the component already has. */
function projStatline(player) {
  const entries = PROJ_STATS.filter(function (stat) {
    return numberOrNull((player.proj || {})[stat[1]]) !== null ||
      Array.isArray((player.stat_quantiles || {})[stat[1]]);
  }).map(function (stat) {
    const value = numberOrNull((player.proj || {})[stat[1]]);
    return { label: stat[0], value: value,
      reason: value === null ? PROJ_NO_MEAN : "" };
  });
  return entries.length ? statline(entries) : "";
}

function projProvenance() {
  const run = (nav.projections && nav.projections.run) || {};
  if (!run.generated_ts) return "";
  return '<div class="legend">' + esc(PROJ_GENERATED) +
    esc(String(run.generated_ts).replace("T", " ").slice(0, 16)) +
    ' UTC</div>';
}

function renderProjection() {
  const player = projSelected();
  const head = detailHead(TITLE_PROJECTIONS);
  if (!nav.projections) {
    return '<div class="page">' + head +
      '<div class="card"><div class="cardhead">' +
      esc(PROJ_OFFLINE_HEAD) + '</div><div class="cardbody">' +
      esc(nav.projNote || PROJ_OFFLINE_BODY) + '</div></div></div>';
  }
  if (!player) {
    return '<div class="page">' + head +
      '<div class="card"><div class="cardbody">' +
      esc(PROJ_NOT_IN_FILE) + '</div></div></div>';
  }
  const meta = [player.team, player.pos];
  const where = projWhere(player);
  if (where) meta.push(where);
  const week = projMeta();
  if (week) meta.push(week);
  return '<div class="page">' + head +
    '<div class="card playercard">' +
    '<div class="exphead"><span class="pickname">' +
    esc(player.name) + '</span><span class="expteam">' +
    esc(meta.join(" · ")) + '</span></div>' +
    '<div class="overline">' + esc(PROJECTED) + '</div>' +
    projStatline(player) + '</div>' +
    '<div class="card"><div class="overline">' +
    esc(PROJ_RESULTS_HEAD) + '</div>' +
    /* sec 8a: two paragraphs explaining a chart the reader can see
     * become one line and a tap. Both sentences are inside, whole. */
    explainer(SHORT_BREAKDOWN, [PROJ_MOVED_NOTE, PROJ_LIKELY_NOTE]) +
    projResults(player) + '</div>' +
    projContext(player) + projChain(player) + projProvenance() +
    '</div>';
}

/* sec 2.2 and sec 4: the tab stays active on EVERY one of its
 * sub-views, and the segmented control is drawn on every one of them
 * so the reader can always see which he is on and reach the others.
 * Two tabs use it now, so it is written once. */
function subToggle(tab) {
  return '<div class="seg" role="group" aria-label="' +
    esc(SUB_GROUP_LABEL[tab]) + '">' +
    TAB_SUBS[tab].map(function (sub) {
      return '<button data-act="sub" data-tab="' + esc(tab) +
        '" data-sub="' + esc(sub) + '" aria-pressed="' +
        (nav.subs[tab] === sub) + '">' + esc(SUB_LABELS[sub]) +
        '</button>';
    }).join("") + '</div>';
}

function betsHead() {
  return '<div class="pagehead"><div class="pagetitle">' + esc(TITLE_BETS) +
    '</div></div>' + subToggle("bets");
}

/* ------------------------------------------------------------------
 * U3 — THE DRAWN PIECES
 * ------------------------------------------------------------------ */

/* sec 5.4's mini outcome-shape histogram, drawn from the published
 * distribution and nothing else. The bars are scaled to the TALLEST
 * bar in this prop's own distribution, which is a drawing decision
 * and not a probability: the numbers underneath are unchanged and the
 * chart carries its summary in an aria-label (sec 9). */
const HIST_W = 76;
const HIST_H = 26;
const HIST_GAP = 1;

function histogram(prop, tall) {
  const bars = (prop && prop.distribution) || [];
  if (!bars.length) return "";
  const height = tall ? 120 : HIST_H;
  const width = tall ? 300 : HIST_W;
  const peak = bars.reduce(function (held, bar) {
    return Math.max(held, bar.p);
  }, 0) || 1;
  const step = width / bars.length;
  const lean = prop.lean;
  const cells = bars.map(function (bar, index) {
    const size = Math.max(1, (bar.p / peak) * (height - 2));
    /* The bars on the side the model leans are ink; the others are
     * track grey (sec 4's distribution chart). Which side a bar is on
     * is decided by the LINE, which the exporter published beside it. */
    const past = lean === "less"
      ? bar.k < Math.ceil(prop.line)
      : bar.k >= Math.ceil(prop.line);
    return '<rect x="' + (index * step + HIST_GAP).toFixed(1) +
      '" y="' + (height - size).toFixed(1) +
      '" width="' + Math.max(1, step - HIST_GAP * 2).toFixed(1) +
      '" height="' + size.toFixed(1) + '" rx="1" fill="' +
      (past ? "var(--ink)" : "var(--track)") + '"></rect>';
  }).join("");
  const marker = '<line x1="' +
    (Math.min(bars.length, Math.ceil(prop.line)) * step).toFixed(1) +
    '" y1="0" x2="' +
    (Math.min(bars.length, Math.ceil(prop.line)) * step).toFixed(1) +
    '" y2="' + height + '" stroke="var(--heating)" ' +
    'stroke-width="1.5" stroke-dasharray="3 2"></line>';
  const labels = tall
    ? '<div class="histlabels">' + bars.map(function (bar) {
      return '<span>' + esc(bar.label) + '</span>';
    }).join("") + '</div>'
    : "";
  return '<span class="hist' + (tall ? " tall" : "") + '">' +
    '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' +
    width + ' ' + height + '" role="img" aria-label="' +
    esc(PICK_SHAPE + ": " + bars.map(function (bar) {
      return bar.label + " " + pct(bar.p);
    }).join(", ") + ". Line " + prop.line) + '">' +
    cells + marker + '</svg>' + labels + '</span>';
}

/* sec 4's range bar, for the markets that carry no P(k): the 10th to
 * 90th percentile as a segment with the median as a dot. Every number
 * in it is one the exporter read off the grid. */
function rangeBar(prop, tall) {
  const band = prop && prop.floor_median_ceiling;
  if (!band || band.p10 === null || band.p90 === null) return "";
  const width = tall ? 300 : HIST_W;
  const height = tall ? 34 : HIST_H;
  const lo = Math.min(band.p10, prop.line);
  const hi = Math.max(band.p90, prop.line);
  const span = (hi - lo) || 1;
  const at = function (value) {
    return (((value - lo) / span) * (width - 8) + 4).toFixed(1);
  };
  const mid = (height / 2).toFixed(1);
  return '<span class="rangebar' + (tall ? " tall" : "") + '">' +
    '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' +
    width + ' ' + height + '" role="img" aria-label="' +
    esc(PICK_FLOOR + " " + num(band.p10) + ", " +
      PICK_MEDIAN.toLowerCase() + " " + num(band.p50) + ", " +
      PICK_CEILING.toLowerCase() + " " + num(band.p90) +
      ". Line " + prop.line) + '">' +
    '<line x1="4" y1="' + mid + '" x2="' + (width - 4) + '" y2="' + mid +
    '" stroke="var(--track)" stroke-width="2"></line>' +
    '<line x1="' + at(band.p10) + '" y1="' + mid + '" x2="' +
    at(band.p90) + '" y2="' + mid +
    '" stroke="var(--border-strong)" stroke-width="8" ' +
    'stroke-linecap="round"></line>' +
    '<circle cx="' + at(band.p50) + '" cy="' + mid +
    '" r="4" fill="var(--ink)"></circle>' +
    '<line x1="' + at(prop.line) + '" y1="2" x2="' + at(prop.line) +
    '" y2="' + (height - 2) + '" stroke="var(--heating)" ' +
    'stroke-width="1.5" stroke-dasharray="3 2"></line>' +
    '</svg></span>';
}

function shapeFor(prop, tall) {
  if (prop && prop.distribution) return histogram(prop, tall);
  return rangeBar(prop, tall);
}

/* sec 4's probability bar: a track, the value as a fill, the
 * uncertainty band behind it, and a 50% tick. The band is ALWAYS
 * drawn where one exists (honesty rule sec 7.1). */
function probBar(label, value, band, note, tone) {
  const width = value === null || value === undefined
    ? 0 : Math.max(0, Math.min(1, value)) * 100;
  const lo = band ? Math.max(0, Math.min(1, band[0])) * 100 : null;
  const hi = band ? Math.max(0, Math.min(1, band[1])) * 100 : null;
  return '<div class="probrow"><div class="problabel">' +
    '<span>' + esc(label) + '</span>' +
    '<span class="probvalue">' + esc(pct(value)) +
    (note ? '<span class="probnote"> ' + esc(note) + '</span>' : "") +
    '</span></div>' +
    '<div class="probtrack" role="img" aria-label="' +
    esc(label + " " + pct(value) +
      (band ? ", range " + pct(band[0]) + " to " + pct(band[1]) : "")) +
    '">' +
    (band
      ? '<span class="probband" style="left:' + lo.toFixed(1) +
        '%;width:' + Math.max(0.5, hi - lo).toFixed(1) + '%"></span>'
      : "") +
    '<span class="probfill ' + esc(tone || "") + '" style="width:' +
    width.toFixed(1) + '%"></span>' +
    '<span class="probtick"></span></div></div>';
}

/* ------------------------------------------------------------------
 * sec 5.4 — THE SCREEN LIST
 * ------------------------------------------------------------------ */

function sortToggle() {
  return '<div class="seg sortseg" role="group" aria-label="' +
    esc(SORT_GROUP_LABEL) + '">' + SORTS.map(function (sort) {
      return '<button data-act="sort" data-sort="' + esc(sort[0]) +
        '" aria-pressed="' + (nav.sort === sort[0]) + '">' +
        esc(sort[1]) + '</button>';
    }).join("") + '</div>';
}

/* BOTH SORTS READ A PUBLISHED NUMBER. `gap_pts` and `model_p` are the
 * exporter's; the order they are put in is a display decision and the
 * only thing decided here. */
function screenRows() {
  const rows = allProps();
  rows.sort(function (one, two) {
    if (nav.sort === SORT_CHANCE) {
      /* MODEL CHANCE MAKES NO EDGE CLAIM, so it is not re-ordered
       * (UI_ALPHA_SPEC sec 5): a blind-spot candidate sits wherever
       * its published chance puts it, and carries its note there. */
      return (two.prop.model_p - one.prop.model_p) ||
        (two.prop.gap_pts - one.prop.gap_pts) ||
        one.person.name.localeCompare(two.person.name);
    }
    /* BIGGEST GAP IS AN EDGE CLAIM AND IS THE DEFAULT VIEW, which is
     * how the deployed week-2 slate came to lead with the model's
     * blind spots dressed as its best finds. The band comes first in
     * the comparison, so every moderate gap is above every blind-spot
     * candidate; inside each band the order is the published gap,
     * exactly as it was. NOTHING IS DROPPED — this moves rows, it
     * does not remove them. */
    return (gapBand(one.prop) - gapBand(two.prop)) ||
      (two.prop.gap_pts - one.prop.gap_pts) ||
      (two.prop.model_p - one.prop.model_p) ||
      one.person.name.localeCompare(two.person.name);
  });
  return rows;
}

/* Where the sec 5 divider goes: the first blind-spot candidate in the
 * Biggest-gap order, or nowhere. In the Model-chance view the rows are
 * interleaved by design and there is no band to head, so the divider
 * does not appear at all. */
function blindSpotDividerAt(rows) {
  if (nav.sort !== SORT_GAP) return -1;
  for (let index = 0; index < rows.length; index += 1) {
    if (isBlindSpot(rows[index].prop)) return index;
  }
  return -1;
}

function screenRow(entry, index) {
  const prop = entry.prop;
  const edge = isEdge(prop);
  /* THE NOTE IS SPOKEN AS WELL AS SHOWN. A reader on a screen reader
   * meets the same admission a reader on glass does, in the same
   * sentence, on the same row. */
  const blind = isBlindSpot(prop);
  const label = entry.person.name + ", " + entry.person.pos +
    " against " + opponentOf(entry.game, entry.side) + ", " +
    prop.market_label + " " + prop.line + ", " + prop.lean_label +
    " " + pct(prop.model_p) + ", " + gapText(prop) +
    (blind ? ". " + BLIND_SPOT_NOTE : "");
  return '<button class="screenrow' + (blind ? " blind" : "") +
    growClass() + '" style="--i:' +
    Math.min(index, 8) + '" data-act="prop" data-player="' +
    esc(entry.id) + '" data-market="' + esc(prop.market) +
    '" aria-label="' + esc(label) + '">' +
    '<span class="screencol">' +
    '<span class="screenname">' + esc(entry.person.name) + '</span>' +
    /* sec 8a: the MARKET'S OWN LABEL, never its key. "WR · vs IND ·
     * player_reception_yds 4.5" was a database column read at a
     * reader; "WR · vs IND · Receiving yards 4.5" is the same row. */
    '<span class="screenmeta">' + esc(entry.person.pos + " · vs " +
      opponentOf(entry.game, entry.side) + " · " + prop.market_label +
      " " + prop.line) + '</span>' +
    (blind ? '<span class="blindnote">' + esc(BLIND_SPOT_NOTE) +
      '</span>' : "") + '</span>' +
    shapeFor(prop, false) +
    '<span class="screennums">' +
    '<span class="sidepill ' + esc(prop.lean) + '">' +
    esc(prop.lean_label) + '</span>' +
    '<span class="screenp">' + esc(pct(prop.model_p)) + '</span>' +
    '<span class="screengap ' + (edge ? "positive" : "absent") + '">' +
    esc(gapText(prop)) + '</span></span></button>';
}

function renderBetsScreen() {
  if (!nav.slate) {
    return '<div class="page">' + betsHead() +
      '<div class="cardhead offhead">' + esc(OFFLINE_HEAD) + '</div>' +
      '<div class="legend">' + esc(nav.slateNote || OFFLINE_BODY) +
      '</div></div>';
  }
  const rows = screenRows();
  /* EVERY ROW IN `rows` IS DRAWN. The divider is inserted BETWEEN two
   * of them; it never stands in for one, and there is no branch here
   * that skips a prop (UI_ALPHA_SPEC sec 5: no number is hidden). */
  const divider = blindSpotDividerAt(rows);
  return '<div class="page">' + betsHead() +
    '<div class="slatehead"><div class="slatetitle">' + esc(SLATE_HEADER) +
    '</div><div class="pagemeta">' + esc(SLATE_BASIS) + '</div></div>' +
    sortToggle() +
    (rows.length
      ? '<div class="screenlist">' +
        rows.map(function (entry, index) {
          return (index === divider
            ? '<div class="blinddivider">' + esc(BLIND_SPOT_DIVIDER) +
              '</div>'
            : "") + screenRow(entry, index);
        }).join("") + '</div>'
      : '<div class="legend">' + esc(NO_CAPTURED_ROWS) + '</div>') +
    /* sec 8a: one line, then the tap. What "vs the market" means,
     * the 3-point rule this page applies and which markets have been
     * checked against history are all still said, in full, one tap
     * down. */
    explainer(SHORT_SCREEN,
      [GAP_FOOTNOTE, CLIENT_GAP_RULE, CALIBRATION_NOTE]) + '</div>';
}

/* ------------------------------------------------------------------
 * sec 5.8 — THE LIVE LIST
 * ------------------------------------------------------------------ */

/* The chance a row shows, and the ONE place it is read: the live one
 * when the service computed it, the pregame one when it did not —
 * which before kickoff is the same number, honestly named. It is a
 * READ of two stored fields and never a computation. */
function liveChance(bet) {
  const now = numberOrNull(bet.p_now);
  return now === null ? numberOrNull(bet.p_pregame) : now;
}

function liveBand(bet) {
  return numberOrNull(bet.p_now) === null ? bet.band_pregame : bet.band;
}

function bandText(band) {
  if (!band || band.length < 2) return "";
  return LIVE_RANGE + Math.round(band[0] * 100) + "–" +
    Math.round(band[1] * 100);
}

function stateWord(bet) {
  return LIVE_STATE_WORDS[bet.state] || String(bet.state || "");
}

function stateTone(bet) {
  return LIVE_STATE_TONE[bet.state] || "muted";
}

/* What the bet still asks for, in the service's own words for it. The
 * number and the unit both ride the answer; a settled bet says so
 * instead. */
function needLine(bet) {
  if (bet.state === "cashed") return LIVE_HIT_WORD;
  if (bet.state === "lost") return LIVE_SETTLED;
  const left = numberOrNull(bet.need_now);
  if (left === null) return DASH;
  return LIVE_NEEDS + left + " " + (bet.need_unit || "");
}

function gameClock(bet) {
  const game = bet.game || {};
  if (!game.period) return "";
  return "Q" + game.period + (game.clock ? " " + game.clock : "");
}

/* THE SPARKLINE — geometry over the accumulated series and nothing
 * else. `aria-hidden` because the row's own text carries every number
 * on it. */
function liveSpark(bet) {
  const series = seriesFor(bet);
  if (!series.length) return "";
  const axis = numberOrNull((bet.game || {}).axis_max_s) ||
    LIVE_FULL_GAME_S;
  const usableW = LIVE_SPARK_W - SPARK_PAD * 2;
  const usableH = LIVE_SPARK_H - SPARK_PAD * 2;
  const x = function (t) {
    return SPARK_PAD + Math.max(0, Math.min(1, t / axis)) * usableW;
  };
  const y = function (p) {
    return SPARK_PAD + (1 - Math.max(0, Math.min(1, p))) * usableH;
  };
  const path = series.map(function (point, index) {
    return (index ? "L" : "M") + x(point.t).toFixed(1) + " " +
      y(point.p).toFixed(1);
  }).join(" ");
  const last = series[series.length - 1];
  const pregame = series[0];
  const future = LIVE_SPARK_W - SPARK_PAD - x(last.t);
  return '<svg class="livespark" width="' + LIVE_SPARK_W +
    '" height="' + LIVE_SPARK_H + '" viewBox="0 0 ' + LIVE_SPARK_W +
    ' ' + LIVE_SPARK_H + '" aria-hidden="true" focusable="false">' +
    (future > 0
      ? '<rect class="sparkfuture" x="' + x(last.t).toFixed(1) +
        '" y="0" width="' + future.toFixed(1) + '" height="' +
        LIVE_SPARK_H + '"></rect>'
      : "") +
    '<line class="sparkpregame" x1="' + SPARK_PAD + '" y1="' +
    y(pregame.p).toFixed(1) + '" x2="' + (LIVE_SPARK_W - SPARK_PAD) +
    '" y2="' + y(pregame.p).toFixed(1) + '"></line>' +
    '<path class="sparkline" d="' + path + '"></path>' +
    '<circle class="sparknow ' + stateTone(bet) + '" cx="' +
    x(last.t).toFixed(1) + '" cy="' + y(last.p).toFixed(1) +
    '" r="3"></circle></svg>';
}

function liveRow(bet, index) {
  const chance = liveChance(bet);
  const label = bet.player.name + ", " + stateWord(bet) + ", " +
    bet.label + " " + (bet.line_label || "") + ", " + needLine(bet) +
    ", " + pct(chance) + ". " + LIVE_OPEN;
  return '<button class="liverow' + growClass() + '" style="--i:' +
    Math.min(index, 8) + '" data-act="livecard" data-bet="' +
    esc(bet.bet_id) + '" aria-label="' + esc(label) + '">' +
    '<span class="livecol">' +
    '<span class="liveline">' +
    '<span class="livename">' + esc(bet.player.name) + '</span>' +
    '<span class="chip ' + stateTone(bet) + '">' + esc(stateWord(bet)) +
    '</span></span>' +
    '<span class="livemeta">' + esc(
      bet.label + " " + (bet.line_label || "") +
      (gameClock(bet) ? " · " + gameClock(bet) : "")) + '</span>' +
    '<span class="liveneed">' + esc(needLine(bet)) + '</span>' +
    '</span>' + liveSpark(bet) +
    '<span class="livep ' + stateTone(bet) + '">' +
    esc(pct(chance)) + '</span></button>';
}

function liveHead() {
  const summary = (nav.live && nav.live.summary) || {};
  const counts = [];
  if (summary.live !== undefined) {
    counts.push(summary.live + LIVE_COUNTS);
  }
  if (summary.hit !== undefined) {
    counts.push(summary.hit + LIVE_COUNTS_HIT);
  }
  return counts.length
    ? '<div class="pagemeta">' + esc(counts.join(" · ")) + '</div>'
    : "";
}

function liveFreshness() {
  if (!nav.live) return "";
  const age = numberOrNull(nav.live.age_s);
  if (age === null || age <= 0) return LIVE_FRESH;
  return LIVE_UPDATED + age + "s" + LIVE_UPDATED_TAIL;
}

/* The connect state is MY PICKS'S, word for word in its own words:
 * the live board lives on the same service and behaves the same way
 * without a token — it says so, and keeps nothing locally instead. */
function liveConnectCard() {
  return '<div class="card"><div class="cardhead">' +
    esc(LIVE_CONNECT_HEAD) + '</div>' +
    '<div class="cardbody">' + esc(LIVE_CONNECT_BODY) + '</div>' +
    '<button class="primary" data-act="connect">' +
    esc(CONNECT_BUTTON) + '</button></div>';
}

function liveBets() {
  return (nav.live && nav.live.bets) || [];
}

function betById(betId) {
  const all = liveBets();
  for (let i = 0; i < all.length; i += 1) {
    if (all[i].bet_id === betId) return all[i];
  }
  return null;
}

function renderBetsLive() {
  const head = '<div class="page">' + betsHead() + liveHead() +
    '<div class="overline">' + esc(LIVE_OVERLINE) + '</div>';
  if (DEMO) {
    return head + '<div class="card"><div class="cardbody">' +
      esc(SERVICE_DEMO) + '</div></div>' +
      stubRows(SAMPLE_LIVE_ROWS, "Sample", "card") + '</div>';
  }
  if (!nav.hasToken) return head + liveConnectCard() + '</div>';
  if (nav.liveOffline) {
    return head + '<div class="card"><div class="cardbody">' +
      esc(LIVE_OFFLINE) + '</div></div>' +
      '<button class="primary" data-act="live-retry">' +
      esc(CONNECT_BUTTON) + '</button></div>';
  }
  if (nav.liveNote) {
    return head + '<div class="card"><div class="cardbody">' +
      esc(nav.liveNote) + '</div></div></div>';
  }
  const bets = liveBets();
  if (!bets.length) {
    return head + '<div class="card"><div class="cardbody">' +
      esc((nav.live && nav.live.reason) || LIVE_EMPTY) +
      '</div></div></div>';
  }
  return head +
    '<div class="livelist">' + bets.map(liveRow).join("") + '</div>' +
    '<div class="legend">' + esc(liveFreshness()) + '</div>' +
    /* sec 8a: the freshness line stays out in the open — it is about
     * the numbers a reader is looking at right now — and the three
     * paragraphs behind it go under the tap, whole. */
    explainer(SHORT_LIVE,
      [CALIBRATION_NOTE, LIVE_POLL_NOTE, LIVE_SERVICE_NOTE]) +
    '</div>';
}

/* ------------------------------------------------------------------
 * THE OWNER'S THIRD BETS SEGMENT — MY PICKS
 * ------------------------------------------------------------------
 * The watchlist and the tracked slips, both of which live on the
 * SERVICE. Without a token there is nothing to show, and this segment
 * says exactly that: it does not keep a local copy, it does not show
 * yesterday's, and it does not pretend a bookmark was saved. */

function connectCard() {
  return '<div class="card"><div class="cardhead">' +
    esc(CONNECT_HEAD) + '</div>' +
    '<div class="cardbody">' + esc(CONNECT_BODY) + '</div>' +
    '<button class="primary" data-act="connect">' +
    esc(CONNECT_BUTTON) + '</button></div>';
}

function watchRows() {
  const rows = nav.watch || [];
  if (!rows.length) {
    return '<div class="card"><div class="cardbody">' +
      esc(PICKS_EMPTY_WATCH) + '</div></div>';
  }
  return '<div class="card"><div class="overline">' +
    esc(PICKS_WATCH) + '</div>' + rows.map(function (row, index) {
      const person = playerOf(row.player_id);
      const prop = person ? propOf(person, row.market) : null;
      return '<div class="watchrow' + growClass() + '" style="--i:' +
        Math.min(index, 8) + '">' +
        '<button class="watchopen" data-act="prop" data-player="' +
        esc(row.player_id) + '" data-market="' + esc(row.market) +
        '" aria-label="' + esc("Open " +
          (person ? person.name : row.player_id) + ", " +
          row.market) + '">' +
        '<span class="watchname">' +
        esc(person ? person.name : row.player_id) + '</span>' +
        '<span class="watchmeta">' + esc(
          (row.side === "less" ? "Less " : "More ") +
          (row.line === null || row.line === undefined
            ? "" : row.line + " ") + row.market) + '</span></button>' +
        '<span class="watchp">' +
        esc(prop ? pct(prop.model_p) : DASH) + '</span>' +
        '<button class="watchdrop" data-act="unwatch" data-player="' +
        esc(row.player_id) + '" data-market="' + esc(row.market) +
        '" aria-label="' + esc(PICK_WATCH_REMOVE) + '">' +
        esc(PICKS_REMOVE) + '</button></div>';
    }).join("") + '</div>';
}

function slipRows() {
  const rows = nav.slips || [];
  if (!rows.length) {
    return '<div class="card"><div class="cardbody">' +
      esc(PICKS_EMPTY_SLIPS) + '</div></div>';
  }
  return rows.map(function (slip, index) {
    const worth = (slip.p_all_hit !== null &&
      slip.p_all_hit !== undefined &&
      slip.p_break_even !== null && slip.p_break_even !== undefined)
      ? (slip.p_all_hit >= slip.p_break_even ? "positive" : "negative")
      : "absent";
    return '<div class="card' + growClass() + '" style="--i:' +
      Math.min(index, 8) + '">' +
      '<div class="overline">' + esc(PICKS_SLIPS) + '</div>' +
      '<div class="verdictrow"><span>' + esc(TRACK_ALL_HIT) +
      '</span><span class="verdictvalue">' + esc(pct(slip.p_all_hit)) +
      '</span></div>' +
      '<div class="verdictrow"><span>' + esc(TRACK_BREAK_EVEN) +
      '</span><span class="verdictvalue">' +
      esc(pct(slip.p_break_even)) + '</span></div>' +
      '<div class="slipleglist">' + (slip.legs || []).map(
        function (leg) {
          const person = playerOf(leg.player_id);
          /* THE SERVICE'S OWN STORED FLAG, not a fresh reading. It
           * says what this surface said about the prop on the day he
           * saved it, which is the leg's `p_at_placed` philosophy
           * applied to the sentence beside it (UI_ALPHA_SPEC sec 5). */
          return '<div class="slipleg"><span class="sliplegtext">' +
            '<span>' +
            esc((person ? person.name : (leg.player_text ||
              TRACK_UNMATCHED_LEG)) + " · " +
              (leg.side === "less" ? "Less " : "More ") +
              leg.line_placed + " " + (leg.market || "")) + '</span>' +
            (leg.blind_spot
              ? '<span class="blindnote">' + esc(BLIND_SPOT_NOTE) +
                '</span>'
              : "") + '</span>' +
            '<span class="legp' + (leg.p_at_placed === null
              ? " absent" : "") + '">' +
            esc(leg.p_at_placed === null || leg.p_at_placed === undefined
              ? DASH : pct(leg.p_at_placed)) + '</span></div>';
        }).join("") + '</div>' +
      '<div class="verdict ' + worth + '">' +
      esc(worth === "absent" ? TRACK_NO_VERDICT
        : (worth === "positive" ? TRACK_BIGGER : TRACK_SMALLER)) +
      '</div>' +
      '<div class="legend">' +
      esc(slip.independence_note || INDEPENDENCE_NOTE) + '</div>' +
      '<div class="legend">' + esc(STORED_BY_SERVICE) + '</div>' +
      (slip.p_reason
        ? '<div class="legend">' + esc(plainNote(slip.p_reason)) +
          '</div>'
        : "") + '</div>';
  }).join("");
}

function renderBetsPicks() {
  const head = '<div class="page">' + betsHead() +
    '<div class="overline">' + esc(PICKS_OVERLINE) + '</div>';
  if (DEMO) {
    return head + '<div class="card"><div class="cardbody">' +
      esc(SERVICE_DEMO) + '</div></div></div>';
  }
  if (!nav.hasToken) {
    return head + connectCard() + '</div>';
  }
  if (nav.picksOffline) {
    return head + '<div class="card"><div class="cardbody">' +
      esc(SERVICE_OFFLINE) + '</div></div>' +
      '<button class="primary" data-act="picks-retry">' +
      esc(CONNECT_BUTTON) + '</button></div>';
  }
  return head + watchRows() + slipRows() + '</div>';
}

function detailHead(title) {
  return '<div class="pagehead">' +
    '<button class="backbtn" data-act="back" aria-label="Back">' +
    icon("back") + '</button>' +
    '<div class="pagetitle">' + esc(title) + '</div></div>';
}

/* ------------------------------------------------------------------
 * sec 5.5 — THE PICK CARD
 * ------------------------------------------------------------------ */

/* The bookmark, sec 5.5's header control. It is a state on the
 * SERVICE, so without a token it says what it would do and connects
 * rather than pretending to save. */
function watchButton(playerId, prop) {
  const saved = !!watchedEntry(playerId, prop.market);
  const busy = nav.picksBusy === playerId + "|" + prop.market;
  return '<button class="watchbtn' + (saved ? " saved" : "") +
    '" data-act="watch" data-player="' + esc(playerId) +
    '" data-market="' + esc(prop.market) + '" data-line="' +
    esc(prop.line) + '" data-side="' + esc(prop.lean) +
    '" aria-pressed="' + saved + '" aria-label="' +
    esc(saved ? PICK_WATCH_REMOVE : PICK_WATCH_ADD) + '">' +
    (busy ? "…" : (saved ? "★" : "☆")) + '</button>';
}

/* THE PLAYER BLOCK USES THE ONE SHARED STATLINE RENDERER — the same
 * `statline()` the home expanded rows call, and the owner's standing
 * requirement (UI_ALPHA_SPEC sec 1). It is handed the record's own
 * `projected_line` with the prop's threshold attached to the row the
 * prop is about, which is what the threshold slot in that component
 * was built for. A second statline is not written here. */
function pickStatline(person, prop) {
  const entries = (person.projected_line || []).map(function (entry) {
    const mine = entry.label.toLowerCase() ===
      String(prop.market_label || "").toLowerCase();
    return mine
      ? { label: entry.label, value: entry.value, reason: entry.reason,
        threshold: prop.line_label }
      : entry;
  });
  return statline(entries);
}

function impliesBanner(prop) {
  const implies = prop.line_implies || {};
  if (!implies.text) return "";
  const basis = plainNote(implies.basis || "");
  return '<div class="implies" title="' + esc(basis) +
    '"><span class="overline">' + esc(PICK_IMPLIES) + '</span>' +
    '<span class="impliestext">' + esc(implies.text) + '</span>' +
    (basis
      ? '<span class="impliesbasis">' + esc(basis) + '</span>'
      : "") + '</div>';
}

function bandCaption(prop) {
  const band = prop.floor_median_ceiling || {};
  if (band.p10 === null || band.p10 === undefined) return "";
  return '<div class="fmc" title="' +
    esc(plainNote(band.basis || "")) + '">' +
    [[PICK_FLOOR, band.p10], [PICK_MEDIAN, band.p50],
      [PICK_CEILING, band.p90]].map(function (cell) {
      return '<span class="fmccell"><span class="fmclabel">' +
        esc(cell[0]) + '</span><span class="fmcvalue">' +
        esc(num(cell[1])) + '</span></span>';
    }).join("") + '</div>';
}

function shapeSection(prop) {
  const counted = !!prop.distribution;
  const body = shapeFor(prop, true);
  const note = counted ? "" : plainNote(prop.distribution_reason || "");
  return '<div class="card"><div class="overline">' +
    esc(counted ? PICK_SHAPE : PICK_BAND) + '</div>' +
    (body || '<div class="cardbody">' + esc(note) + '</div>') +
    bandCaption(prop) +
    (counted
      ? '<div class="legend">' + esc(prop.distribution_method
        ? "Outcome bars from our own simulated outcomes." : "") +
        '</div>'
      : '<div class="legend">' + esc(note) + '</div>') +
    '</div>';
}

function barsSection(prop) {
  const odds = prop.odds || [];
  const book = (prop.book ? prop.book + " " : "") +
    (odds.length === 2
      ? (odds[0] > 0 ? "+" + odds[0] : odds[0]) + " / " +
        (odds[1] > 0 ? "+" + odds[1] : odds[1])
      : "");
  return '<div class="card"><div class="overline">' + esc(PICK_BARS) +
    '</div>' +
    probBar(PICK_MODEL, prop.model_p, prop.model_band, "",
      isEdge(prop) ? "positive" : "") +
    probBar(PICK_MARKET, prop.market_p_novig, null, book, "") +
    /* UI_ALPHA_SPEC sec 5: ABOVE the gap line, so the admission is
     * read before the number it qualifies rather than after it. The
     * gap itself still prints, tinted as it always was — this card
     * says what it thinks of the number, it does not withhold it. */
    (isBlindSpot(prop)
      ? '<div class="blindnote">' + esc(BLIND_SPOT_NOTE) + '</div>'
      : "") +
    '<div class="gapline ' + (isEdge(prop) ? "positive" : "absent") +
    '">' + esc(gapText(prop)) + '</div>' +
    /* sec 8a: ONE short line under the number it explains. The 3-point
     * rule that used to run on after it is the same sentence the
     * card's own "How to read this" carries at the bottom, so saying
     * it twice made a wall out of a footnote. */
    '<div class="legend">' + esc(GAP_FOOTNOTE) + '</div>' +
    /* U6: the button opens the sheet it has always named, on THIS
     * prop — the read carries the player, the market and the line it
     * was written against, which is the context the service already
     * stores on a read. */
    '<button class="readbtn" data-act="read-open" data-player="' +
    esc(nav.pick) + '" data-market="' + esc(prop.market) + '">' +
    esc(ADD_READ_BUTTON) + '</button>' +
    '</div>';
}

/* sec 5.5's 2x2. FOUR TILES, and the fifth the handoff draws is named
 * as deferred underneath rather than filled with a substitute
 * (UI_ALPHA_SPEC sec 2's PFF wall). */
function tilesSection(prop) {
  const tiles = (prop.context_tiles || []).map(function (tile) {
    const absent = tile.value === null || tile.value === undefined;
    const words = plainNote(absent ? (tile.reason || "")
      : (tile.detail || ""));
    return '<div class="tile' + (absent ? " absent" : "") +
      '" title="' + esc(words) + '">' +
      '<span class="tilelabel">' + esc(tile.label) + '</span>' +
      '<span class="tilevalue">' + esc(absent ? DASH : tile.value) +
      '</span>' +
      '<span class="tiledetail">' + esc(words) +
      '</span></div>';
  }).join("");
  return '<div class="card"><div class="overline">' +
    esc(PICK_CONTEXT) + '</div>' +
    '<div class="tiles">' + tiles + '</div>' +
    '<div class="legend">' + esc(DEFER_MATCHUP) + '</div></div>';
}

function otherMarkets(person, prop) {
  const others = (person.props || []).filter(function (entry) {
    return entry.market !== prop.market;
  });
  if (!others.length) return "";
  return '<div class="card"><div class="overline">' +
    esc(PICK_OTHER_MARKETS) + '</div><div class="otherlines">' +
    others.map(function (entry) {
      return '<button class="otherline" data-act="prop" ' +
        'data-player="' + esc(person.player_id) + '" data-market="' +
        esc(entry.market) + '" aria-label="' +
        esc(entry.market_label + " " + entry.line + ", " +
          entry.lean_label + " " + pct(entry.model_p)) + '">' +
        '<span>' + esc(entry.market_label + " " + entry.line) +
        '</span><span class="otherp">' + esc(entry.lean_label + " " +
          pct(entry.model_p)) + '</span></button>';
    }).join("") + '</div></div>';
}

/* U7'S CROSS-TAB LINK. The pick card is a bet; the breakdown behind
 * it is the whole projection, and this is the door between them. It
 * goes through the nav model's own cross-tab move — push onto the
 * Projections stack, switch to that tab — rather than a second
 * router, so the chevron there pops to the Projections list exactly
 * as it would if he had walked in through the tab.
 *
 * The link is drawn WITHOUT ASKING FIRST whether the breakdown file
 * has him. That file is not fetched until the Projections tab is
 * opened, so the pick card cannot know — and fetching it here to find
 * out would be a request made to decide whether to draw a button.
 * Since sec 8b the file covers the WHOLE SLATE, so the answer is
 * almost always yes; when it is not, the screen it leads to says so
 * plainly, which is where somebody who followed the link can actually
 * read it. */
function fullProjection(person) {
  return '<button class="ghost wide" data-act="projection" ' +
    'data-player="' + esc(person.player_id) + '" aria-label="' +
    esc(PROJ_FULL + ": " + person.name) + '">' + esc(PROJ_FULL) +
    '</button>';
}

function renderPick() {
  const person = playerOf(nav.pick);
  const prop = pickProp();
  const head = '<div class="pagehead">' +
    '<button class="backbtn" data-act="back" aria-label="Back">' +
    icon("back") + '</button>' +
    '<div class="pagetitle">' + esc(TITLE_PICK) + '</div>' +
    (person && prop ? watchButton(person.player_id, prop) : "") +
    '</div>';
  if (!person || !prop) {
    return '<div class="page">' + head +
      '<div class="card"><div class="cardbody">' + esc(PICK_NO_PROP) +
      '</div></div></div>';
  }
  const where = gameOfPlayer(person.player_id);
  const against = where
    ? " · vs " + opponentOf(where.game, where.side) : "";
  return '<div class="page">' + head +
    '<div class="card playercard">' +
    '<div class="exphead"><span class="pickname">' +
    esc(person.name) + '</span><span class="expteam">' +
    esc(person.team + " " + person.pos + against) + '</span></div>' +
    '<div class="pickline">' + esc(prop.market_label + " " +
      prop.line) + ' <span class="sidepill ' + esc(prop.lean) + '">' +
    esc(prop.lean_label) + '</span></div>' +
    '<div class="overline" title="' +
    esc(plainNote(person.projected_line_template)) + '">' +
    esc(PROJECTED) +
    '</div>' + pickStatline(person, prop) +
    impliesBanner(prop) + '</div>' +
    shapeSection(prop) + barsSection(prop) + tilesSection(prop) +
    otherMarkets(person, prop) + fullProjection(person) +
    '<button class="primary" data-act="copy" data-player="' +
    esc(person.player_id) + '" data-market="' + esc(prop.market) +
    '">' + esc(PICK_COPY) + '</button>' +
    /* sec 8a: the exporter's provenance paragraph — which book, which
     * price, what it is not — used to close this card as a wall. It
     * closes it as a tap now, with the same sentence inside. */
    explainer(SHORT_PICK, [prop.basis, GAP_FOOTNOTE, CLIENT_GAP_RULE]) +
    '</div>';
}

/* ------------------------------------------------------------------
 * sec 5.7 — TRACK A SLIP
 * ------------------------------------------------------------------ */

/* The words a pick'em slip uses for a side, mapped to the app's two.
 * A book's "over" is this app's "More" and is stored as `more`; the
 * page never shows the book's word back. */
const SIDE_WORDS = { more: "more", over: "more", less: "less",
  under: "less" };

/* THE PARSER. It matches or it does not — it never guesses.
 *
 * A line becomes a leg only when all three of the player, the market
 * and the side are found IN THE SLATE the page already has: the
 * player by his own listed name, the market by the exporter's own
 * word for it, the side by one of the four words above. Anything
 * short of that is kept verbatim as an unmatched line and offered for
 * manual entry, because a leg assembled out of a partial match is a
 * bet the reader did not place. */
function parseSlip(text) {
  const lines = String(text || "").split(/[\r\n]+/)
    .map(function (line) { return line.trim(); })
    .filter(function (line) { return line.length > 0; });
  const legs = [];
  const unparsed = [];
  let pending = "";
  lines.forEach(function (line) {
    const context = (pending ? pending + " " : "") + line;
    const side = line.match(/\b(more|less|over|under)\b/i);
    const number = line.match(/(\d+(?:\.\d+)?)/);
    if (!side || !number) {
      pending = context;
      return;
    }
    const leg = matchLeg(context, SIDE_WORDS[side[1].toLowerCase()],
      Number(number[1]));
    if (leg) {
      legs.push(leg);
    } else {
      unparsed.push(context);
    }
    pending = "";
  });
  if (pending) unparsed.push(pending);
  return { legs: legs, unparsed: unparsed };
}

/* One leg, or null. Nothing here reads a probability out of anything
 * but the published ladder. */
function matchLeg(text, side, line) {
  const hay = String(text).toLowerCase();
  let best = null;
  let bestRank = 0;
  allProps().forEach(function (entry) {
    const name = entry.person.name.toLowerCase();
    const surname = name.split(" ").slice(-1)[0];
    /* A FULL NAME BEATS A SURNAME, always. Two men on one slate can
     * share a surname, and picking whichever of them was iterated
     * last would put somebody else's bet on the reader's slip. A
     * surname that matches more than one player is AMBIGUOUS and
     * therefore no match at all: it falls through to the unmatched
     * list, where he can enter it himself. */
    const rank = hay.indexOf(name) >= 0 ? 2
      : (surname.length >= 3 && hay.indexOf(surname) >= 0 ? 1 : 0);
    if (!rank) return;
    const market = String(entry.prop.market).toLowerCase();
    const label = String(entry.prop.market_label).toLowerCase();
    if (hay.indexOf(market) < 0 && hay.indexOf(label) < 0) return;
    if (rank > bestRank) {
      best = entry;
      bestRank = rank;
    } else if (rank === bestRank && best &&
        best.id !== entry.id) {
      best = null;            // two men answer to it: match nobody
    }
  });
  if (!best) return null;
  const prop = best.prop;
  const placed = rungAt(prop, line);
  const screened = rungAt(prop, prop.line);
  return {
    text: text,
    player_id: best.id,
    name: best.person.name,
    market: prop.market,
    market_label: prop.market_label,
    side: side,
    side_label: side === "less" ? "Less" : "More",
    line_placed: line,
    line_screened: prop.line,
    p_at_screened: rungChance(screened, side),
    p_at_placed: rungChance(placed, side),
    /* UI_ALPHA_SPEC sec 5, and the same philosophy as `p_at_placed`
     * beside it: THE LEG RECORDS WHAT HE SAW. Whether we called this
     * prop a blind-spot candidate is a fact about the moment he saved
     * the slip, so it is decided here, travels with the leg to the
     * service and comes back stored — rather than being re-derived
     * next week off a gap that has since moved. */
    blind_spot: isBlindSpot(prop),
    p_reason: placed ? null : TRACK_OFF_LADDER
  };
}

/* sec 5.7's move note. Both numbers are published rungs, so this
 * compares two readings and works nothing out. */
function moveNote(leg) {
  if (leg.p_at_placed === null || leg.p_at_placed === undefined) {
    return { text: TRACK_OFF_LADDER, tone: "absent" };
  }
  if (leg.line_placed === leg.line_screened) {
    return { text: TRACK_SAME_LINE, tone: "" };
  }
  const better = leg.p_at_placed > leg.p_at_screened;
  return {
    text: (better ? TRACK_MOVED_TO : TRACK_MOVED_AGAINST) + ": " +
      leg.line_screened + " → " + leg.line_placed + " · " +
      pct(leg.p_at_screened) + " → " + pct(leg.p_at_placed),
    tone: better ? "positive" : "negative"
  };
}

/* THE LEG THAT MOVED MOST, by the size of the change in its published
 * chance. It is a comparison of stored numbers, not a decomposition. */
function biggestMover(legs) {
  let held = null;
  legs.forEach(function (leg) {
    if (leg.p_at_placed === null || leg.p_at_placed === undefined ||
        leg.p_at_screened === null) {
      return;
    }
    const moved = Math.abs(leg.p_at_placed - leg.p_at_screened);
    if (!held || moved > held.moved) held = { leg: leg, moved: moved };
  });
  return held && held.moved > 0 ? held.leg : null;
}

/* THE PREVIEW PRODUCT — one of the three things this page is allowed
 * to work out, and it says so on screen every time it is drawn
 * (UI_ALPHA_SPEC sec 4). The SAVED slip's number is the service's. */
function previewProduct(legs) {
  if (!legs.length) return null;
  let product = 1;
  for (let index = 0; index < legs.length; index += 1) {
    const value = legs[index].p_at_placed;
    if (value === null || value === undefined) return null;
    product *= value;
  }
  return product;
}

/* ...and the break-even quotient, the second of the three. */
function breakEven(payout) {
  const value = numberOrNull(payout);
  if (value === null || value <= 0) return null;
  return 1 / value;
}

function trackInputs() {
  return '<div class="seg" role="group" aria-label="' +
    esc(TRACK_INPUT_LABEL) + '">' +
    ['<button data-act="track-input" data-input="paste" ' +
      'aria-pressed="' + (nav.track.input === "paste") + '">' +
      esc(TRACK_PASTE) + '</button>',
    '<button data-act="track-input" data-input="manual" ' +
      'aria-pressed="' + (nav.track.input === "manual") + '">' +
      esc(TRACK_MANUAL) + '</button>',
    '<button data-act="track-input" data-input="shot" ' +
      'aria-pressed="' + (nav.track.input === "shot") + '">' +
      esc(SHOT_LABEL) + '</button>'].join("") + '</div>';
}

/* sec 6a's picker, shared by both doors. The file input is the one
 * control in this app that is neither a button nor a text field, so
 * it is LABELLED as a button and wired by the one change listener —
 * the pattern the search box already set for the input listener. */
function shotPicker(which, action, label) {
  const shot = nav.shot[which];
  const busy = nav.capture.busy === which;
  const id = which === "team" ? "teamshot" : "slipshot";
  return '<div class="card"><div class="overline">' +
    esc(SHOT_LABEL) + '</div>' +
    '<div class="cardbody">' + esc(SHOT_PROMISE) + '</div>' +
    '<label class="shotpick" for="' + esc(id) + '">' +
    esc(shot ? SHOT_PICK_AGAIN : SHOT_PICK) + '</label>' +
    '<input class="shotfile" id="' + esc(id) + '" type="file" ' +
    'accept="image/*" capture="environment" aria-label="' +
    esc(shot ? SHOT_PICK_AGAIN : SHOT_PICK) + '">' +
    (shot
      ? '<img class="shotpreview" src="' + esc(shot.url) +
        '" alt="' + esc(SHOT_PREVIEW) + '">'
      : '<div class="cardbody muted">' + esc(SHOT_EMPTY) + '</div>') +
    '<button class="primary" data-act="' + esc(action) + '"' +
    (shot && !busy ? "" : " disabled") + '>' +
    esc(busy ? SHOT_BUSY : label) + '</button>' +
    (nav.capture.note
      ? '<div class="legend warn">' + esc(nav.capture.note) + '</div>'
      : "") +
    '<div class="legend">' + esc(SHOT_LOCAL_NOTE) + '</div></div>';
}

function trackEntry() {
  if (nav.track.input === "shot") {
    return shotPicker("slip", "shot-slip", SHOT_READ_SLIP);
  }
  if (nav.track.input === "manual") {
    return '<div class="card"><div class="overline">' +
      esc(TRACK_MANUAL) + '</div>' +
      '<input class="trackline" id="manualleg" type="text" ' +
      'autocomplete="off" aria-label="' + esc(TRACK_ADD_LEG) +
      '" placeholder="' + esc(TRACK_MANUAL_HINT) + '" value="' +
      esc(nav.track.text) + '">' +
      '<button class="primary" data-act="track-manual">' +
      esc(TRACK_ADD_LEG) + '</button></div>';
  }
  return '<div class="card"><div class="overline">' +
    esc(TRACK_PASTE) + '</div>' +
    '<textarea class="trackbox" id="slippaste" rows="5" ' +
    'aria-label="' + esc(TRACK_PLACEHOLDER) + '" placeholder="' +
    esc(TRACK_PLACEHOLDER) + '">' + esc(nav.track.text) +
    '</textarea>' +
    '<button class="primary" data-act="track-parse">' +
    esc(TRACK_PARSE) + '</button></div>';
}

function trackLegs() {
  if (!nav.track.legs.length) {
    return '<div class="card"><div class="cardbody">' +
      esc(TRACK_EMPTY) + '</div></div>';
  }
  return '<div class="card"><div class="overline">' + esc(TRACK_LEGS) +
    '</div>' + nav.track.legs.map(function (leg, index) {
      const note = moveNote(leg);
      return '<div class="leg' + growClass() + '" style="--i:' +
        index + '">' +
        '<div class="legtop"><span class="legname">' +
        esc(leg.name || leg.text) + '</span>' +
        '<span class="legp' + (leg.p_at_placed === null
          ? " absent" : "") + '">' +
        esc(leg.p_at_placed === null || leg.p_at_placed === undefined
          ? DASH : pct(leg.p_at_placed)) + '</span></div>' +
        '<div class="legbet">' + esc(leg.side_label + " " +
          leg.line_placed + " " + leg.market) + '</div>' +
        '<div class="legnote ' + esc(note.tone) + '">' +
        esc(note.text) + '</div>' +
        (leg.blind_spot
          ? '<div class="blindnote">' + esc(BLIND_SPOT_NOTE) + '</div>'
          : "") +
        '<button class="legdrop" data-act="track-drop" data-leg="' +
        index + '" aria-label="' + esc("Remove " +
          (leg.name || leg.text)) + '">' + esc(PICKS_REMOVE) +
        '</button></div>';
    }).join("") + '</div>' +
    (nav.track.unparsed.length
      ? '<div class="card"><div class="overline">' +
        esc(TRACK_UNPARSED) + '</div>' +
        nav.track.unparsed.map(function (line) {
          return '<div class="unparsed">' + esc(line) + '</div>';
        }).join("") +
        '<div class="legend">' + esc(TRACK_UNPARSED_NOTE) +
        '</div></div>'
      : "");
}

function trackVerdict() {
  const saved = nav.track.saved;
  const legs = nav.track.legs;
  const product = saved ? saved.p_all_hit : previewProduct(legs);
  const even = saved ? saved.p_break_even : breakEven(nav.track.payout);
  const mover = biggestMover(legs);
  const tone = (product !== null && product !== undefined &&
    even !== null && even !== undefined)
    ? (product >= even ? "positive" : "negative") : "absent";
  const verdict = tone === "absent" ? TRACK_NO_VERDICT
    : (tone === "positive" ? TRACK_BIGGER : TRACK_SMALLER);
  return '<div class="card"><div class="overline">' +
    esc(TRACK_VERDICT) + '</div>' +
    '<div class="payouts">' +
    '<label class="payoutcell"><span>' + esc(TRACK_PAYOUT) +
    '</span><input class="payoutinput" id="slippayout" type="text" ' +
    'inputmode="decimal" autocomplete="off" aria-label="' +
    esc(TRACK_PAYOUT) + '" value="' + esc(nav.track.payout) +
    '"></label>' +
    '<label class="payoutcell"><span>' + esc(TRACK_STAKE) +
    '</span><input class="payoutinput" id="slipstake" type="text" ' +
    'inputmode="decimal" autocomplete="off" aria-label="' +
    esc(TRACK_STAKE) + '" value="' + esc(nav.track.stake) +
    '"></label></div>' +
    '<div class="verdictrow"><span>' + esc(TRACK_ALL_HIT) +
    '</span><span class="verdictvalue" id="vall">' + esc(pct(product)) +
    '</span></div>' +
    '<div class="verdictrow"><span>' + esc(TRACK_BREAK_EVEN) +
    '</span><span class="verdictvalue" id="veven">' + esc(pct(even)) +
    '</span></div>' +
    '<div class="verdict ' + esc(tone) + '" id="vsay">' + esc(verdict) +
    (mover ? " " + esc(TRACK_WORST + mover.name) : "") + '</div>' +
    '<div class="legend">' +
    esc(saved ? saved.independence_note || INDEPENDENCE_NOTE
      : INDEPENDENCE_NOTE) + '</div>' +
    '<div class="legend">' +
    esc(saved ? STORED_BY_SERVICE : CLIENT_PREVIEW_NOTE) + '</div>' +
    '<div class="legend">' + esc(CLIENT_BREAK_EVEN_NOTE) + '</div>' +
    (saved && saved.p_reason
      ? '<div class="legend">' + esc(saved.p_reason) + '</div>'
      : "") +
    (saved ? ""
      : '<button class="primary" data-act="track-save"' +
        (nav.track.legs.length ? "" : " disabled") + '>' +
        esc(nav.picksBusy === "slip" ? "…" : TRACK_SAVE) +
        '</button>') +
    (nav.picksOffline
      ? '<div class="legend">' + esc(SERVICE_OFFLINE) + '</div>'
      : "") + '</div>';
}

/* The verdict's three numbers, redrawn in place as a payout is typed.
 * The break-even is this page's own quotient and the product is its
 * own preview — both labelled underneath — and neither the legs nor
 * the fields around them are re-rendered, so the caret stays put. */
function redrawVerdict() {
  const all = el("vall");
  const even = el("veven");
  const say = el("vsay");
  if (!all || !even || !say) return;
  const legs = nav.track.legs;
  const product = nav.track.saved
    ? nav.track.saved.p_all_hit : previewProduct(legs);
  const breaks = nav.track.saved
    ? nav.track.saved.p_break_even : breakEven(nav.track.payout);
  all.textContent = pct(product);
  even.textContent = pct(breaks);
  const known = product !== null && product !== undefined &&
    breaks !== null && breaks !== undefined;
  const tone = known ? (product >= breaks ? "positive" : "negative")
    : "absent";
  const mover = biggestMover(legs);
  say.className = "verdict " + tone;
  say.textContent = (known
    ? (tone === "positive" ? TRACK_BIGGER : TRACK_SMALLER)
    : TRACK_NO_VERDICT) + (mover ? " " + TRACK_WORST + mover.name : "");
}

function renderTrack() {
  return '<div class="page">' + detailHead(TITLE_TRACK) +
    trackInputs() + trackEntry() + trackLegs() + trackVerdict() +
    '</div>';
}

/* ------------------------------------------------------------------
 * sec 5.9 — THE LIVE CARD (without the read panel: R1's effect
 * library owns it, and "advance to next play" is not shipped, per the
 * handoff's own note on its prototype)
 * ------------------------------------------------------------------ */

/* THE LIVE CHANCE CHART — sec 4. Quarter gridlines, the ink line over
 * the accumulated series, the band behind it in the state's tint, the
 * dashed pregame reference and the future shaded. Every coordinate is
 * a stored `t` and a stored chance over the box; no value drawn here
 * is ever printed as a number. */
function liveChart(bet) {
  const series = seriesFor(bet);
  if (!series.length) return "";
  const axis = numberOrNull((bet.game || {}).axis_max_s) ||
    LIVE_FULL_GAME_S;
  const left = LIVE_CHART_PAD;
  const top = LIVE_CHART_PAD;
  const width = LIVE_CHART_W - LIVE_CHART_PAD * 2;
  const height = LIVE_CHART_H - LIVE_CHART_PAD * 2;
  const x = function (t) {
    return left + Math.max(0, Math.min(1, t / axis)) * width;
  };
  const y = function (p) {
    return top + (1 - Math.max(0, Math.min(1, p))) * height;
  };
  const line = series.map(function (point, index) {
    return (index ? "L" : "M") + x(point.t).toFixed(1) + " " +
      y(point.p).toFixed(1);
  }).join(" ");
  const up = series.map(function (point) {
    return x(point.t).toFixed(1) + "," + y(point.hi).toFixed(1);
  });
  const down = series.slice().reverse().map(function (point) {
    return x(point.t).toFixed(1) + "," + y(point.lo).toFixed(1);
  });
  const quarters = [];
  for (let q = LIVE_QUARTER_S; q < axis; q += LIVE_QUARTER_S) {
    quarters.push('<line class="chartgrid" x1="' + x(q).toFixed(1) +
      '" y1="' + top + '" x2="' + x(q).toFixed(1) + '" y2="' +
      (top + height) + '"></line>');
  }
  const last = series[series.length - 1];
  const pregame = series[0];
  const future = left + width - x(last.t);
  const title = (bet.state === "cashed" || bet.state === "lost")
    ? LIVE_CHART_DONE : LIVE_CHART_LIVE;
  return '<div class="card">' +
    '<div class="overline">' + esc(title) + '</div>' +
    '<svg class="livechart" viewBox="0 0 ' + LIVE_CHART_W + ' ' +
    LIVE_CHART_H + '" role="img" aria-label="' + esc(
      title + " for " + bet.player.name + ", now " + pct(liveChance(bet)) +
      ", " + bandText(liveBand(bet))) + '">' +
    (future > 0
      ? '<rect class="chartfuture" x="' + x(last.t).toFixed(1) +
        '" y="' + top + '" width="' + future.toFixed(1) +
        '" height="' + height + '"></rect>'
      : "") +
    quarters.join("") +
    (series.length > 1
      ? '<polygon class="chartband ' + stateTone(bet) + '" points="' +
        up.concat(down).join(" ") + '"></polygon>'
      : "") +
    '<line class="chartpregame" x1="' + left + '" y1="' +
    y(pregame.p).toFixed(1) + '" x2="' + (left + width) + '" y2="' +
    y(pregame.p).toFixed(1) + '"></line>' +
    '<path class="chartline" d="' + line + '"></path>' +
    '<circle class="chartnow ' + stateTone(bet) + '" cx="' +
    x(last.t).toFixed(1) + '" cy="' + y(last.p).toFixed(1) +
    '" r="4.5"></circle></svg>' +
    '<div class="legend">' + esc(LIVE_DASHED_NOTE) + '</div></div>';
}

/* THE SELECTED-SWING PANEL. The swings are the answer's own `events`
 * with their own `why` lines; when the answer carries none it carries
 * the SENTENCE saying why, and that is what is drawn. Nothing on this
 * screen invents a swing. */
function liveSwings(bet) {
  const events = bet.events || [];
  if (!events.length) {
    return '<div class="card">' +
      '<div class="overline">' + esc(LIVE_SWINGS) + '</div>' +
      '<div class="cardbody">' +
      esc(bet.events_reason || "") + '</div></div>';
  }
  const index = nav.liveSwing === null
    ? events.length - 1
    : Math.max(0, Math.min(nav.liveSwing, events.length - 1));
  const event = events[index];
  return '<div class="card">' +
    '<div class="overline">' + esc(LIVE_SWINGS) + '</div>' +
    '<div class="swingdots">' + events.map(function (row, at) {
      return '<button class="swingdot' + (at === index ? " on" : "") +
        '" data-act="swing" data-index="' + at + '" aria-label="' +
        esc(row.clock + " " + row.title) + '"></button>';
    }).join("") + '</div>' +
    '<div class="swinghead">' + esc(event.clock || "") + '</div>' +
    '<div class="cardhead">' + esc(event.title || "") + '</div>' +
    '<div class="swingdelta ' + (event.delta_pts >= 0 ? "positive"
      : "negative") + '">' + esc(signed(event.delta_pts) + " pts") +
    '</div>' +
    '<ul class="swingwhy">' + (event.why || []).map(function (why) {
      return '<li>' + esc(why) + '</li>';
    }).join("") + '</ul></div>';
}

function liveSummary(bet) {
  const chance = liveChance(bet);
  const band = liveBand(bet);
  const move = numberOrNull(bet.delta_pregame_pts);
  return '<div class="card livesummary">' +
    '<div class="liveline">' +
    '<div class="cardhead">' + esc(bet.player.name) + '</div>' +
    '<span class="chip ' + stateTone(bet) + '">' +
    esc(stateWord(bet)) + '</span></div>' +
    '<div class="pagemeta">' + esc(
      bet.label + " " + (bet.line_label || "") +
      (gameClock(bet) ? " · " + gameClock(bet) : "")) + '</div>' +
    '<div class="livebig">' + esc(needLine(bet)) + '</div>' +
    '<div class="livepct ' + stateTone(bet) + '">' +
    esc(pct(chance)) + '</div>' +
    '<div class="pagemeta">' + esc(bandText(band)) + '</div>' +
    (numberOrNull(bet.p_now) === null
      ? '<div class="pagemeta">' + esc(LIVE_PREGAME_CHANCE) + '</div>'
      : "") +
    (move === null
      ? ""
      : '<div class="livemove ' + (move >= 0 ? "positive" : "negative") +
        '">' + esc(signed(move) + " pts" + LIVE_SINCE_KICKOFF) +
        '</div>') +
    '<div class="legend">' + esc(bet.calibration_note || "") +
    '</div>' +
    (bet.reason
      ? '<div class="legend">' + esc(plainNote(bet.reason)) + '</div>'
      : "") +
    '<div class="overline">' + esc(LIVE_SUMMARY_HEAD) + '</div>' +
    statline(bet.statline || []) + '</div>';
}

function renderLiveCard() {
  const head = '<div class="page">' + detailHead(TITLE_LIVE_CARD);
  if (DEMO) {
    return head + stubCard("Sample", "One bet, watched.",
      SERVICE_DEMO) + '</div>';
  }
  if (!nav.hasToken) return head + liveConnectCard() + '</div>';
  const bet = betById(nav.liveBet);
  if (!bet) {
    return head + '<div class="card"><div class="cardbody">' +
      esc(nav.liveOffline ? LIVE_OFFLINE : LIVE_EMPTY) +
      '</div></div></div>';
  }
  return head + liveSummary(bet) + liveChart(bet) + liveSwings(bet) +
    '<div class="legend">' + esc(liveFreshness()) + '</div>' +
    '<div class="legend">' + esc(LIVE_SERVICE_NOTE) + '</div></div>';
}

function renderReport() {
  return '<div class="page">' + detailHead(TITLE_REPORT) +
    /* The overline named the increment that would fill this screen,
     * and that increment has now landed without filling it: the
     * graded report is the resolution jobs' and is still to come. A
     * marker that names our plan at a reader who cannot look it up is
     * exactly what sec 7 retires, so what is left is the admission
     * itself. */
    stubCard("Not built yet", "How each part of your read held up.",
      STUB_REPORT) + '</div>';
}

const SCREENS = {
  home: renderHome,
  season: renderFantasySeason,
  dfs: renderFantasyDfs,
  projections: renderProjections,
  projection: renderProjection,
  screen: renderBetsScreen,
  live: renderBetsLive,
  picks: renderBetsPicks,
  pick: renderPick,
  track: renderTrack,
  team: renderTeam,
  card: renderLiveCard,
  report: renderReport
};

/* ------------------------------------------------------------------
 * the chrome
 * ------------------------------------------------------------------ */

function renderTabBar() {
  const bar = el("tabbar");
  if (!bar) return;
  bar.innerHTML = TAB_SLOTS.map(function (slot) {
    if (!slot.tab) {
      return '<div class="tabadd"><button class="addbtn" ' +
        'data-act="sheet-open" aria-label="' + esc(ADD_TITLE) + '">' +
        icon("plus", 26, 2.5) + '</button></div>';
    }
    const active = nav.tab === slot.tab;
    return '<button class="tab" data-act="tab" data-tab="' + esc(slot.tab) +
      '" aria-label="' + esc(slot.label) + '"' +
      (active ? ' aria-current="page"' : "") + '>' + icon(slot.icon) +
      '<span class="tablabel">' + esc(slot.label) + '</span></button>';
  }).join("");
}

function renderToast() {
  const node = el("toast");
  if (!node) return;
  if (!nav.toast) {
    node.hidden = true;
    node.innerHTML = "";
    return;
  }
  const action = nav.toast.label
    ? '<button class="toastact" data-act="toast-go" data-route="' +
      esc(nav.toast.route) + '">' + esc(nav.toast.label) + '</button>'
    : "";
  node.innerHTML = '<span class="toasttext">' + esc(nav.toast.text) +
    '</span>' + action +
    '<button class="toastclose" data-act="toast-close" ' +
    'aria-label="Dismiss">' + icon("close", 16, 2.5) + '</button>';
  node.hidden = false;
  restart(node, "motion-toast");
}

/* sec 2.4 — the sheet, over a 45% ink scrim; tapping the scrim closes
 * it, and so does Escape. TWO BODIES, ONE COMPONENT (U6): the + menu
 * and the read sheet are the same panel with the same rules, and
 * which one is drawn is the only difference between them. */
function renderSheet() {
  const node = el("overlay");
  if (!node) return;
  if (!nav.sheet) {
    node.hidden = true;
    node.innerHTML = "";
    return;
  }
  const body = nav.sheet === "read" ? readSheet() : addSheet();
  node.innerHTML = '<button class="scrim" data-act="sheet-close" ' +
    'aria-label="Close"></button>' + body;
  node.hidden = false;
}

/* THE READ SHEET — sec 5.6, two steps, and the third is not drawn.
 *
 * WITHOUT A TOKEN THERE IS NOWHERE FOR A READ TO GO, so the sheet
 * says so and offers to take one, which is the same honest connect
 * state My picks draws. Nothing is kept in the browser as a
 * stand-in. */
function readSheet() {
  const body = (!DEMO && !readToken())
    ? '<div class="cardhead">' + esc(CONNECT_HEAD) + '</div>' +
      '<div class="cardbody">' + esc(READ_CONNECT_BODY) + '</div>' +
      '<button class="primary" data-act="connect">' +
      esc(CONNECT_BUTTON) + '</button>'
    : (nav.read.step === 2 ? readConfirmStep() : readSayStep());
  return '<div class="sheet readsheet" role="dialog" aria-modal="true" ' +
    'aria-label="' + esc(READ_TITLE) + '"><div class="handle"></div>' +
    '<div class="sheettitle">' + esc(READ_TITLE) + '</div>' +
    readSteps() + body + '</div>';
}

/* THE STEP STRIP NAMES THE STEPS THIS SHEET HAS. The handoff's third —
 * Your number — arrives with the effect library, and a greyed third
 * marker here would be exactly the promise sec 6d says not to make. */
function readSteps() {
  return '<div class="readsteps">' +
    [[1, READ_STEP_SAY], [2, READ_STEP_CONFIRM]].map(function (step) {
      return '<span class="readstep' +
        (nav.read.step === step[0] ? " on" : "") + '"' +
        (nav.read.step === step[0] ? ' aria-current="step"' : "") +
        '>' + esc(step[1]) + '</span>';
    }).join("") + '</div>';
}

function readNote() {
  return nav.read.note
    ? '<div class="legend">' + esc(nav.read.note) + '</div>' : "";
}

function readSayStep() {
  return '<div class="cardbody">' + esc(READ_HINT) + '</div>' +
    '<textarea class="trackbox" id="readtext" rows="3" ' +
    'aria-label="' + esc(READ_TITLE) + '" placeholder="' +
    esc(READ_PLACEHOLDER) + '">' + esc(nav.read.text) + '</textarea>' +
    '<button class="primary" data-act="read-go"' +
    (nav.read.busy ? " disabled" : "") + '>' +
    esc(nav.read.busy ? READ_BUSY : READ_GO) + '</button>' +
    readNote();
}

/* STEP 2 — the chips, and they are HIS OWN WORDS (brief Addendum 2 as
 * sec 1 reconciles it). No node path, no category name, no
 * confidence: the service sends none of those and this step draws
 * what the service sent. */
function readConfirmStep() {
  const chips = (nav.read.spans || []).map(function (span, index) {
    const gone = !!nav.read.dropped[index];
    return '<span class="readchip' + (gone ? " dropped" : "") + '">' +
      '<span class="readspan">' + esc(span) + '</span>' +
      (gone ? '<span class="readgone">' + esc(READ_DROPPED) +
        '</span>' : "") +
      '<button class="readchipbtn" data-act="' +
      (gone ? "read-add" : "read-drop") + '" data-span="' + index +
      '" aria-label="' + esc((gone ? READ_ADD : READ_DROP) + " " +
        span) + '">' + esc(gone ? READ_ADD : READ_DROP) +
      '</button></span>';
  }).join("");
  const changed = readHasDrops();
  return '<div class="cardhead">' + esc(READ_UNDERSTOOD) + '</div>' +
    (chips
      ? '<div class="cardbody">' + esc(READ_CHIPS_NOTE) + '</div>' +
        '<div class="readchips">' + chips + '</div>'
      : "") + readNote() +
    /* NOTHING IS SENT UNSEEN. Taking a fragment out of the middle of
     * a sentence leaves a seam — a stray "and", a comma — and this
     * page does not tidy it, because tidying it would mean rewriting
     * words he wrote. So it SHOWS him the read that would go, and
     * Edit is right there beside it. */
    (changed
      ? '<div class="readwould"><span class="overline">' +
        esc(READ_WOULD_READ) + '</span><span class="readwouldtext">' +
        esc(readTextWithoutDrops()) + '</span></div>'
      : "") +
    '<div class="readactions">' +
    '<button class="ghost" data-act="read-edit">' + esc(READ_EDIT) +
    '</button>' +
    (changed
      ? '<button class="primary" data-act="read-go"' +
        (nav.read.busy ? " disabled" : "") + '>' +
        esc(nav.read.busy ? READ_BUSY : READ_AGAIN) + '</button>'
      : '<button class="primary" data-act="read-confirm">' +
        esc(READ_LOOKS_RIGHT) + '</button>') +
    '</div>' +
    (changed
      ? '<div class="legend">' + esc(READ_CHANGED_NOTE) + ' ' +
        esc(READ_BANKED_NOTE) + '</div>'
      : "");
}

function addSheet() {
  const actions = [
    { title: ADD_READ, sub: ADD_READ_SUB, colour: "var(--read)",
      act: "sheet-read" },
    { title: ADD_SLIP, sub: ADD_SLIP_SUB, colour: "var(--positive)",
      act: "sheet-track" },
    { title: ADD_STARTSIT, sub: ADD_STARTSIT_SUB, colour: "var(--heating)",
      act: "sheet-startsit" }
  ].map(function (action) {
    return '<button class="action" data-act="' + esc(action.act) + '">' +
      '<span class="dot" style="background:' + action.colour + '"></span>' +
      '<span class="actioncol"><span class="actiontitle">' +
      esc(action.title) + '</span><span class="actionsub">' +
      esc(action.sub) + '</span></span></button>';
  }).join("");
  return '<div class="sheet" role="dialog" aria-modal="true" ' +
    'aria-label="' + esc(ADD_TITLE) + '"><div class="handle"></div>' +
    '<div class="sheettitle">' + esc(ADD_TITLE) + '</div>' + actions +
    '</div>';
}

function renderAlpha() {
  const node = el("alpha");
  if (node) node.textContent = ALPHA_NOTE;
}

const MOTION_CLASS = {
  push: "motion-push",
  pop: "motion-pop",
  tab: "motion-tab"
};

/* sec 2.5's Grow, and the same rule as the screen's own motion: a
 * list STAGGERS IN when its items arrive, not when the app opens. On
 * the first paint the rows are simply there. */
function growClass() {
  return nav.booted ? " grow" : "";
}

function render() {
  const route = currentRoute();
  const screen = el("screen");
  if (!screen) return;
  screen.className = "screen";
  screen.innerHTML = SCREENS[route]();
  /* THE BOOT GUARD IS `booted`, NOT the motion value. A deep link —
   * an address that names a route the shell is not already standing
   * on — reconciles the stack BEFORE the first render and sets a
   * motion while doing it, so keying off the motion alone left
   * `…#/bets/my-picks` fading up from the ground exactly as the home
   * screen did. Nothing animates until the reader has asked for
   * something. */
  const motion = nav.booted && nav.motion ? MOTION_CLASS[nav.motion] : null;
  if (motion) restart(screen, motion);
  renderTabBar();
  renderAlpha();
  renderToast();
  renderSheet();
  renderSearch();
  /* U4: the poll follows the screen. Every render reconciles it, so
   * leaving the Live segment stops the asking without any screen
   * having to remember to. */
  syncLivePoll();
  /* U5: the DFS document follows the screen too, and it is asked for
   * ONCE, the first time that sub-view is drawn. */
  syncDfs();
  /* U7: and the breakdown document, on the same rule. */
  syncProjections();
}

/* The game switcher's own re-draw: the table slides 14px in the
 * direction of travel and nothing else on the screen moves, so this
 * does not go through `render()`'s screen transition. Sec 2.5 asks
 * that the animation RESTART on every change, which `restart` does.
 *
 * CHANGING GAME COLLAPSES THE OPEN ROW (sec 5.1). A row is a pair of
 * players in one game; carrying it across would leave the panel open
 * on two different men. */
function redrawCard(step) {
  const card = el("matchcard");
  if (!card) return;
  const game = currentGame();
  if (nav.slate && game) {
    card.innerHTML = switcher(game, games(), nav.game, "game",
      "search-open") + matchBody(game);
    /* ONLY A GAME CHANGE SWAPS. A view change and a row toggle redraw
     * the same game's table, and sliding it sideways would say a
     * different game had arrived. */
    if (step) {
      restart(el("matchtable"),
        step > 0 ? "motion-swap-next" : "motion-swap-prev");
    }
    return;
  }
  render();
}

function stepGame(step) {
  const count = nav.slate ? games().length : SAMPLE_GAMES.length;
  if (!count) return;
  nav.game = (nav.game + step + count) % count;
  nav.exp = null;
  redrawCard(step);
}

function pickGame(index) {
  const count = games().length;
  if (!count) return;
  const step = index >= nav.game ? 1 : -1;
  nav.game = Math.max(0, Math.min(index, count - 1));
  nav.exp = null;
  nav.search = false;
  nav.query = "";
  renderSearch();
  redrawCard(step);
}

/* The SAME step, on the projections file's own list (sec 8b). The
 * roster and the search are scoped to the game on screen, so changing
 * the game clears what was typed: a query that survived the move
 * would be filtering a roster the reader never chose. */
function stepProjGame(step) {
  const count = projGames().length;
  if (!count) return;
  nav.projGame = (nav.projGame + step + count) % count;
  nav.proj.query = "";
  render();
}

/* Sec 5.1: ONE row open at a time. Tapping the open one closes it. */
function toggleRow(index) {
  nav.exp = nav.exp === index ? null : index;
  redrawCard(0);
}

function setView(view) {
  if (!HEADS[view] || nav.view === view) return;
  nav.view = view;
  redrawCard(0);
}

/* ------------------------------------------------------------------
 * one click handler for the whole shell
 * ------------------------------------------------------------------
 * Every control is a real <button> carrying `data-act`, so there is
 * no inline handler anywhere and a control added to a screen is wired
 * by existing. */

function onClick(event) {
  const target = event.target.closest ? event.target.closest("[data-act]") : null;
  if (!target) return;
  const act = target.getAttribute("data-act");

  if (act === "tab") {
    selectTab(target.getAttribute("data-tab"));
  } else if (act === "open") {
    openDetail(target.getAttribute("data-route"));
  } else if (act === "back") {
    goBack();
  } else if (act === "sub") {
    swapSub(target.getAttribute("data-tab"), target.getAttribute("data-sub"));
  } else if (act === "game") {
    stepGame(Number(target.getAttribute("data-step")) || 1);
  } else if (act === "proj-game") {
    stepProjGame(Number(target.getAttribute("data-step")) || 1);
  } else if (act === "view") {
    setView(target.getAttribute("data-view"));
  } else if (act === "row") {
    toggleRow(Number(target.getAttribute("data-row")));
  } else if (act === "player") {
    /* Sec 2.1: a player cell opens that player's pick. U3 fills the
     * card; the id travels on the address so the day it does, this
     * handler does not change. */
    openPick(target.getAttribute("data-player"));
  } else if (act === "search-open") {
    openSearch();
  } else if (act === "search-close") {
    closeSearch();
  } else if (act === "pick-game") {
    pickGame(Number(target.getAttribute("data-game")) || 0);
  } else if (act === "note") {
    showToast(target.getAttribute("data-note"));
  } else if (act === "sheet-open") {
    openSheet();
  } else if (act === "sheet-close") {
    closeSheet();
  } else if (act === "sheet-read") {
    /* sec 2.4: Add your read opens the read sheet on a player's pick.
     * The + menu can be tapped from anywhere, and a read with no
     * player and no line could never be graded — so where a pick has
     * been opened this visit the sheet opens on it, and where none
     * has, the menu says what a read needs and offers the way there.
     * That is a fact about reads, not a stub. */
    if (nav.pick) {
      readOpen(nav.pick, nav.pickMarket);
    } else {
      closeSheet();
      showToast(READ_NEEDS_PICK, ACTION_OPEN_PICK, "pick");
    }
  } else if (act === "read-open") {
    readOpen(target.getAttribute("data-player"),
      target.getAttribute("data-market"));
  } else if (act === "read-go") {
    postRead();
  } else if (act === "read-drop") {
    nav.read.dropped[Number(target.getAttribute("data-span"))] = true;
    renderSheet();
  } else if (act === "read-add") {
    delete nav.read.dropped[Number(target.getAttribute("data-span"))];
    renderSheet();
  } else if (act === "read-edit") {
    /* Back to his own words, with whatever he dropped already taken
     * out of them, so Edit and Drop are the same correction from two
     * directions rather than two rules. */
    nav.read.text = readTextWithoutDrops();
    nav.read.step = 1;
    nav.read.dropped = {};
    nav.read.note = "";
    renderSheet();
  } else if (act === "read-confirm") {
    confirmRead();
  } else if (act === "projection") {
    openProjection(target.getAttribute("data-player"));
  } else if (act === "sheet-track") {
    openDetail("track");
  } else if (act === "sheet-startsit") {
    /* sec 2.4 sends this to Fantasy. Since the owner's amendment
     * split Fantasy in two, it goes to the sub-view that will hold
     * the start/sit call — Season long — which is an explicit
     * navigation and so sets the memory, exactly as tapping the
     * toggle would. */
    closeSheet();
    swapSub("fantasy", "season");
    showToast(STUB_STARTSIT);
  } else if (act === "prop") {
    /* sec 5.4: a Screen row opens THAT prop's pick card, not just
     * that player's — a man with two captured markets has two rows
     * and they are different bets. */
    openPick(target.getAttribute("data-player"),
      target.getAttribute("data-market"));
  } else if (act === "sort") {
    setSort(target.getAttribute("data-sort"));
  } else if (act === "watch") {
    toggleWatch(target.getAttribute("data-player"),
      target.getAttribute("data-market"),
      numberOrNull(target.getAttribute("data-line")),
      target.getAttribute("data-side"));
  } else if (act === "unwatch") {
    toggleWatch(target.getAttribute("data-player"),
      target.getAttribute("data-market"), null, null);
  } else if (act === "copy") {
    copyPick(target.getAttribute("data-player"),
      target.getAttribute("data-market"));
  } else if (act === "track-input") {
    nav.track.input = target.getAttribute("data-input");
    render();
  } else if (act === "track-parse") {
    parseIntoTrack(nav.track.text);
  } else if (act === "track-manual") {
    addManualLeg(nav.track.text);
  } else if (act === "track-drop") {
    nav.track.legs.splice(Number(target.getAttribute("data-leg")), 1);
    nav.track.saved = null;
    render();
  } else if (act === "track-save") {
    saveSlip();
  } else if (act === "shot-slip") {
    readPicture("slip");
  } else if (act === "shot-team") {
    readPicture("team");
  } else if (act === "team-open") {
    /* sec 6a: the Fantasy entry point. The kind the reader came in
     * from is the kind the confirm screen starts on — he can still
     * change it there, because the picture is what it is and he is
     * the one who knows which team it was. */
    nav.team.kind = target.getAttribute("data-kind") === "dfs_entry"
      ? "dfs_entry" : "season_long";
    /* U5: and WHOSE lineup he is about to read. The opponent door
     * sets it here; every other door is his own team, which is what
     * every capture before U5 was. He can still change it on the
     * confirm screen — the picture is what it is and he is the one
     * who knows whose it was. */
    nav.team.side = target.getAttribute("data-side") === "opponent"
      ? "opponent" : "mine";
    openDetail("team");
  } else if (act === "team-kind") {
    nav.team.kind = target.getAttribute("data-kind");
    render();
  } else if (act === "team-side") {
    nav.team.side = target.getAttribute("data-side");
    render();
  } else if (act === "flex-swap") {
    /* Sec 5.2: the other card swaps into FLEX, the total moves, and a
     * toast says it did. Nothing is written anywhere. */
    nav.flex = target.getAttribute("data-player");
    render();
    showToast(FLEX_SWAPPED);
  } else if (act === "flex-clear") {
    nav.flex = null;
    render();
  } else if (act === "team-drop") {
    (nav.team.slots || []).splice(
      Number(target.getAttribute("data-slot")), 1);
    nav.team.saved = null;
    render();
  } else if (act === "team-save") {
    saveTeam();
  } else if (act === "connect" || act === "picks-retry" ||
      act === "live-retry") {
    if (askToken()) {
      nav.picksAsked = false;
      nav.picksOffline = false;
      nav.liveAsked = false;
      nav.liveOffline = false;
      loadPicks(true);
      if (liveOnScreen()) loadLive(true);
    } else {
      render();
    }
  } else if (act === "livecard") {
    /* sec 5.8: a row opens THAT bet's card. The selection is held on
     * the page and the card reads the same answer the list did, so
     * the two can never show different numbers for one bet. */
    nav.liveBet = target.getAttribute("data-bet");
    nav.liveSwing = null;
    openDetail("card");
  } else if (act === "swing") {
    nav.liveSwing = Number(target.getAttribute("data-index"));
    render();
  } else if (act === "toast-go") {
    const route = target.getAttribute("data-route");
    closeToast();
    if (route) openDetail(route);
  } else if (act === "toast-close") {
    closeToast();
  }
}

/* Sec 5.1's search panel. Opening it clears nothing and closing it
 * clears the query, so re-opening is a fresh search rather than a
 * half-remembered one. */
function openSearch() {
  if (!nav.slate || !games().length) return;
  nav.search = true;
  nav.toast = null;
  renderToast();
  renderSearch();
  const input = el("gamesearch");
  if (input && input.focus) input.focus();
}

function closeSearch() {
  if (!nav.search) return;
  nav.search = false;
  nav.query = "";
  renderSearch();
}

/* THE PICK ROUTE. The player — and, since U3, the MARKET — the card
 * was opened for ride the shell's own state; a cell on the home table
 * names no market and lands on his key prop, a Screen row names one
 * and lands on that bet. */
function openPick(playerId, market) {
  if (playerId) nav.pick = playerId;
  nav.pickMarket = market || null;
  closeSearch();
  openDetail("pick");
}

/* THE PROJECTION ROUTE (U7). One door for both ways in — a roster row
 * on the Projections list and a Pick card's "Full projection" — and
 * it is the cross-tab push in both cases, because a detail belongs to
 * the Projections stack wherever it was opened from. */
function openProjection(playerId) {
  if (playerId) {
    nav.proj.player = playerId;
    /* THE SWITCHER FOLLOWS THE MAN (sec 8b). He may be in any game of
     * the week, and a reader who pops back to the list should land on
     * the game he was just reading about rather than on whichever one
     * the switcher happened to be showing. */
    const found = projFind(playerId);
    if (found) {
      nav.projGame = found.game;
      nav.proj.query = "";
    }
  }
  openIn("projections", "projection");
}

function setSort(sort) {
  if (nav.sort === sort) return;
  for (let index = 0; index < SORTS.length; index += 1) {
    if (SORTS[index][0] === sort) {
      nav.sort = sort;
      render();
      return;
    }
  }
}

/* sec 5.5's primary action. The clipboard is asked politely and the
 * toast is shown either way: a copy that silently failed would leave
 * the reader pasting nothing into his book. */
function copyPick(playerId, market) {
  const person = playerOf(playerId);
  const prop = person ? propOf(person, market) : null;
  if (!person || !prop) return;
  const line = person.name + " " + prop.lean_label + " " + prop.line +
    " " + prop.market;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(line);
    }
  } catch (err) {
    /* a browser that will not take it still gets the toast, and the
     * pick is on the screen he is reading */
  }
  showToast(PICK_COPIED, PICK_PLACED, "track");
}

function parseIntoTrack(text) {
  const parsed = parseSlip(text);
  nav.track.legs = parsed.legs;
  nav.track.unparsed = parsed.unparsed;
  nav.track.saved = null;
  render();
}

/* MANUAL ENTRY IS THE SAME PARSER ON ONE LINE. A line that does not
 * match is kept as written and listed as unmatched, exactly as a
 * pasted one is — there is one rule for what counts as a leg. */
function addManualLeg(text) {
  const parsed = parseSlip(text);
  nav.track.legs = nav.track.legs.concat(parsed.legs);
  nav.track.unparsed = nav.track.unparsed.concat(parsed.unparsed);
  nav.track.saved = null;
  nav.track.text = "";
  render();
}

/* The search input is the one control in this app that is not a
 * button, so it is the one thing wired by its own listener rather
 * than by `data-act`. Re-rendering the panel on each keystroke would
 * take the caret with it, so only the RESULTS are redrawn. */
function onInput(event) {
  const target = event.target;
  if (!target) return;
  /* U3's four fields keep their own text in the shell's state and are
   * NOT re-rendered on each keystroke: only the verdict numbers
   * change as a payout is typed, and re-drawing the field under the
   * caret would take the caret with it. */
  if (target.id === "slippaste" || target.id === "manualleg") {
    nav.track.text = target.value;
    return;
  }
  /* U6's one field, and it keeps its text in the draft for the same
   * reason the others do: re-rendering the sheet under his caret
   * would take the caret with it, and a poll or a toast must never
   * eat a sentence he is halfway through. */
  if (target.id === "readtext") {
    nav.read.text = target.value;
    return;
  }
  /* U7's roster filter. Only the LIST is redrawn, the same way the
   * game search redraws only its results. */
  if (target.id === "projsearch") {
    nav.proj.query = target.value;
    const list = el("projlist");
    if (list) list.innerHTML = projListBody();
    return;
  }
  /* U3c's editable rows on the team confirm screen. A row the reader
   * is fixing keeps its text in the proposal he is confirming, and
   * the row is NOT re-rendered under his caret. */
  if (target.id.indexOf("teamslot") === 0) {
    const slot = (nav.team.slots || [])[
      Number(target.id.slice("teamslot".length))];
    if (slot) {
      slot.player_text = target.value;
      nav.team.saved = null;
    }
    return;
  }
  if (target.id === "slippayout" || target.id === "slipstake") {
    if (target.id === "slippayout") {
      nav.track.payout = target.value;
    } else {
      nav.track.stake = target.value;
    }
    redrawVerdict();
    return;
  }
  if (target.id !== "gamesearch") return;
  nav.query = target.value;
  const panel = el("searchoverlay");
  if (!panel) return;
  const held = target.selectionStart;
  renderSearch();
  const again = el("gamesearch");
  if (again) {
    again.focus();
    try {
      again.setSelectionRange(held, held);
    } catch (err) {
      /* a browser that will not place the caret still has the text */
    }
  }
}

/* sec 6a's ONE change listener, and it is the file picker's own —
 * the same arrangement the input listener has, for the same reason:
 * one place that knows how a control reports itself, rather than an
 * inline handler per control. */
function onChange(event) {
  const target = event.target;
  if (!target || !target.files) return;
  if (target.id === "slipshot") {
    chooseShot("slip", target.files[0]);
  } else if (target.id === "teamshot") {
    chooseShot("team", target.files[0]);
  }
}

function onKeyDown(event) {
  if (event.key !== "Escape") return;
  if (nav.search) {
    closeSearch();
    return;
  }
  if (nav.sheet) closeSheet();
}

function onHashChange() {
  applyHash();
  render();
  normalizeHash();
}

/* ------------------------------------------------------------------
 * boot — no fetch, no storage, one render
 * ------------------------------------------------------------------ */

document.addEventListener("click", onClick);
document.addEventListener("input", onInput);
document.addEventListener("change", onChange);
document.addEventListener("keydown", onKeyDown);
window.addEventListener("hashchange", onHashChange);

/* U4's own listener, and the whole of the "pause when hidden" rule: a
 * backgrounded tab asks a service nothing, and a tab brought back
 * asks once immediately rather than waiting out a minute. */
document.addEventListener("visibilitychange", syncLivePoll);

/* Boot order matters: the address is reconciled and normalised
 * BEFORE the first paint. Where `replaceState` is missing, normalising
 * writes the hash instead, and writing it fires a hashchange — doing
 * that after the first render would hand the reader a second render
 * with a transition on it, which is the entry animation this file has
 * just finished removing. Normalise first and every boot path paints
 * once, at rest. */
applyHash();
normalizeHash();
render();

/* Boot is over. `booted` is set HERE and nowhere else — it means the
 * app has finished opening, not that a render happened, so the extra
 * render the `replaceState` fallback can provoke is still part of
 * booting and still at rest. Every transition from this line on
 * belongs to something the reader did. */
nav.booted = true;

/* ...and only then is the document asked for. The first paint is the
 * shell at rest (U1's rule, unchanged); the slate arrives after it and
 * redraws the home screen when it does, so a slow network shows the
 * app rather than a blank page, and a network that never answers shows
 * the honest arm rather than a spinner that means nothing. */
loadSlate();

/* ...and the reader's own objects, which live on the service. The
 * token is READ (never prompted) at boot so the segment knows which
 * of its two honest states to draw: connected, or the connect card.
 * Nothing is asked of the service without one. */
nav.hasToken = !DEMO && !!readToken();
if (nav.hasToken) {
  /* ...and the live board, if that is the screen he opened on. The
   * poll is reconciled here rather than started, because the one
   * place it turns on is `syncLivePoll`. */
  syncLivePoll();
  loadPicks(false);
  /* ...and the team he has already confirmed, so Fantasy says which
   * one is his rather than offering to read a picture he has read. */
  loadTeams(false);
}

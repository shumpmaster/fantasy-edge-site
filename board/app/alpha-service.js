/* The alpha service adapter uses the page's existing transport and identity. */
(function (root) {
  "use strict";

  const INTENT_KEY = "fe.slip.intent.v1";
  // The slate export's six tracked display names, pinned to its market keys.
  const MARKET_KEYS = Object.freeze({
    'receptions': 'player_receptions',
    'receiving yards': 'player_reception_yds',
    'rushing attempts': 'player_rush_attempts',
    'rushing yards': 'player_rush_yds',
    'passing yards': 'player_pass_yds',
    'passing touchdowns': 'player_pass_tds'
  });
  function marketKey(market) {
    // Already canonical markets retain their exact identity, including markets
    // whose availability/grade is explicitly unsupported by the service.
    if (typeof market !== 'string') return null;
    return /^player_[a-z0-9_]+$/.test(market) ? market
      : Object.prototype.hasOwnProperty.call(MARKET_KEYS, market) ? MARKET_KEYS[market] : null;
  }
  function closedCapabilities() {
    return { contract: null, capabilities: [], available: false };
  }

  function identityOf(getIdentity) {
    const found = getIdentity() || {};
    return { token: String(found.token || ""),
      user_id: String(found.user_id || "") };
  }

  function sameMember(left, right) {
    return left.token === right.token && left.user_id === right.user_id;
  }

  function storedIntent() {
    try {
      return JSON.parse(root.localStorage.getItem(INTENT_KEY) || "null");
    } catch (err) {
      return null;
    }
  }

  function storeIntent(intent) {
    try {
      root.localStorage.setItem(INTENT_KEY, JSON.stringify(intent));
    } catch (err) {
      /* A blocked storage write leaves this visit's in-memory retry. */
    }
  }

  function clearStoredIntent() {
    try {
      root.localStorage.removeItem(INTENT_KEY);
    } catch (err) {
      /* A blocked storage API has no stored copy to recover. */
    }
  }

  function requestId() {
    if (root.crypto && typeof root.crypto.randomUUID === "function") {
      return root.crypto.randomUUID();
    }
    return "slip-" + Date.now().toString(36) + "-" +
      Math.random().toString(36).slice(2, 14);
  }

  function pick(source, names) {
    const result = {};
    names.forEach(function (name) {
      if (source[name] !== undefined) result[name] = source[name];
    });
    return result;
  }

  function slipPayload(draft) {
    if (!draft || !Array.isArray(draft.legs) || !draft.legs.length ||
        draft.legs.length > 12) {
      throw new TypeError("A slip needs one to twelve legs.");
    }
    const payload = pick(draft, ["source", "input", "stake",
      "payout_multiple"]);
    payload.contract = "slips/2";
    if (!payload.input) payload.input = "paste";
    if (!["paste", "manual", "screenshot"].includes(payload.input)) {
      throw new TypeError("Unknown slip input.");
    }
    if (payload.stake != null &&
        (!Number.isFinite(payload.stake) || payload.stake <= 0 ||
          payload.stake > 1000000)) {
      throw new TypeError("Invalid stake.");
    }
    if (payload.payout_multiple != null &&
        (!Number.isFinite(payload.payout_multiple) ||
          payload.payout_multiple <= 1)) {
      throw new TypeError("Invalid payout multiple.");
    }
    payload.legs = draft.legs.map(function (leg) {
      if (!leg || !["more", "less"].includes(leg.side)) {
        throw new TypeError("Each leg needs an Over or Under side.");
      }
      const row = pick(leg, ["player_id", "player_text", "market",
        "side", "line_placed", "line_screened", "blind_spot",
        "odds_american", "book", "odds_source"]);
      row.market = marketKey(row.market);
      if (!row.market) throw new TypeError("This statistic cannot be recorded yet. Choose a supported player line.");
      ["line_placed", "line_screened"].forEach(function (field) {
        if (row[field] != null && !Number.isFinite(row[field])) {
          throw new TypeError("Invalid " + field + ".");
        }
      });
      if (row.odds_american != null &&
          (!Number.isInteger(row.odds_american) ||
            Math.abs(row.odds_american) < 100)) {
        throw new TypeError("Invalid American odds.");
      }
      if (row.book != null &&
          (typeof row.book !== "string" || !row.book.trim() ||
            row.book.trim().length > 40)) {
        throw new TypeError("Invalid book.");
      }
      if (row.odds_source != null &&
          !["personal", "slate"].includes(row.odds_source)) {
        throw new TypeError("Invalid odds source.");
      }
      return row;
    });
    return payload;
  }

  function validCapabilities(answer) {
    if (!answer || answer.contract !== "v1" ||
        !Array.isArray(answer.capabilities) ||
        !answer.capabilities.length) return false;
    return answer.capabilities.every(function (row) {
      return row && typeof row.id === "string" &&
        typeof row.row === "string" &&
        ["single-bet core", "the rest of the approved alpha"]
          .includes(row.screen) &&
        ["ready", "partial", "unavailable"].includes(row.status) &&
        row.contract === "v1" && Array.isArray(row.endpoints) &&
        row.endpoints.every(function (route) {
          return typeof route === "string";
        }) &&
        (row.reason === null || typeof row.reason === "string") &&
        (row.follow_up === null || typeof row.follow_up === "string") &&
        (row.status === "ready" || !!row.reason);
    });
  }

  function create(options) {
    const request = options.request;
    const isDemo = options.isDemo;
    const memberIdentity = options.memberIdentity;
    let epoch = 0;
    let intent = null;

    async function capabilities() {
      if (isDemo()) return closedCapabilities();
      try {
        const answer = await request("/capabilities", "", null);
        return validCapabilities(answer)
          ? Object.assign({}, answer, { available: true })
          : closedCapabilities();
      } catch (err) {
        return closedCapabilities();
      }
    }

    async function loadHistory(season, week) {
      if (isDemo()) return null;
      const member = identityOf(memberIdentity);
      if (!member.token) return null;
      const started = epoch;
      try {
        const answer = await request("/history?season=" +
          encodeURIComponent(season) + "&week=" +
          encodeURIComponent(week), member.token, null);
        return started === epoch && sameMember(member,
          identityOf(memberIdentity)) ? answer : null;
      } catch (err) {
        if (started !== epoch || !sameMember(member,
            identityOf(memberIdentity))) return null;
        throw err;
      }
    }

    function pendingSlip() {
      const member = identityOf(memberIdentity);
      if (!member.user_id) return null;
      const saved = intent || storedIntent();
      if (!saved || saved.user_id !== member.user_id) return null;
      return { request_id: saved.request_id,
        payload: JSON.parse(JSON.stringify(saved.payload)) };
    }

    async function saveSlip(draft) {
      if (isDemo()) return null;
      const member = identityOf(memberIdentity);
      if (!member.token || !member.user_id) return null;
      const payload = slipPayload(draft);
      const signature = JSON.stringify(payload);
      const previous = intent || storedIntent();
      if (previous && previous.user_id === member.user_id &&
          previous.signature === signature) {
        intent = previous;
      } else {
        intent = { user_id: member.user_id, signature: signature,
          request_id: requestId(), payload: Object.assign({
            request_id: null }, payload) };
        intent.payload.request_id = intent.request_id;
      }
      storeIntent(intent);
      const started = epoch;
      const sentIntent = intent;
      try {
        const answer = await request("/slips", member.token,
          JSON.parse(JSON.stringify(sentIntent.payload)));
        if (started !== epoch || !sameMember(member,
            identityOf(memberIdentity))) return null;
        if (intent === sentIntent) intent = null;
        const saved = storedIntent();
        if (saved && saved.request_id === sentIntent.request_id &&
            saved.user_id === sentIntent.user_id) clearStoredIntent();
        return answer;
      } catch (err) {
        if (started !== epoch || !sameMember(member,
            identityOf(memberIdentity))) return null;
        throw err;
      }
    }

    function resetMember() {
      epoch += 1;
      intent = null;
      clearStoredIntent();
    }

    return { capabilities: capabilities, loadHistory: loadHistory,
      saveSlip: saveSlip, pendingSlip: pendingSlip,
      resetMember: resetMember };
  }

  const AlphaService = { create: create, marketKey: marketKey, slipPayload: slipPayload };
  root.AlphaService = AlphaService;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = AlphaService;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);

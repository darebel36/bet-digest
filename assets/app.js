async function loadPicks() {
  try {
    const res = await fetch("picks/latest.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Fetch failed: " + res.status);
    return await res.json();
  } catch (e) {
    const fallback = document.getElementById("picks-fallback");
    if (fallback) {
      try { return JSON.parse(fallback.textContent); } catch (_) { return null; }
    }
    return null;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(isoDate) {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric"
  }).toUpperCase().replace(/,/g, " ·");
}

function formatGameTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", timeZoneName: "short"
  });
}

function formatUpdated(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `Updated ${time}`;
}

function evIntensity(evPct) {
  if (evPct >= 0.30) return "elite";
  if (evPct >= 0.15) return "high";
  return "";
}

function parseFirstNumber(str) {
  const m = String(str).match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

function renderBar(line, projection) {
  if (line == null || projection == null) return "";
  const max = Math.max(line, projection) * 1.4 || 1;
  const fillPct = Math.min(100, (projection / max) * 100);
  const markerPct = Math.min(100, Math.max(0, (line / max) * 100));
  return `
    <div class="pick-bar-section">
      <div class="pick-bar-labels">
        <span class="bar-label-line">Line<span class="num">${line}</span></span>
        <span class="bar-label-proj">Projection<span class="num">${projection}</span></span>
      </div>
      <div class="pick-bar-track">
        <div class="pick-bar-fill" style="width:${fillPct}%"></div>
        <div class="pick-bar-marker" style="left:${markerPct}%"></div>
      </div>
    </div>
  `;
}

function renderTeamLogo(pick) {
  const abbr = pick.team_abbr || "";
  const logo = pick.team_logo || "";
  if (!logo) {
    return `<div class="team-logo" data-abbr="${escapeHtml(abbr)}"></div>`;
  }
  return `
    <div class="team-logo" data-abbr="${escapeHtml(abbr)}">
      <img src="${escapeHtml(logo)}" alt="${escapeHtml(abbr)} logo" onerror="this.style.display='none'">
    </div>
  `;
}

function renderPick(pick, index) {
  const isTop = index === 0;
  const evClass = evIntensity(pick.ev_pct);
  const evText = `+${(pick.ev_pct * 100).toFixed(1)}%`;
  const winProbText = `${(pick.win_prob * 100).toFixed(1)}%`;
  const rankStr = String(pick.rank).padStart(2, "0");

  const lineNum = parseFirstNumber(pick.line);
  const projNum = parseFirstNumber(pick.projection);
  const gameTime = formatGameTime(pick.game_time);
  const isRi = !!pick.book_is_ri;
  const bookClass = isRi ? "book-name ri-tag" : "book-name";
  const bookIcon = isRi
    ? `<svg class="book-icon" viewBox="0 0 14 14" fill="none"><path d="M7 1 C4.5 1 2.5 3 2.5 5.5 C2.5 8.5 7 13 7 13 C7 13 11.5 8.5 11.5 5.5 C11.5 3 9.5 1 7 1 Z" stroke="currentColor" stroke-width="1"/><circle cx="7" cy="5.5" r="1.5" fill="currentColor"/></svg>`
    : `<svg class="book-icon" viewBox="0 0 14 14" fill="none"><rect x="2" y="4" width="10" height="8" stroke="currentColor" stroke-width="1"/><path d="M2 4 L7 1 L12 4" stroke="currentColor" stroke-width="1" fill="none"/></svg>`;

  const card = document.createElement("article");
  card.className = "pick-card" + (isTop ? " top-pick" : "");
  card.style.animationDelay = `${index * 80}ms`;
  card.innerHTML = `
    <div class="pick-top">
      <div class="pick-rank">${rankStr}</div>
      <div class="pick-identity">
        <div class="player-row">
          ${renderTeamLogo(pick)}
          <div class="pick-player">${escapeHtml(pick.player)}</div>
        </div>
        <div class="pick-market">${escapeHtml(pick.market)} <span class="line-bold">${escapeHtml(pick.line)}</span></div>
        <div class="pick-meta">
          <span class="league-tag">${escapeHtml(pick.sport)}</span>
          <span>${escapeHtml(pick.matchup)}</span>
          <span class="dot">·</span>
          <span>${escapeHtml(gameTime)}</span>
        </div>
      </div>
      <div class="pick-ev-block">
        <div class="pick-ev-num ${evClass}">${evText}</div>
        <div class="pick-ev-label">EV Edge</div>
      </div>
    </div>

    ${renderBar(lineNum, projNum)}

    <div class="pick-stats">
      <div class="pick-stat">
        <div class="stat-label">Odds</div>
        <div class="stat-val">${escapeHtml(pick.odds)}</div>
      </div>
      <div class="pick-stat">
        <div class="stat-label">Projection</div>
        <div class="stat-val">${escapeHtml(pick.projection)}</div>
      </div>
      <div class="pick-stat">
        <div class="stat-label">Win Prob</div>
        <div class="stat-val win-prob">${winProbText}</div>
      </div>
    </div>

    <div class="pick-reasoning">
      <div class="reasoning-label">Why this bet</div>
      <p class="reasoning-text">${escapeHtml(pick.reasoning)}</p>
    </div>

    <div class="pick-book">
      <div class="book-left">
        ${bookIcon}
        <span class="${bookClass}">${escapeHtml(pick.book)}</span>
      </div>
      <div class="book-right">
        <span class="book-line-text">${escapeHtml(pick.line)}</span>
        <span class="book-odds">${escapeHtml(pick.odds)}</span>
      </div>
    </div>
  `;
  return card;
}

(async () => {
  const data = await loadPicks();
  const picksEl = document.getElementById("picks");
  const emptyEl = document.getElementById("empty-state");

  if (!data || !Array.isArray(data.picks) || data.picks.length === 0) {
    picksEl.classList.add("hidden");
    emptyEl.classList.remove("hidden");
    return;
  }

  document.getElementById("page-date").textContent = formatDate(data.date);
  document.getElementById("nav-date").textContent = formatDate(data.date);
  if (data.summary) {
    document.getElementById("section-label-text").textContent = data.summary;
  }
  if (data.generated_at) {
    document.getElementById("page-updated").textContent = formatUpdated(data.generated_at);
  }

  const frag = document.createDocumentFragment();
  data.picks.forEach((pick, i) => frag.appendChild(renderPick(pick, i)));
  picksEl.appendChild(frag);
})();

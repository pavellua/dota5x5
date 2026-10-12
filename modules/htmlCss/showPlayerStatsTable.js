const playerStatsTable = document.getElementById("playerStatsTable");
const bodyTable = playerStatsTable.querySelector("tbody");

let heroesId = null;
let totalPossibleHeroes = 0;
export default function ShowPlayerStatsTable(playerStats, resJson) {
  bodyTable.innerHTML = "";

  playerStatsTable.style.display = "table";
  setTimeout(() => playerStatsTable.classList.add("activeContainer"), 10);
  heroesId = resJson.heroesId;
  totalPossibleHeroes = Math.max(1, Object.keys(heroesId).length);

  const players = Object.entries(playerStats).map(([id, player]) => ({
    id,
    ...player,
    winrate: player.wins / (player.wins + player.losses) || 0,
  }));

  // Сортування по вінрейту (від більшого до меншого)
  players.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.wins + b.losses - (a.wins + a.losses);
  });
  players.forEach((player) => {
    if (player.name === "Невідомо") return;
    const tr = document.createElement("tr");

    tr.setAttribute("data-player-id", player.id);
    const playerName = player.name;
    const wins = player.wins;
    const losses = player.losses;
    const matchNumber = wins + losses;
    const winrate = Math.round(player.winrate * 100);

    tr.innerHTML = `
<td data-player-name>
  <span>${playerName}</span><br>
  <small class="winrate">${player.rating}</small>
</td>
<td class="greenTd">${wins}</td>
<td class="redTd">${losses}</td>
<td>${matchNumber}</td>
<td class="winrate">${winrate}%</td>
<td class="heroesStats">${playersHeroesDiv(player, resJson.matches)}</td>




`;
    bodyTable.append(tr);
  });
}

function playersHeroesDiv(player, matches) {
  const seenHeroes = new Set();
  const recentHeroes = [];
  const playerMatches = [...matches].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  for (const match of playerMatches) {
    const matchPlayer = match.players.find(
      (candidate) => String(candidate.accountid) === String(player.id),
    );
    if (!matchPlayer) continue;

    const heroId = String(matchPlayer.hero);
    if (seenHeroes.has(heroId)) continue;
    seenHeroes.add(heroId);
    recentHeroes.push([heroId, player.heroes[heroId]]);
    if (recentHeroes.length === 10) break;
  }

  const icons = recentHeroes
    .map(([heroId, stats]) => {
      const hero = heroesId[heroId];
      if (!hero || !stats) return "";
      const imgName = hero.npcName.replace("npc_dota_hero_", "");

      return `
        <div class="hero-item">
          <img 
            src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/${imgName}.png"
            alt="${hero.name}"
            title="${heroId} — ${stats.picks} ігор (${stats.wins}W/${stats.losses}L)"
          />
          <span>${stats.picks}</span>
        </div>
      `;
    })
    .join("");

  const poolSize = Object.keys(player.heroes).length;
  const poolPercent = Math.round((poolSize / totalPossibleHeroes) * 100);
  return `<div class="recent-heroes">${icons}</div><div class="hero-pool-meter" role="img" aria-label="${poolSize} unique heroes in pool" title="${poolSize} heroes in pool"><span style="width: ${poolPercent}%"></span><b>${poolSize}</b></div>`;
}

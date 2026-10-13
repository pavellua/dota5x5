const playerStatsTable = document.getElementById("playerStatsTable");
const bodyTable = playerStatsTable.querySelector("tbody");

let heroesId = null;
let totalPossibleHeroes = 0;
export default function ShowPlayerStatsTable(playerStats, resJson) {
  bodyTable.innerHTML = "";

  playerStatsTable.style.display = "table";
  setTimeout(() => playerStatsTable.classList.add("activeContainer"), 10);
  const summary = playerStatsTable.caption || playerStatsTable.createCaption();
  summary.className = "playerStatsSummary";
  heroesId = resJson.heroesId;
  totalPossibleHeroes = Math.max(1, Object.keys(heroesId).length);

  const lastPlayedByPlayer = new Map();
  resJson.matches.forEach((match) => {
    const matchTime = new Date(match.date).getTime();
    if (!Number.isFinite(matchTime)) return;

    match.players.forEach((matchPlayer) => {
      const playerId = String(matchPlayer.accountid);
      const lastPlayed = lastPlayedByPlayer.get(playerId) || 0;
      if (matchTime > lastPlayed) lastPlayedByPlayer.set(playerId, matchTime);
    });
  });
  const activeSince = Date.now() - 40 * 24 * 60 * 60 * 1000;

  const allPlayers = Object.entries(playerStats)
    .map(([id, player]) => ({
      id,
      ...player,
      winrate: player.wins / (player.wins + player.losses) || 0,
    }));

  const players = allPlayers.filter((player) => {
    const lastPlayed = lastPlayedByPlayer.get(String(player.id));
    return player.wins + player.losses >= 8 && lastPlayed >= activeSince;
  });
  players.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.wins + b.losses - (a.wins + a.losses);
  });

  // Сортування по вінрейту (від більшого до меншого)
  let displayedPlayerCount = 0;
  players.forEach((player) => {
    if (player.name === "Невідомо") return;
    player.ratingRank = ++displayedPlayerCount;
    const tr = document.createElement("tr");

    tr.setAttribute("data-player-id", player.id);
    tr.dataset.playerRating = player.rating;
    const playerName = player.name;
    const wins = player.wins;
    const losses = player.losses;
    const matchNumber = wins + losses;
    const winrate = Math.round(player.winrate * 100);

    tr.innerHTML = `
<td class="playerRatingRank">${player.ratingRank}</td>
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
  summary.textContent = `\u0423\u0441\u044c\u043e\u0433\u043e ${displayedPlayerCount} \u0433\u0440\u0430\u0432\u0446\u0456\u0432`;
}

function playersHeroesDiv(player, matches) {
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
    recentHeroes.push({ heroId, won: matchPlayer.team === match.winner });
    if (recentHeroes.length === 10) break;
  }

  const icons = recentHeroes
    .map(({ heroId, won }) => {
      const hero = heroesId[heroId];
      if (!hero) return "";
      const imgName = hero.npcName.replace("npc_dota_hero_", "");
      const resultClass = won ? "win" : "loss";

      return `
        <div class="hero-item">
          <img class="${resultClass}"
            src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/${imgName}.png"
            alt="${hero.name}"
            title="${hero.name}"
          />
        </div>
      `;
    })
    .join("");

  const poolSize = Object.keys(player.heroes).length;
  const poolPercent = Math.round((poolSize / totalPossibleHeroes) * 100);
  return `<div class="recent-heroes">${icons}</div><div class="hero-pool-meter" role="img" aria-label="${poolSize} unique heroes in pool" title="${poolSize} heroes in pool"><span style="width: ${poolPercent}%"></span><b>${poolSize}</b></div>`;
}

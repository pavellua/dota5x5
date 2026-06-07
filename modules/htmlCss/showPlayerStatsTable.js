const playerStatsTable = document.getElementById("playerStatsTable");
const bodyTable = playerStatsTable.querySelector("tbody");

let heroesId = null;
export default function ShowPlayerStatsTable(playerStats, resJson) {
  bodyTable.innerHTML = "";

  playerStatsTable.style.display = "table";
  setTimeout(() => playerStatsTable.classList.add("activeContainer"), 10);
  heroesId = resJson.heroesId;

  const players = Object.entries(playerStats).map(([id, player]) => ({
    id,
    ...player,
    winrate: player.wins / (player.wins + player.losses) || 0,
  }));

  // Сортування по вінрейту (від більшого до меншого)
  players.sort((a, b) => {
    if (b.winrate !== a.winrate) return b.winrate - a.winrate;
    return b.wins + b.losses - (a.wins + a.losses);
  });
  players.forEach((player) => {
    if (player.name === "Невідомо") return;
    const tr = document.createElement("tr");
    console.log(player);
    tr.setAttribute("data-player-id", player.id);
    const playerName = player.name;
    const wins = player.wins;
    const losses = player.losses;
    const matchNumber = wins + losses;
    const winrate = Math.round(player.winrate * 100);

    tr.innerHTML = `
<td data-player-name>${playerName}</td>
<td class="greenTd">${wins}</td>
<td class="redTd">${losses}</td>
<td>${matchNumber}</td>
<td class="winrate">${winrate}%</td>
<td class="heroesStats">${playersHeroesDiv(player)}</td>




`;
    bodyTable.append(tr);
  });
}

function playersHeroesDiv(player) {
  return Object.entries(player.heroes)
    .map(([heroId, stats]) => {
      const imgName = heroesId[heroId].npcName.replace("npc_dota_hero_", "");

      return `
        <div class="hero-item">
          <img 
            src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/${imgName}.png"
            alt="${heroId}"
            title="${heroId} — ${stats.picks} ігор (${stats.wins}W/${stats.losses}L)"
          />
          <span>${stats.picks}</span>
        </div>
      `;
    })
    .join("");
}

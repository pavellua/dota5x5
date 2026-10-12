const details = document.getElementById("heroPickDetails");
const heroIcon = document.getElementById("heroPickDetailsIcon");
const heroName = document.getElementById("heroPickDetailsName");
const summary = document.getElementById("heroPickDetailsSummary");
const statsTable = document.getElementById("heroPlayerStatsTable");
const tableBody = statsTable.querySelector("tbody");
const matchesHeader = statsTable.querySelectorAll("thead td")[1];

export default function ShowHeroPickDetails(heroId, data) {
  const hero = data.heroesId[heroId];
  const heroMatches = new Map();

  data.matches.forEach((match) => {
    match.players.forEach((player) => {
      if (String(player.hero) !== String(heroId)) return;
      const playerId = String(player.accountid);
      if (!heroMatches.has(playerId)) {
        heroMatches.set(playerId, {
          id: playerId,
          name: player.name || "Невідомий гравець",
          matches: 0,
          wins: 0,
          losses: 0,
        });
      }
      const stats = heroMatches.get(playerId);
      stats.matches += 1;
      if (player.team === match.winner) stats.wins += 1;
      else stats.losses += 1;
    });
  });

  const players = [...heroMatches.values()].sort((a, b) => b.matches - a.matches || a.name.localeCompare(b.name));
  const totalPicks = players.reduce((total, player) => total + player.matches, 0);
  const totalWins = players.reduce((total, player) => total + player.wins, 0);

  heroName.textContent = hero?.name || "Невідомий герой";
  heroIcon.src = hero
    ? "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/" + hero.npcName.replace("npc_dota_hero_", "") + ".png"
    : "";
  heroIcon.alt = hero?.name || "";
  summary.textContent = totalPicks + " піків · " + totalWins + " перемог · " + (totalPicks - totalWins) + " поразок";

  tableBody.replaceChildren();
  matchesHeader.dataset.sortDirection = "desc";
  if (!players.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "У збережених матчах на цьому герої ніхто не грав.";
    row.append(cell);
    tableBody.append(row);
  }
  players.forEach((player) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = player.name;
    const matchesCell = document.createElement("td");
    matchesCell.textContent = String(player.matches);
    const winsCell = document.createElement("td");
    winsCell.className = "greenTd";
    winsCell.textContent = String(player.wins);
    const lossesCell = document.createElement("td");
    lossesCell.className = "redTd";
    lossesCell.textContent = String(player.losses);
    const winrateCell = document.createElement("td");
    winrateCell.className = "winrate";
    winrateCell.textContent = Math.round((player.wins / player.matches) * 100) + "%";
    row.append(nameCell, matchesCell, winsCell, lossesCell, winrateCell);
    tableBody.append(row);
  });

  details.style.display = "block";
  details.classList.add("activeContainer");
}

const individualStatsContainer = document.getElementById("individualStats");

const teammateWinrateContainer = document.getElementById("teammateWinrate");
const opponentWinrateContainer = document.getElementById("opponentWinrate");

const teammatesTable = teammateWinrateContainer.querySelector("table");
const teammatesTableBody = teammatesTable.querySelector("tbody");
const selectIndividPlayerContainer = document.getElementById(
  "selectIndividPlayer",
);
const opponentsTable = opponentWinrateContainer.querySelector("table");
const opponentsTableBody = opponentsTable.querySelector("tbody");

export default function ShowIndividualStats(playerStats, playerId) {
  selectIndividPlayerContainer.value = playerId;
  opponentsTableBody.innerHTML = "";
  teammatesTableBody.innerHTML = "";
  individualStatsContainer.style.display = "block";
  setTimeout(
    () => individualStatsContainer.classList.add("activeContainer"),
    10,
  );
  const teamMates = playerStats[playerId].teamMates;
  const opponents = playerStats[playerId].opponents;
  console.log(playerStats);
  for (let playerId in teamMates) {
    const teammateTr = document.createElement("tr");
    teammatesTableBody.append(teammateTr);
    const teammateName = playerStats[playerId].name;
    const winrate = teamMates[playerId].winrate;
    const wins = teamMates[playerId].wins;
    const lose = teamMates[playerId].lose;
    const matchesNumber = wins + lose;

    teammateTr.innerHTML = `
<td>${teammateName}</td>
<td class="greenTd">${wins}</td>
<td class="redTd">${lose}</td>
<td>${matchesNumber}</td>
<td class="winrate">${winrate}%</td>

`;
  }

  for (let playerId in opponents) {
    const opponentTr = document.createElement("tr");
    opponentsTableBody.append(opponentTr);
    const teammateName = playerStats[playerId].name;
    const winrate = opponents[playerId].winrate;
    const wins = opponents[playerId].wins;
    const lose = opponents[playerId].lose;
    const matchesNumber = wins + lose;
    opponentTr.innerHTML = `
<td>${teammateName}</td>
<td class="greenTd">${wins}</td>
<td class="redTd">${lose}</td>
<td>${matchesNumber}</td>
<td class="winrate">${winrate}%</td>

`;
  }
}

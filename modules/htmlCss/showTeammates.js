const selectIndividPlayerContainer = document.getElementById("selectPlayer");
const teammateWinrateContainer = document.getElementById("teammateWinrate");
const winrateWithPlayers = document.getElementById("winrateWithPlayers");
const teammatesTable = teammateWinrateContainer.querySelector("table");
const teammatesTableBody = teammatesTable.querySelector("tbody");
const opponentWinrateContainer = document.getElementById("opponentWinrate");
const opponentsTable = opponentWinrateContainer.querySelector("table");
const opponentsTableBody = opponentsTable.querySelector("tbody");
const individualContainerInfo = document.getElementById(
  "individualContainerInfo",
);

export default function ShowTeammates(playerStats, sortParam) {
  const activeIndividContainer = document.querySelector(
    ".activeIndividContainer",
  );
  activeIndividContainer
    ? activeIndividContainer.classList.remove("activeIndividContainer")
    : null;
  winrateWithPlayers.classList.add("activeIndividContainer");
  [...individualContainerInfo.children].forEach(
    (element) => (element.style.display = "none"),
  );
  winrateWithPlayers.style.display = "block";
  opponentsTableBody.innerHTML = "";
  teammatesTableBody.innerHTML = "";
  const playerId = selectIndividPlayerContainer.value;

  let teamMates = playerStats[playerId].teamMates;
  console.log(teamMates);
  teamMates = Object.entries(teamMates)
    .map(([id, stat]) => ({ id, ...stat }))
    .sort((a, b) => b[sortParam] - a[sortParam]);

  let opponents = playerStats[playerId].opponents;
  opponents = Object.entries(opponents)
    .map(([id, stat]) => ({ id, ...stat }))
    .sort((a, b) => b[sortParam] - a[sortParam]);

  for (let player of teamMates) {
    const teammateTr = document.createElement("tr");
    teammatesTableBody.append(teammateTr);
    const teammateName = playerStats[player.id].name;
    const winrate = player.winrate;
    const wins = player.wins;
    const lose = player.lose;
    const matchesNumber = wins + lose;

    teammateTr.innerHTML = `
<td>${teammateName}</td>
<td class="greenTd">${wins}</td>
<td class="redTd">${lose}</td>
<td>${matchesNumber}</td>
<td class="winrate">${winrate}%</td>

`;
  }

  for (let player of opponents) {
    const opponentTr = document.createElement("tr");
    opponentsTableBody.append(opponentTr);
    const teammateName = playerStats[player.id].name;
    const winrate = player.winrate;
    const wins = player.wins;
    const lose = player.lose;
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

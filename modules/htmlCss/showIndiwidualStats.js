import { GetData } from "../dataStore.js";
import ShowIndividuaHeroes from "./showIndividualHeroes.js";

const individualStatsContainer = document.getElementById("individualStats");

const teammateWinrateContainer = document.getElementById("teammateWinrate");
const opponentWinrateContainer = document.getElementById("opponentWinrate");

const teammatesTable = teammateWinrateContainer.querySelector("table");
const teammatesTableBody = teammatesTable.querySelector("tbody");
const selectIndividPlayerContainer = document.getElementById("selectPlayer");
const opponentsTable = opponentWinrateContainer.querySelector("table");
const opponentsTableBody = opponentsTable.querySelector("tbody");

export default async function ShowIndividualStats(params) {
  let { playerStats, playerId, sortParam = "winrate" } = params;
  const selectIdPlayer = selectIndividPlayerContainer.value;

  opponentsTableBody.innerHTML = "";
  teammatesTableBody.innerHTML = "";
  individualStatsContainer.style.display = "block";
  console.log(1);

  setTimeout(
    () => individualStatsContainer.classList.add("activeContainer"),
    10,
  );
  if (!playerId && selectIdPlayer) playerId = selectIdPlayer;
  if (playerId) {
    const data = await GetData();
    ShowIndividuaHeroes(playerStats, selectIndividPlayerContainer.value, data);
    selectIndividPlayerContainer.value = playerId;
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
}

import { GetData } from "../dataStore.js";

const giveaawayTable = document.getElementById("giveawayInfoTable");
const bodyTable = giveaawayTable.querySelector("tbody");
const giveawayContainer = document.getElementById("giveawayContainer");
const giveawayDateText = document.getElementById("giveawayDateText");
const giveawayTimer = document.getElementById("giveawayTimer");
const minimumMatchesPlayerAlltime = document.getElementById(
  "minimumMatchesPlayerAlltime",
);
const minimumMatchesPlayer3weeks = document.getElementById(
  "minimumMatchesPlayer3weeks",
);
const minimuMatchesForAllPlayesr = document.getElementById(
  "minimuMatchesForAllPlayesr",
);
const matchPlayed = document.getElementById("matchPlayed");
let giveawayTimerInterval;
let data;
const giveawayConditions = {
  minimumMatchesPlayerAlltime: 10,
  minimumMatchesPlayer3weeks: 3,
  minimuMatchesForAllPlayesr: 7,
};

export default async function ShowGiveawayInfo() {
  data = await GetData();
  winChancePlayer();
  const giveawayObject = data.giveawayInfo[data.giveawayInfo.length - 1];
  console.log(giveawayConditions.minimumMatchesPlayerAlltime);
  minimumMatchesPlayerAlltime.innerHTML =
    giveawayConditions.minimumMatchesPlayerAlltime;
  minimumMatchesPlayer3weeks.innerHTML =
    giveawayConditions.minimumMatchesPlayer3weeks;
  minimuMatchesForAllPlayesr.innerHTML =
    giveawayConditions.minimuMatchesForAllPlayesr;
  const nextGiveawayDate = new Date(giveawayObject.giveawayDate);
  giveawayContainer.style.display = "block";

  matchPlayed.innerHTML = `Зіграно ${giveawayObject.matchesPlayed} із ${giveawayConditions.minimuMatchesForAllPlayesr} матчів`;
  const progress = Math.min(
    (giveawayObject.matchesPlayed /
      giveawayConditions.minimuMatchesForAllPlayesr) *
      100,
    100,
  );

  matchesProgress.style.width = `${progress}%`;

  const hue = Math.max(0, (progress - 67) * 3);
  matchesProgress.style.backgroundColor = `hsl(${hue}, 98%, 31%)`;
  giveaawayTable.style.display = "table";
  setTimeout(() => giveaawayTable.classList.add("activeContainer"), 10);
  setTimeout(() => giveawayContainer.classList.add("activeContainer"), 10);
  console.log(nextGiveawayDate);
  startGiveawayTimer(nextGiveawayDate);
  ShowPlayerGiveawayTable();
}

function startGiveawayTimer(nextGiveawayDate) {
  const formattedDate = nextGiveawayDate.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  console.log(formattedDate);
  giveawayDateText.innerHTML = `Дата розіграшу: ${formattedDate}`;

  clearInterval(giveawayTimerInterval);
  changeGiveawayTimer(nextGiveawayDate);
  giveawayTimerInterval = setInterval(() => {
    changeGiveawayTimer(nextGiveawayDate);
  }, 1000);
}

function changeGiveawayTimer(nextGiveawayDate) {
  const now = new Date();
  const difference = nextGiveawayDate - now;

  if (difference <= 0) {
    clearInterval(giveawayTimerInterval);
    giveawayTimer.innerHTML = "Розіграш вже почався!";
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  giveawayTimer.innerHTML = `${days} дн. ${hours} год. ${minutes} хв. ${seconds} сек.`;
}

function ShowPlayerGiveawayTable() {
  const giveawayObject = data.giveawayInfo[data.giveawayInfo.length - 1];
  const giveawayPlayersObj = giveawayObject.players;
  console.log(giveawayPlayersObj);
  const giveawayPlayersMas = Object.entries(giveawayPlayersObj)
    .map(([playerId, data]) => ({
      playerId,
      matchNumber: data.matchNumber,
      playerName: data.playerName,
      winChance: data.winChance,
    }))
    .sort((a, b) => {
      if (b.matchNumber !== a.matchNumber) {
        return b.matchNumber - a.matchNumber;
      }

      return a.playerName.localeCompare(b.playerName);
    });
  console.log(giveawayPlayersMas);
  bodyTable.innerHTML = "";
  giveawayPlayersMas.forEach((player) => {
    const allPlayerMatchesNumber =
      data.playersStat[player.playerId].matchNumber;

    const playerName = player.playerName;
    const playerTr = document.createElement("tr");
    bodyTable.append(playerTr);
    console.log(player.matchNumber);
    playerTr.innerHTML = `<td style="text-align: left">${playerName}</td>
    <td class="${player.matchNumber < giveawayConditions.minimumMatchesPlayer3weeks ? "redTd" : "greenTd"}">${player.matchNumber}</td>
    <td class="${allPlayerMatchesNumber < giveawayConditions.minimumMatchesPlayerAlltime ? "redTd" : "greenTd"}">${allPlayerMatchesNumber}</td>
     <td>${Math.round(player.winChance * 1000) / 10 || 0}%</td>

    

    
    `;
  });
}

function winChancePlayer() {
  const giveawayPlayers =
    data.giveawayInfo[data.giveawayInfo.length - 1].players;
  let allTickets = 0;
  for (let playerId in giveawayPlayers) {
    const playerMatchNumber = giveawayPlayers[playerId].matchNumber;
    const playerAllTimeMatchNumber = data.playersStat[playerId].matchNumber;

    if (
      playerMatchNumber >= giveawayConditions.minimumMatchesPlayer3weeks &&
      playerAllTimeMatchNumber > giveawayConditions.minimumMatchesPlayerAlltime
    ) {
      giveawayPlayers[playerId].tickets = Math.pow(
        giveawayPlayers[playerId].matchNumber,
        0.7,
      );
      allTickets += giveawayPlayers[playerId].tickets;
    }
  }
  data.giveawayInfo.allTickets = allTickets;

  console.log(data.giveawayInfo.allTickets);
  for (let playerId in giveawayPlayers) {
    giveawayPlayers[playerId].winChance =
      giveawayPlayers[playerId].tickets / data.giveawayInfo.allTickets;
    console.log(giveawayPlayers[playerId]);
  }
}

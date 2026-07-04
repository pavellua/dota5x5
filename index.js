import { GetData } from "./modules/dataStore.js";

import AddIndividPlayerInSelect from "./modules/htmlCss/addIndividPlayerInSelect.js";
import ShowAllGames from "./modules/htmlCss/showAllGames.js";
import ShowIndividuaHeroes from "./modules/htmlCss/showIndividualHeroes.js";
import ShowIndividualStats from "./modules/htmlCss/showIndiwidualStats.js";
import ShowPicksStatsTable from "./modules/htmlCss/showPicksStatsTable.js";
import ShowPlayerStatsTable from "./modules/htmlCss/showPlayerStatsTable.js";
import PlayerStats from "./modules/playersStats.js";

import TopPickedHeroes from "./modules/topPickedHeroes.js";

const picksStatsTable = document.getElementById("picksStatsTable");
const headPicksTable = picksStatsTable.querySelector("thead");
const allMatchesBtn = document.getElementById("allMatchesBtn");
const pickedBanedHeroesBtn = document.getElementById("pickedBanedHeroesBtn");
const playersBtn = document.getElementById("playersBtn");
const matchesStats = document.getElementById("matchesStats");

const winrateWithPlayersContainer =
  document.getElementById("winrateWithPlayers");
const selectIndividPlayerContainer = document.getElementById("selectPlayer");
const playerStatsTable = document.getElementById("playerStatsTable");
const individBtn = document.getElementById("individBtn");

const local = true;
let data;

const bg = document.getElementById("bg");
const img = new Image();
img.src = "./images/startLogo.jpg";
img.onload = () => {
  bg.style.opacity = "1";
  document.querySelector("body").style.opacity = "1";
};

const music = new Audio("./sounds/mainTheme.mp3");
music.preload = "auto";
music.load();
music.volume = 0.08;

document.addEventListener(
  "click",
  () => {
    music.play();
  },
  { once: true },
);

if (!local) {
  const dataRequest = await fetch("/api/matches");
  data = await dataRequest.json();
} else if (local) {
  data = await GetData();
}

let playerStats = PlayerStats(data);

let pickedHeroes = TopPickedHeroes(data);

console.log(playerStats);
AddIndividPlayerInSelect(playerStats);

allMatchesBtn.addEventListener("click", () => {
  hideActiveContainer();

  ShowAllGames(data);
});

pickedBanedHeroesBtn.addEventListener("click", () => {
  hideActiveContainer();
  ShowPicksStatsTable(pickedHeroes, data);
});

headPicksTable.addEventListener("click", (e) => {
  console.log(pickedHeroes);
  switch (e.target.dataset.sort) {
    case "bans":
      pickedHeroes = pickedHeroes.sort((a, b) => b.bans - a.bans);

      break;
    case "picks":
      pickedHeroes = pickedHeroes.sort((a, b) => b.picks - a.picks);

      break;
    case "wins":
      pickedHeroes = pickedHeroes.sort((a, b) => b.wins - a.wins);

      break;
    case "lose":
      pickedHeroes = pickedHeroes.sort((a, b) => b.lose - a.lose);

      break;
    case "winrate":
      pickedHeroes.sort((a, b) => {
        if (isNaN(a.winrate)) return 1;
        if (isNaN(b.winrate)) return -1;
        return b.winrate - a.winrate || b.picks - a.picks;
      });

      break;
  }
  ShowPicksStatsTable(pickedHeroes, data);
});
playersBtn.addEventListener("click", () => {
  hideActiveContainer();
  ShowPlayerStatsTable(playerStats, data);
});
individBtn.addEventListener("click", async () => {
  hideActiveContainer();
  ShowIndividualStats({ playerStats });
});

function hideActiveContainer() {
  const activeContainer = document.querySelector(".activeContainer");
  if (activeContainer) {
    activeContainer.style.display = "none";
    activeContainer.classList.remove("activeContainer");
  }
}

winrateWithPlayersContainer.addEventListener("click", (e) => {
  console.log(pickedHeroes);
  switch (e.target.dataset.sort) {
    case "bans":
      pickedHeroes = pickedHeroes.sort((a, b) => b.bans - a.bans);

      break;
    case "picks":
      pickedHeroes = pickedHeroes.sort((a, b) => b.picks - a.picks);

      break;
    case "wins":
      pickedHeroes = pickedHeroes.sort((a, b) => b.wins - a.wins);

      break;
    case "lose":
      pickedHeroes = pickedHeroes.sort((a, b) => b.lose - a.lose);

      break;
    case "winrate":
      pickedHeroes.sort((a, b) => {
        if (isNaN(a.winrate)) return 1;
        if (isNaN(b.winrate)) return -1;
        return b.winrate - a.winrate || b.picks - a.picks;
      });
    default:
      break;
  }
  if (e.target.dataset.sort) ShowPicksStatsTable(pickedHeroes, data);
});

selectIndividPlayerContainer.addEventListener("change", function () {
  const activeContainer = document.querySelector(".activeContainer");
  if (activeContainer) {
    console.log(activeContainer.id);
    switch (activeContainer.id) {
      case "matchesStats":
        ShowAllGames(data);
        break;
      case "picksStatsTable":
        ShowPicksStatsTable(pickedHeroes, data);
        break;
      case "individualStats":
        ShowIndividualStats({ playerStats, playerId: this.value });

        break;
    }
  }
  // console.log(this.value); // значення обраної опції
});

playerStatsTable.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-player-name")) {
    hideActiveContainer();
    const playerId = e.target.closest("tr").getAttribute("data-player-id");
    ShowIndividualStats({ playerStats, playerId });
  }
});
matchesStats.addEventListener("click", (e) => {
  const playerId = e.target.getAttribute("data-player-id");
  if (playerId) {
    hideActiveContainer();

    ShowIndividualStats({ playerStats, playerId });
  }
});

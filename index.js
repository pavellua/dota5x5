import { GetData } from "./modules/dataStore.js";
import ShowAllGames from "./modules/htmlCss/showAllGames.js";
import ShowPicksStatsTable from "./modules/htmlCss/showPicksStatsTable.js";
import ShowPlayerStatsTable from "./modules/htmlCss/showPlayerStatsTable.js";
import PlayerStats from "./modules/playersStats.js";

import TopPickedHeroes from "./modules/topPickedHeroes.js";

const picksStatsTable = document.getElementById("picksStatsTable");
const headPicksTable = picksStatsTable.querySelector("thead");
const allMatchesBtn = document.getElementById("allMatchesBtn");
const pickedBanedHeroesBtn = document.getElementById("pickedBanedHeroesBtn");
const playersBtn = document.getElementById("playersBtn");

const local = true;
let data;

const bg = document.getElementById("bg");
const img = new Image();
img.src = "./images/startLogo.jpg";
img.onload = () => {
  bg.style.opacity = "1";
  document.querySelector("body").style.opacity = "1";
};

if (!local) {
  const dataRequest = await fetch("/api/matches");
  data = await dataRequest.json();
} else if (local) {
  data = await GetData();
}

let playerStats = PlayerStats(data);
let pickedHeroes = TopPickedHeroes(data);

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

function hideActiveContainer() {
  const activeContainer = document.querySelector(".activeContainer");
  if (activeContainer) {
    activeContainer.style.display = "none";
    activeContainer.classList.remove("activeContainer");
  }
}

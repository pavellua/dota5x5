import { GetData } from "./modules/dataStore.js";
import ChooseWinner from "./modules/helpingModules/chooseWinner.js";

import AddIndividPlayerInSelect from "./modules/htmlCss/addIndividPlayerInSelect.js";
import ShowAllGames from "./modules/htmlCss/showAllGames.js";
import ShowMatchDetails from "./modules/htmlCss/showMatchDetails.js";
import ShowGiveawayInfo from "./modules/htmlCss/showGiveawayInfo.js";
import ShowHeroPickDetails from "./modules/htmlCss/showHeroPickDetails.js";
import ShowIndividuaHeroes from "./modules/htmlCss/showIndividualHeroes.js";
import ShowIndividualStats from "./modules/htmlCss/showIndiwidualStats.js";
import ShowPicksStatsTable from "./modules/htmlCss/showPicksStatsTable.js";
import ShowPlayerStatsTable from "./modules/htmlCss/showPlayerStatsTable.js";
import PlayerStats from "./modules/playersStats.js";

import TopPickedHeroes from "./modules/topPickedHeroes.js";
import EnableTableSorting from "./modules/helpingModules/enableTableSorting.js";

const picksStatsTable = document.getElementById("picksStatsTable");
const heroPickDetails = document.getElementById("heroPickDetails");
const allMatchesBtn = document.getElementById("allMatchesBtn");
const pickedBanedHeroesBtn = document.getElementById("pickedBanedHeroesBtn");
const playersBtn = document.getElementById("playersBtn");
const matchesStats = document.getElementById("matchesStats");
const matchDetails = document.getElementById("matchDetails");
const heroFilterContainer = document.getElementById("heroFilterContainer");
const heroFilter = document.getElementById("heroFilter");
const heroOptions = document.getElementById("heroOptions");
const playBtn = document.getElementById("playBtn");
const giveawayBtn = document.getElementById("giveawayBtn");
const chooseWinnerBtn = document.getElementById("chooseWinnerBtn");
const chooseWinnerContainer = document.getElementById("chooseWinnerContainer");

const playIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>`;
const pauseIcon = `<svg viewBox="0 0 24 24" fill="currentColor">
  <rect x="6" y="5" width="4" height="14"/>
  <rect x="14" y="5" width="4" height="14"/>
</svg>`;

const winrateWithPlayersContainer =
  document.getElementById("winrateWithPlayers");
const selectIndividPlayerContainer = document.getElementById("selectPlayer");
const playerSearchInput = document.getElementById("playerSearch");
const playerOptions = document.getElementById("playerOptions");
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
music.volume = 0.02;

document.addEventListener(
  "click",
  () => {
    playBtn.innerHTML = pauseIcon;
    playBtn.style.color = "red";
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

////////////////////////////////////////
// Отримування даних ТГ

let tg = null;
let message = "";
if (window.Telegram?.WebApp) {
  tg = window.Telegram.WebApp;

  tg.ready();
  message = "Запущено через Telegram";
  console.log("Запущено через Telegram");
  notifyAppOpened();
} else {
  message = "Запущено локально";
  console.log("Запущено локально");
}

async function notifyAppOpened() {
  if (!tg) {
    console.log("Telegram недоступний — локальний запуск");
    return;
  } else {
    const user = tg.initDataUnsafe?.user;

    console.log("Telegram user:", user);

    try {
      const response = await fetch(
        "https://unconsecrated-chronographically-mauricio.ngrok-free.dev/api/app-opened",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "app_opened",
            user: tg.initDataUnsafe?.user,
            initData: tg.initData,
            time: new Date().toISOString(),
          }),
        },
      );

      const result = await response.json();

      console.log("Сервер отримав запит:", result);
    } catch (error) {
      console.error("Помилка відправки запиту:", error);
    }
  }
}

////////////////////////////////////////

let playerStats = PlayerStats(data);

let pickedHeroes = TopPickedHeroes(data);
EnableTableSorting();

Object.values(data.heroesId)
  .map((hero) => hero.name)
  .sort((a, b) => a.localeCompare(b))
  .forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    heroOptions.append(option);
  });

console.log(playerStats);
AddIndividPlayerInSelect(playerStats);

allMatchesBtn.addEventListener("click", () => {
  heroFilterContainer.style.display = "block";
  playerSearchInput.style.display = "block";
  const activeBtn = document.querySelector(".nav").querySelector(".active");

  activeBtn ? activeBtn.classList.remove("active") : null;
  allMatchesBtn.classList.add("active");
  hideActiveContainer();

  ShowAllGames(data);
});

pickedBanedHeroesBtn.addEventListener("click", () => {
  heroFilterContainer.style.display = "block";
  playerSearchInput.style.display = "none";
  const activeBtn = document.querySelector(".nav").querySelector(".active");

  activeBtn ? activeBtn.classList.remove("active") : null;
  pickedBanedHeroesBtn.classList.add("active");
  hideActiveContainer();
  ShowPicksStatsTable(pickedHeroes, data);
});

picksStatsTable.addEventListener("click", (event) => {
  const heroRow = event.target.closest("tr[data-hero-id]");
  if (!heroRow) return;

  hideActiveContainer();
  heroFilterContainer.style.display = "none";
  ShowHeroPickDetails(heroRow.dataset.heroId, data);
});

heroPickDetails.addEventListener("click", (event) => {
  if (!event.target.closest('[data-action="back-to-picks"]')) return;

  hideActiveContainer();
  heroFilterContainer.style.display = "block";
  ShowPicksStatsTable(pickedHeroes, data);
});

playersBtn.addEventListener("click", () => {
  heroFilterContainer.style.display = "none";
  const activeBtn = document.querySelector(".nav").querySelector(".active");
  playerSearchInput.style.display = "none";
  activeBtn ? activeBtn.classList.remove("active") : null;
  playersBtn.classList.add("active");
  hideActiveContainer();
  ShowPlayerStatsTable(playerStats, data);
});
individBtn.addEventListener("click", async () => {
  heroFilterContainer.style.display = "none";
  playerSearchInput.style.display = "block";
  const activeBtn = document.querySelector(".nav").querySelector(".active");

  activeBtn ? activeBtn.classList.remove("active") : null;
  individBtn.classList.add("active");
  hideActiveContainer();
  ShowIndividualStats({ playerStats });
});

heroFilter.addEventListener("input", () => {
  if (matchesStats.classList.contains("activeContainer")) {
    ShowAllGames(data);
  } else if (picksStatsTable.classList.contains("activeContainer")) {
    ShowPicksStatsTable(pickedHeroes, data);
  }
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

function setPlayerSelection(playerId) {
  const option = [...selectIndividPlayerContainer.options].find(
    (candidate) => candidate.value === playerId,
  );
  selectIndividPlayerContainer.value = playerId || "";
  playerSearchInput.value = playerId ? option?.textContent || "" : "";
}

playerSearchInput.addEventListener("input", () => {
  const searchValue = playerSearchInput.value.trim().toLocaleLowerCase();
  const option = [...playerOptions.options].find(
    (candidate) => candidate.value.trim().toLocaleLowerCase() === searchValue,
  );
  const playerId = option?.dataset.playerId || "";
  if (selectIndividPlayerContainer.value === playerId) return;

  selectIndividPlayerContainer.value = playerId;
  selectIndividPlayerContainer.dispatchEvent(
    new Event("change", { bubbles: true }),
  );
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
  const playerName = e.target.closest("[data-player-name]");
  if (!playerName) return;

  const playerId = playerName.closest("tr")?.dataset.playerId;
  if (!playerId) return;

  setPlayerSelection(playerId);
  playerSearchInput.style.display = "block";
  document.querySelector(".nav .active")?.classList.remove("active");
  individBtn.classList.add("active");
  hideActiveContainer();
  ShowIndividualStats({ playerStats, playerId });
});
matchesStats.addEventListener("click", (e) => {
  if (e.target.closest(".winnerContainer, .streamUrl")) return;

  const playerName = e.target.closest(".playerName");
  const playerId = playerName?.dataset.playerId;
  if (playerId) {
    hideActiveContainer();
    setPlayerSelection(playerId);
    ShowIndividualStats({ playerStats, playerId });
    return;
  }

  const matchContainer = e.target.closest(".matchContainer");
  if (!matchContainer) return;
  const match = data.matches.find(
    (item) =>
      item.replay_file.replace(/\.dem$/i, "") ===
      matchContainer.dataset.matchId,
  );
  if (!match) return;

  hideActiveContainer();
  heroFilterContainer.style.display = "none";
  playerSearchInput.style.display = "none";
  ShowMatchDetails(match, data.heroesId);
});

matchDetails.addEventListener("click", (e) => {
  if (!e.target.closest('[data-action="back-to-matches"]')) return;
  hideActiveContainer();
  heroFilterContainer.style.display = "block";
  playerSearchInput.style.display = "block";
  ShowAllGames(data);
});

playBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play();
    playBtn.innerHTML = pauseIcon;
    playBtn.style.color = "red";
  } else {
    music.pause();
    playBtn.innerHTML = playIcon;
    playBtn.style.color = "green";
  }
});

giveawayBtn.addEventListener("click", async () => {
  heroFilterContainer.style.display = "none";
  const activeBtn = document.querySelector(".nav").querySelector(".active");
  playerSearchInput.style.display = "none";
  activeBtn ? activeBtn.classList.remove("active") : null;
  giveawayBtn.classList.add("active");
  hideActiveContainer();
  await ShowGiveawayInfo(data);
});

chooseWinnerBtn.addEventListener("click", () => {
  const winner = ChooseWinner(data);
  console.log(winner);

  chooseWinnerContainer.querySelector("span").innerHTML = winner.playerName;
});

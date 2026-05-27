import { GetData } from "./modules/dataStore.js";
import ShowAllGames from "./modules/htmlCss/showAllGames.js";
import ShowPicksStatsTable from "./modules/htmlCss/showPicksStatsTable.js";
import ShowPlayerStatsTable from "./modules/htmlCss/showPlayerStatsTable.js";
import PlayerStats from "./modules/playersStats.js";
import TopBanedHeroes from "./modules/topBanedHeroes.js";
import TopPickedHeroes from "./modules/topPickedHeroes.js";

const picksStatsTable = document.getElementById("picksStatsTable");
const headPicksTable = picksStatsTable.querySelector("thead");
const allMatchesBtn = document.getElementById("allMatchesBtn");

const local = true;
let data;
if (!local) {
  const dataRequest = await fetch("/api/matches");
  data = await dataRequest.json();
} else if (local) {
  data = await GetData();
}

let playerStats = PlayerStats(data);
let pickedHeroes = TopPickedHeroes(data);
let topBanedHeroes = TopBanedHeroes(data);

// ShowPlayerStatsTable(playerStats, data);
// ShowPicksStatsTable(pickedHeroes, data);

allMatchesBtn.addEventListener("click", () => {
  ShowAllGames(data);
});

headPicksTable.addEventListener("click", (e) => {
  switch (e.target.dataset.sort) {
    case "bans":
      pickedHeroes = pickedHeroes.sort((a, b) => b.bans - a.bans);
      ShowPicksStatsTable(pickedHeroes, resJson);
      break;
    case "picks":
      pickedHeroes = pickedHeroes.sort((a, b) => b.picks - a.picks);
      ShowPicksStatsTable(pickedHeroes, resJson);
      break;
    case "winrate":
      console.log(pickedHeroes);
      pickedHeroes.sort((a, b) => {
        if (isNaN(a.winrate)) return 1;
        if (isNaN(b.winrate)) return -1;
        return b.winrate - a.winrate || b.picks - a.picks;
      });
      ShowPicksStatsTable(pickedHeroes, resJson);
      break;
  }
});

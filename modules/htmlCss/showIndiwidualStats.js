import { GetData } from "../dataStore.js";
import ShowIndividuaHeroes from "./showIndividualHeroes.js";
import ShowPlayerRoles from "./showPlayerRoles.js";
import ShowTeammates from "./showTeammates.js";

const individualStatsContainer = document.getElementById("individualStats");

const selectIndividPlayerContainer = document.getElementById("selectPlayer");

const rolesPlayerBtn = document.getElementById("rolesPlayerBtn");
const teammatesBtn = document.getElementById("teammatesBtn");
const individualHeroesBtn = document.getElementById("individualHeroesBtn");

let playerStats, playerId, selectIdPlayer, data;
let sortParam = "winrate";

teammatesBtn.addEventListener("click", () => {
  ShowTeammates(playerStats, sortParam);
});

individualHeroesBtn.addEventListener("click", () => {
  ShowIndividuaHeroes(playerStats, selectIndividPlayerContainer.value, data);
});
rolesPlayerBtn.addEventListener("click", () => {
  ShowPlayerRoles(playerStats, selectIndividPlayerContainer.value, data);
});

export default async function ShowIndividualStats(params) {
  playerStats = params.playerStats;
  playerId = params.playerId;
  sortParam = params.sortParam;
  selectIdPlayer = selectIndividPlayerContainer.value;

  individualStatsContainer.style.display = "block";
  data = await GetData();
  setTimeout(
    () => individualStatsContainer.classList.add("activeContainer"),
    10,
  );
  if (!playerId && selectIdPlayer) playerId = selectIdPlayer;
  if (playerId) {
    const activeIndividContainer = document.querySelector(
      ".activeIndividContainer",
    );
    const activeIndividContainerId = activeIndividContainer.id;
    console.log(activeIndividContainerId);
    switch (activeIndividContainerId) {
      case "playerHeroes":
        ShowIndividuaHeroes(
          playerStats,
          selectIndividPlayerContainer.value,
          data,
        );
        break;
      case "winrateWithPlayers":
        ShowTeammates(playerStats, sortParam);
        break;
      case "playerRolesContainer":
        ShowPlayerRoles(playerStats, selectIndividPlayerContainer.value, data);
        break;
    }
  }
}

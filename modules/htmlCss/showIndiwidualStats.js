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
  if (selectIndividPlayerContainer.value != "") {
    ShowTeammates(playerStats, sortParam);
  }
});

individualHeroesBtn.addEventListener("click", () => {
  if (selectIndividPlayerContainer.value != "") {
    ShowIndividuaHeroes(playerStats, selectIndividPlayerContainer.value, data);
  }
});
rolesPlayerBtn.addEventListener("click", () => {
  if (selectIndividPlayerContainer.value != "") {
    ShowPlayerRoles(playerStats, selectIndividPlayerContainer.value, data);
  }
});

export default async function ShowIndividualStats(params) {
  console.log(2);
  playerStats = params.playerStats;
  playerId = params.playerId;
  sortParam = params.sortParam;
  selectIdPlayer = selectIndividPlayerContainer.value;

  data = await GetData();
  setTimeout(
    () => individualStatsContainer.classList.add("activeContainer"),
    10,
  );
  if (!playerId && selectIdPlayer) playerId = selectIdPlayer;
  if (playerId) {
    individualStatsContainer.style.display = "block";
    let activeIndividContainer = document.querySelector(
      ".activeIndividContainer",
    );
    if (!activeIndividContainer) {
      const winrateWithPlayersContainer =
        document.getElementById("winrateWithPlayers");
      winrateWithPlayersContainer.classList.add("activeIndividContainer");
      activeIndividContainer = winrateWithPlayersContainer;
    }

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
        console.log(1);
        ShowTeammates(playerStats, sortParam);
        break;
      case "playerRolesContainer":
        ShowPlayerRoles(playerStats, selectIndividPlayerContainer.value, data);
        break;
    }
  }
}

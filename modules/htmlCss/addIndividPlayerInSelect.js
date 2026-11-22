export default function AddIndividPlayerInSelect(playerStats) {
  const selectIndividPlayerContainer = document.getElementById("selectPlayer");
  const playerOptions = document.getElementById("playerOptions");
  console.log(playerStats);

  const playersMas = Object.entries(playerStats)
    .map(([playerId, data]) => ({
      playerId,
      playerName: data.name,
    }))
    .filter(
      (player) =>
        String(player.playerName || "").trim().toLocaleLowerCase() !==
        "невідомо",
    )
    .sort((a, b) => a.playerName.localeCompare(b.playerName));

  for (const player of playersMas) {
    const option = document.createElement("option");
    option.value = player.playerId;
    option.innerText = player.playerName;
    selectIndividPlayerContainer.append(option);

    const searchOption = document.createElement("option");
    searchOption.value = player.playerName;
    searchOption.dataset.playerId = player.playerId;
    playerOptions.append(searchOption);
  }
  selectIndividPlayerContainer.value = "";
  console.log(selectIndividPlayerContainer.options[0]);
}

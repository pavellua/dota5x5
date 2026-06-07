const allPlayersContainer = document.getElementById("allPlayersContainer");

export default function RenderAllPlayers(playersData) {
  for (let playerId in playersData) {
    const playerContainer = document.createElement("div");

    allPlayersContainer.append(playerContainer);
    playerContainer.innerHTML = `<label>
  <input type="checkbox" name="player" value="${playerId}">
    <span>${playersData[playerId].name}</span>
    <span>${playersData[playerId].winrate}</span>
</label>`;
  }
}

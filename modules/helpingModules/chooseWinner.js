function ChooseWinner(data) {
  const players = data.giveawayInfo[data.giveawayInfo.length - 1].players;

  const playersMas = Object.entries(players)
    .map(([playerId, playerData]) => ({
      playerId,
      tickets: Number(playerData.tickets),
      playerName: playerData.playerName,
    }))
    .filter((player) => player.tickets > 0);

  if (playersMas.length === 0) {
    return null;
  }

  const totalTickets = playersMas.reduce(
    (sum, player) => sum + player.tickets,
    0,
  );

  if (totalTickets <= 0) {
    return null;
  }

  let random = Math.random() * totalTickets;

  for (const player of playersMas) {
    random -= player.tickets;

    if (random < 0) {
      return player;
    }
  }

  return playersMas[playersMas.length - 1];
}

export default ChooseWinner;

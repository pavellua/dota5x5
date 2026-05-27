function PlayerStats(resJson) {
  let playersStat = {};
  const matches = resJson.matches;
  const heroesId = resJson.heroesId;

  matches.forEach((game) => {
    game.players.forEach((player) => {
      const id = player.accountid;
      if (!playersStat[id]) {
        playersStat[id] = { name: player.name, wins: 0, losses: 0, heroes: {} };
      }

      const won = player.team === game.winner;
      if (won) playersStat[id].wins++;
      else playersStat[id].losses++;

      const heroId = player.hero;
      if (!playersStat[id].heroes[heroId]) {
        playersStat[id].heroes[heroId] = { picks: 0, wins: 0, losses: 0 };
      }
      playersStat[id].heroes[heroId].picks++;
      if (won) playersStat[id].heroes[heroId].wins++;
      else playersStat[id].heroes[heroId].losses++;
    });
  });

  // Додаємо winrate після підрахунку
  Object.values(playersStat).forEach((player) => {
    const total = player.wins + player.losses;
    player.winrate = total > 0 ? Math.round(player.wins / total) : 0;
  });

  return playersStat;
}

export default PlayerStats;

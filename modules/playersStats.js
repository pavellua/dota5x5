import SortTeammates from "./helpingModules/sortTeammates.js";

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
      teamMates(player, game, playersStat);
    });
  });

  // Додаємо winrate після підрахунку
  Object.entries(playersStat).forEach(([playerId, player]) => {
    const total = player.wins + player.losses;
    player.winrate = total > 0 ? Math.round(player.wins / total) : 0;

    for (const [id, stats] of Object.entries(player.teamMates)) {
      stats.winrate =
        stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0;
    }
    for (const [id, stats] of Object.entries(player.opponents)) {
      stats.winrate =
        stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0;
    }
  });

  return playersStat;
}

export default PlayerStats;

function teamMates(player, game, playersStat) {
  const id = player.accountid;
  const won = player.team === game.winner;

  const playerSide = player.team;
  if (!playersStat[id].teamMates) {
    playersStat[id].teamMates = {};
  }
  if (!playersStat[id].opponents) {
    playersStat[id].opponents = {};
  }

  game.players.forEach((player) => {
    const teamMateId = player.accountid;

    if (playerSide == player.team) {
      if (!playersStat[id].teamMates[teamMateId] && teamMateId != id) {
        playersStat[id].teamMates[teamMateId] = { count: 1, wins: 0, lose: 0 };
      } else if (playersStat[id].teamMates[teamMateId]) {
        playersStat[id].teamMates[teamMateId].count++;
      }
      if (playersStat[id].teamMates[teamMateId]) {
        won
          ? playersStat[id].teamMates[teamMateId].wins++
          : playersStat[id].teamMates[teamMateId].lose++;
      }
    } else {
      if (!playersStat[id].opponents[teamMateId] && teamMateId != id) {
        playersStat[id].opponents[teamMateId] = { count: 1, wins: 0, lose: 0 };
      } else if (playersStat[id].opponents[teamMateId]) {
        playersStat[id].opponents[teamMateId].count++;
      }
      if (playersStat[id].opponents[teamMateId]) {
        won
          ? playersStat[id].opponents[teamMateId].wins++
          : playersStat[id].opponents[teamMateId].lose++;
      }
    }
  });
}

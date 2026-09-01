import SortTeammates from "./helpingModules/sortTeammates.js";

function PlayerStats(resJson) {
  let playersStat = {};
  const matches = resJson.matches;
  const heroesId = resJson.heroesId;

  matches.forEach((game) => {
    console.log(game);
    let teamsRating = {
      Radiant: 0,
      Dire: 0,
    };
    game.players.forEach((player) => {
      const id = player.accountid;
      if (!playersStat[id]) {
        playersStat[id] = {
          name: player.name,
          wins: 0,
          losses: 0,
          heroes: {},
          rating: 1500,
          matchNumber: 0,
        };
      }

      if (player.team === "Radiant") {
        teamsRating.Radiant += playersStat[id].rating;
      } else {
        teamsRating.Dire += playersStat[id].rating;
      }

      const won = player.team === game.winner;
      if (won) playersStat[id].wins++;
      else playersStat[id].losses++;
      playersStat[id].matchNumber++;

      const heroId = player.hero;
      if (!playersStat[id].heroes[heroId]) {
        playersStat[id].heroes[heroId] = { picks: 0, wins: 0, losses: 0 };
      }
      playersStat[id].heroes[heroId].picks++;
      if (won) playersStat[id].heroes[heroId].wins++;
      else playersStat[id].heroes[heroId].losses++;
      teamMates(player, game, playersStat);
    });
    game.teamsRating = teamsRating;

    game.players.forEach((player) => {
      const id = player.accountid;
      const won = player.team === game.winner;
      player.changeRating = getCurrentRating(
        won,
        playersStat[id].matchNumber,
        teamsRating,
        player.team,
      );

      playersStat[id].rating += player.changeRating;
      player.rating = playersStat[id].rating;
    });
  });

  // Додаємо winrate після підрахунку
  Object.entries(playersStat).forEach(([playerId, player]) => {
    const total = player.wins + player.losses;
    player.winrate =
      total > 0 ? Math.round((player.wins / total) * 100) / 100 : 0;

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

function getCurrentRating(won, matchNumber, teamsRating, playerTeam) {
  let kFactor;

  let expectedScore;
  const radiantRating = teamsRating.Radiant / 5;
  const direRating = teamsRating.Dire / 5;

  if (playerTeam === "Radiant") {
    expectedScore = 1 / (1 + Math.pow(10, (direRating - radiantRating) / 400));
  } else {
    expectedScore = 1 / (1 + Math.pow(10, (radiantRating - direRating) / 400));
  }

  const actualScore = won ? 1 : 0;

  if (matchNumber < 10) kFactor = 60;
  else if (matchNumber < 25) kFactor = 50;
  else kFactor = 45;

  return Math.round(kFactor * (actualScore - expectedScore));
}

import SortTeammates from "./helpingModules/sortTeammates.js";
let matchCounter;
function PlayerStats(resJson) {
  let playersStat = {};
  const matches = resJson.matches;
  const heroesId = resJson.heroesId;
  const playerIdByAccountId = new Map();
  const playerNamesById = new Map();
  (resJson.players || []).forEach((player) => {
    const ids = (Array.isArray(player.ids) ? player.ids : [player.id])
      .flatMap((id) => String(id ?? "").split(/[，,]/))
      .filter((id) => id !== undefined && id !== null)
      .map((id) => id.trim())
      .filter(Boolean);
    const playerId = ids[0];
    if (!playerId) return;
    playerNamesById.set(playerId, player.name);
    ids.forEach((id) => playerIdByAccountId.set(id, playerId));
  });
  let latestGiveawayObject = addNextGiveaway(resJson);
  const nextGiveawayDate = latestGiveawayObject.giveawayDate;
  const startCalculatingDate = new Date(nextGiveawayDate);
  startCalculatingDate.setDate(startCalculatingDate.getDate() - 21);
  matchCounter = 0;
  console.log(resJson);
  matches.forEach((game) => {
    let matchDate = game.date;
    matchDate = new Date(matchDate);
    matchDate.setHours(matchDate.getHours() - 3);
    calculateMatchesForGiveaway(
      latestGiveawayObject,
      matchDate,
      startCalculatingDate,
      nextGiveawayDate,
    );

    game.players.forEach((player) => {
      player.statsId = playerIdByAccountId.get(String(player.accountid)) || String(player.accountid);
    });

    let teamsRating = {
      Radiant: 0,
      Dire: 0,
    };
    game.players.forEach((player) => {
      const id = playerIdByAccountId.get(String(player.accountid)) || String(player.accountid);
      player.statsId = id;
      if (!playersStat[id]) {
        playersStat[id] = {
          name: playerNamesById.get(id) || player.name,
          ids: [...((resJson.players || []).find((entry) => String((entry.ids || [entry.id])[0]) === id)?.ids || [id])],
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
      roles(player, game, playersStat);
    });
    game.teamsRating = teamsRating;

    game.players.forEach((player) => {
      calculateMatchPlayerForGiveaway(
        latestGiveawayObject,
        player,
        startCalculatingDate,
        nextGiveawayDate,
        matchDate,
      );
      const id = player.statsId;
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
  resJson.playersStat = playersStat;
  return playersStat;
}

export default PlayerStats;

function teamMates(player, game, playersStat) {
  const id = player.statsId;
  const won = player.team === game.winner;

  const playerSide = player.team;
  if (!playersStat[id].teamMates) {
    playersStat[id].teamMates = {};
  }
  if (!playersStat[id].opponents) {
    playersStat[id].opponents = {};
  }

  game.players.forEach((player) => {
    const teamMateId = player.statsId;

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

function roles(player, game, playersStat) {
  const id = player.statsId;
  const won = player.team === game.winner;

  if (!playersStat[id].roles) {
    playersStat[id].roles = {};
  }
  if (!playersStat[id].roles[player.role]) {
    playersStat[id].roles[player.role] = { wins: 0, lose: 0 };
  }

  won
    ? playersStat[id].roles[player.role].wins++
    : playersStat[id].roles[player.role].lose++;
}

function calculateMatchesForGiveaway(
  latestGiveawayObject,
  matchDate,
  startCalculatingDate,
  nextGiveawayDate,
) {
  if (
    matchDate > startCalculatingDate &&
    matchDate < new Date(nextGiveawayDate)
  ) {
    matchCounter++;
  }

  latestGiveawayObject.matchesPlayed = matchCounter;
}

function addNextGiveaway(data) {
  const giveawayInfo = data.giveawayInfo;
  console.log(giveawayInfo);
  let latestGiveawayObject = giveawayInfo.reduce((max, item) => {
    return new Date(item.giveawayDate) > new Date(max.giveawayDate)
      ? item
      : max;
  });
  let lastGiveawayDate = latestGiveawayObject.giveawayDate;
  console.log(lastGiveawayDate);
  const currentDate = new Date();

  const nextGiveawayDate = new Date(lastGiveawayDate);

  while (nextGiveawayDate < currentDate) {
    nextGiveawayDate.setDate(nextGiveawayDate.getDate() + 21);

    if (nextGiveawayDate >= currentDate) {
      latestGiveawayObject = {
        giveawayDate: nextGiveawayDate.toISOString(),
      };
      giveawayInfo.push(latestGiveawayObject);
    }
  }

  return latestGiveawayObject;
}

function calculateMatchPlayerForGiveaway(
  latestGiveawayObject,
  player,
  startCalculatingDate,
  nextGiveawayDate,
  matchDate,
) {
  if (
    matchDate > startCalculatingDate &&
    matchDate < new Date(nextGiveawayDate)
  ) {
    if (!latestGiveawayObject.players) {
      latestGiveawayObject.players = {};
    }
    const playerId = player.statsId || String(player.accountid);
    if (!latestGiveawayObject.players[playerId]) {
      latestGiveawayObject.players[playerId] = {
        playerName: player.name,
        matchNumber: 0,
      };
    }

    latestGiveawayObject.players[playerId].matchNumber++;
  }
}

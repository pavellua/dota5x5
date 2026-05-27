function TopPickedHeroes(resJson) {
  const matches = resJson.matches;
  const heroesId = resJson.heroesId;
  const pickCount = {};
  console.log(resJson);
  matches.forEach((match) => {
    const winnerSide = match.winner;
    match.players.forEach((player) => {
      const heroSide = player.team;
      const id = player.hero;
      if (!pickCount[id])
        pickCount[id] = { count: 0, players: [], wins: 0, lose: 0, bans: 0 };

      if (winnerSide == heroSide) pickCount[id].wins++;
      else pickCount[id].lose++;
      pickCount[id].count++;

      // Додаємо гравця якщо ще не є в списку
      if (!pickCount[id].players.includes(player.name)) {
        pickCount[id].players.push(player.name);
      }
    });

    for (let teamSide in match.bans) {
      const teamBans = match.bans[teamSide];
      teamBans.forEach((heroId) => {
        if (!pickCount[heroId])
          pickCount[heroId] = {
            count: 0,
            players: [],
            wins: 0,
            lose: 0,
            bans: 0,
          };

        pickCount[heroId].bans++;
      });
    }
  });

  return Object.entries(pickCount)
    .map(([id, data]) => ({
      hero_id: Number(id),
      hero_name: heroesId[id],
      picks: data.count,
      players: data.players,
      wins: data.wins,
      lose: data.lose,
      bans: data.bans,
      winrate: Math.round((data.wins / data.count) * 100),
    }))
    .sort((a, b) => b.picks - a.picks);
}

export default TopPickedHeroes;

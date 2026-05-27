function TopBanedHeroes(resJson) {
  const matches = resJson.matches;
  const heroesId = resJson.heroesId;
  const banCount = {};

  matches.forEach((match) => {
    const allBans = [...match.bans.dire, ...match.bans.radiant];
    allBans.forEach((id) => {
      if (!banCount[id]) banCount[id] = 0;
      banCount[id]++;
    });
  });

  return Object.entries(banCount)
    .map(([id, count]) => ({
      hero_id: Number(id),

      bans: count,
    }))
    .sort((a, b) => b.bans - a.bans);
}

export default TopBanedHeroes;

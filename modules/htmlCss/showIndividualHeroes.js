const playerHeroesContainer = document.getElementById("playerHeroes");
const playerHeroesTable = playerHeroesContainer.querySelector("table");
const tableBody = playerHeroesTable.querySelector("tbody");
export default function ShowIndividuaHeroes(playerStats, playerId, data) {
  const playerHeroes = playerStats[playerId].heroes;
  const heroesId = data.heroesId;
  tableBody.innerHTML = "";

  const playerHeroesMas = Object.entries(playerHeroes)
    .map(([heroId, data]) => ({
      hero_id: heroId,
      hero_name: heroesId[heroId],
      picks: data.picks,

      wins: data.wins,
      losses: data.losses,

      winrate: Math.round((data.wins / data.picks) * 100),
    }))
    .sort((a, b) => b.picks - a.picks);

  for (let heroStat of playerHeroesMas) {
    console.log(heroStat);
    const heroId = heroStat.hero_id;
    const heroName = heroStat.hero_name.name;
    const picksNumber = heroStat.picks;
    const winsNumber = heroStat.wins;
    const lossesNumber = heroStat.losses;
    const winrate = heroStat.winrate;
    const imgSrc = heroesId[heroId].npcName.replace("npc_dota_hero_", "");

    const heroTr = document.createElement("tr");
    tableBody.append(heroTr);
    heroTr.innerHTML = `
      <td><img 
            src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/${imgSrc}.png"
            alt="${heroId}"
            )"
          /></td>
    <td>${heroName}</td>
    <td>${winsNumber}</td>
     <td>${lossesNumber}</td>
      <td>${picksNumber}</td>
       <td class="winrate">${winrate}%</td>
     
`;
    console.log(heroStat);
  }
}

const playerStatsTable = document.getElementById("picksStatsTable");
const bodyTable = playerStatsTable.querySelector("tbody");
const heroFilter = document.getElementById("heroFilter");

export default function ShowPicksStatsTable(pickedHeroes, resJson) {
  bodyTable.innerHTML = "";

  playerStatsTable.style.display = "table";
  setTimeout(() => playerStatsTable.classList.add("activeContainer"), 10);
  const heroesId = resJson.heroesId;

  const heroQuery = heroFilter.value.trim().toLocaleLowerCase();
  pickedHeroes
    .filter((hero) =>
      hero.hero_name.name.toLocaleLowerCase().includes(heroQuery),
    )
    .forEach((hero) => {
    const tr = document.createElement("tr");
    const heroId = hero.hero_id;
    tr.dataset.heroId = heroId;
    const heroName = hero.hero_name.name;
    const pickNumber = hero.picks;
    const wins = hero.wins;
    const lose = hero.lose;
    const bansNumber = hero.bans;
    const winrate = hero.winrate;

    const imgSrc = heroesId[heroId].npcName.replace("npc_dota_hero_", "");

    tr.innerHTML = `
    <td><img 
            src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/${imgSrc}.png"
            alt="${heroId}"
            )"
          /></td>

<td>${heroName}</td>
<td>${bansNumber}</td>
<td class="greenTd">${wins}</td>
<td class="redTd">${lose}</td>
<td>${pickNumber}</td>

<td class="winrate">${isNaN(winrate) ? "—" : winrate + "%"}</td>







`;
    bodyTable.append(tr);
  });
}

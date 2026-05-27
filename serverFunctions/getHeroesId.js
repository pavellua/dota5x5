let heroesId = null;
async function GetHeroesId() {
  if (heroesId == null) {
    const heroesResp = await fetch("https://api.opendota.com/api/heroes");
    const heroes = await heroesResp.json();

    heroesId = Object.fromEntries(
      heroes.map((h) => [h.id, { name: h.localized_name, npcName: h.name }]),
    );
  }

  return heroesId;
}

module.exports = { GetHeroesId };

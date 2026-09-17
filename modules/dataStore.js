let data = null;

// Одна функція яка повертає ВСЕ
export async function GetData() {
  if (data == null) {
    const matchesResp = await fetch("./matches.json");
    const matches = await matchesResp.json();
    const heroesResp = await fetch("./data/heroes.json");
    const heroes = await heroesResp.json();
    const giveawayInfoResp = await fetch("./data/giveawayInfo.json");
    const giveawayInfo = await giveawayInfoResp.json();
    const heroesId = Object.fromEntries(
      heroes.map((h) => [h.id, { name: h.localized_name, npcName: h.name }]),
    );
    data = {
      matches,
      heroesId,
      giveawayInfo,
    };
  }

  return data;
}

let data = null;

// Одна функція яка повертає ВСЕ
export async function GetData() {
  if (data == null) {
    const matchesResp = await fetch("../../matches.json");
    const matches = await matchesResp.json();
    const heroesResp = await fetch("https://api.opendota.com/api/heroes");
    const heroes = await heroesResp.json();
    const heroesId = Object.fromEntries(
      heroes.map((h) => [h.id, { name: h.localized_name, npcName: h.name }]),
    );
    data = {
      matches: matches,
      heroesId: heroesId,
    };
  }

  return data;
}

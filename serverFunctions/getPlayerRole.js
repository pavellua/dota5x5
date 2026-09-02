function GetPlayerRole(playerLines) {
  const result = {};

  // Групуємо гравців по команді та лінії
  const groups = {};

  Object.entries(playerLines).forEach(([slot, player]) => {
    const team = Number(slot) < 5 ? "Radiant" : "Dire";

    const key = `${team}_${player.lane}`;

    groups[key] ??= [];
    groups[key].push({
      slot: Number(slot),
      ...player,
    });
  });

  // Визначаємо позицію кожного гравця
  Object.entries(groups).forEach(([key, players]) => {
    const lane = players[0].lane;

    // Mid → позиція 2
    if (lane === "mid") {
      players.forEach((player) => {
        result[player.slot] = 2;
      });

      return;
    }

    // Safelane
    if (lane === "safelane") {
      const sorted = [...players].sort((a, b) => b.lastHits - a.lastHits);

      if (sorted[0]) {
        result[sorted[0].slot] = 1;
      }

      if (sorted[1]) {
        result[sorted[1].slot] = 5;
      }

      return;
    }

    // Offlane
    if (lane === "offlane") {
      const sorted = [...players].sort((a, b) => b.lastHits - a.lastHits);

      if (sorted[0]) {
        result[sorted[0].slot] = 3;
      }

      if (sorted[1]) {
        result[sorted[1].slot] = 4;
      }
    }
  });

  return result;
}

module.exports = { GetPlayerRole };

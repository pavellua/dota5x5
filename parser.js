const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function parseReplay(filePath) {
  const form = new FormData();
  form.append("replay", fs.createReadStream(filePath));

  const { data } = await axios.post("http://localhost:5600", form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return data;
}

function extractSummary(data, fileName) {
  const duration = Math.floor(data.match.game_time / 60);
  const winner = data.match.radiant_win ? "Radiant" : "Dire";

  const players = data.players.map((p) => ({
    name: p.name || p.steamid || `Player ${p.player_slot}`,
    hero: p.hero_name?.replace("npc_dota_hero_", "") || "?",
    team: p.player_slot < 128 ? "Radiant" : "Dire",
    kills: p.kills,
    deaths: p.deaths,
    assists: p.assists,
    gpm: p.gold_per_min,
    xpm: p.xp_per_min,
    won: p.player_slot < 128 === data.match.radiant_win,
  }));

  return { fileName, duration, winner, players };
}

module.exports = { parseReplay, extractSummary };

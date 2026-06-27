const { GetHeroesId } = require("./getHeroesId");

async function GetMatchInfo(replay) {
  const parserResponse = await fetch("http://localhost:5600", {
    method: "POST",
    body: replay,
  });

  console.log("Status:", parserResponse.status);

  const text = await parserResponse.text();

  console.log("Довжина відповіді:", text.length);

  const events = text
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.log("Поганий рядок:", line);
        return null;
      }
    })
    .filter(Boolean);

  const wardEvents = events.filter(
    (e) =>
      e.type === "CHAT_MESSAGE_OBSERVER_WARD_KILLED" ||
      e.type === "CHAT_MESSAGE_SENTRY_WARD_KILLED",
  );
  console.log(JSON.stringify(wardEvents, null, 2));

  const knownPlayers = require("../players.json");

  const heroBySlot = {};
  const stacksBySlot = {};
  const players = [];
  const bans = {
    dire: [],
    radiant: [],
  };
  const buildings = [];
  let lastInterval = null;
  let matchDate = null;
  let teamBanId;

  events.forEach((e) => {
    // Герої
    if (
      e.slot !== undefined &&
      !heroBySlot[e.slot] &&
      e.type === "interval" &&
      e.unit
    ) {
      heroBySlot[e.slot] = e.hero_id;
    }

    if (e.type === "draft_timings") {
      !teamBanId ? (teamBanId = e.draft_active_team) : null;

      if (e.pick === false) {
        if (teamBanId == 3) {
          bans.dire.push(e.hero_id);
        } else if (teamBanId == 2) {
          bans.radiant.push(e.hero_id);
        }
      }

      teamBanId = e.draft_active_team;
    }
    //Час початку гри
    if (e.type === "game_start_time") {
      matchDate = e.game_start_time;
    }
    //Стаки кріпів
    if (e.type === "interval" && e.slot !== undefined) {
      stacksBySlot[e.slot] = {
        creeps_stacked: e.creeps_stacked || 0,
        camps_stacked: e.camps_stacked || 0,
      };
    }
    //Поставлені варди
    if (e.type === "interval" && e.slot !== undefined) {
      stacksBySlot[e.slot] = {
        creeps_stacked: e.creeps_stacked || 0,
        camps_stacked: e.camps_stacked || 0,
        obs_placed: e.obs_placed || 0,
        sen_placed: e.sen_placed || 0,
      };
    }

    // Гравці
    if (e.type === "player_slot") {
      players.push(e);
    }

    // Будівлі
    if (e.type === "DOTA_COMBATLOG_TEAM_BUILDING_KILL") {
      buildings.push(e);
    }

    // Тривалість
    if (e.type === "interval") {
      lastInterval = e;
    }
  });

  // Після циклу формуємо результат
  const duration = lastInterval ? lastInterval.time : 0;
  const lastBuilding = buildings[buildings.length - 1];

  const matchData = {
    bans,
    duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`,
    winner:
      lastBuilding.targetname === "npc_dota_goodguys_fort" ? "Dire" : "Radiant",
    players: players.map((p) => ({
      slot: p.key,
      team: p.value < 128 ? "Radiant" : "Dire",
      accountid: p.accountid,
      name: knownPlayers[String(p.accountid)] || "Невідомо",
      hero: heroBySlot[p.key] || "Невідомо",
      creeps_stacked: stacksBySlot[p.key]?.creeps_stacked || 0,
      camps_stacked: stacksBySlot[p.key]?.camps_stacked || 0,
      obs_placed: stacksBySlot[p.key]?.obs_placed || 0,
      sen_placed: stacksBySlot[p.key]?.sen_placed || 0,
    })),
  };

  return matchData;
}

module.exports = { GetMatchInfo };

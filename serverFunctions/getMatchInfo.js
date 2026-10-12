const { GetHeroesId } = require("./getHeroesId");
const { GetPlayerLineLasthit } = require("./getPlayerLineLasthit");
const { GetPlayerRole } = require("./getPlayerRole");

async function GetMatchInfo(replay, options = {}) {
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
  const heroes = require("../data/heroes.json");
  const heroesById = Object.fromEntries(heroes.map((hero) => [hero.id, hero]));

  const heroBySlot = {};
  const stacksBySlot = {};
  const playersCoordinates = {};
  const playersAt5Min = {};
  const playerStatsBySlot = {};
  const wardStatsBySlot = {};
  const smokesBySlot = {};
  const heroDamageEvents = [];
  const roshansKilled = { radiant: null, dire: null };

  const players = [];
  const bans = {
    dire: [],
    radiant: [],
  };
  const buildings = [];
  let lastInterval = null;
  let matchDate = null;
  let gameClockStartTime = null;
  let draftStartTime = null;
  let draftPhaseStartTime = null;
  let replayEndTime = null;
  let teamBanId;

  events.forEach((e) => {
    if (e.type === "interval" && e.slot !== undefined) {
      if (Number.isFinite(Number(e.roshans_killed))) {
        const team = Number(e.slot) < 5 ? "radiant" : "dire";
        roshansKilled[team] = Math.max(roshansKilled[team] ?? 0, Number(e.roshans_killed));
      }

      if (e.kills !== undefined || e.deaths !== undefined || e.assists !== undefined) {
        playerStatsBySlot[e.slot] = e;
      }

      // Координати кожні 30 секунд
      if (e.time >= 30 && e.time <= 300 && e.time % 30 === 0) {
        playersCoordinates[e.slot] ??= {};

        playersCoordinates[e.slot][e.time] = {
          x: e.x,
          y: e.y,
        };
      }

      // Дані саме на 5 хвилині
      if (e.time === 300) {
        playersAt5Min[e.slot] = e;
      }
    }

    if (e.type === "CHAT_MESSAGE_SMOKE_ACTIVATED") {
      const slot = Number(e.player1);
      if (Number.isInteger(slot) && slot >= 0 && slot < 10) {
        smokesBySlot[slot] = (smokesBySlot[slot] || 0) + 1;
      }
    }

    if (e.type === "DOTA_COMBATLOG_DAMAGE" && e.targethero === true) {
      heroDamageEvents.push(e);
    }

    if (e.type === "CHAT_MESSAGE_OBSERVER_WARD_KILLED" || e.type === "CHAT_MESSAGE_SENTRY_WARD_KILLED") {
      const isObserver = e.type === "CHAT_MESSAGE_OBSERVER_WARD_KILLED";
      // For observer wards, player2 is the player credited for providing True Sight.
      const trueSightProviderSlot = Number(e.player2);
      const gold = Number(e.value);
      if (isObserver && Number.isInteger(trueSightProviderSlot) && trueSightProviderSlot >= 0 && trueSightProviderSlot < 10) {
        wardStatsBySlot[trueSightProviderSlot] ??= { observerTrueSight: 0, gold: 0 };
        wardStatsBySlot[trueSightProviderSlot].observerTrueSight += 1;
        if (Number.isFinite(gold) && gold > 0) {
          wardStatsBySlot[trueSightProviderSlot].gold += gold;
        }
      }
    }

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
      // `time` is normalized to 0 at the start of gameplay. `game_start_time`
      // is the parser's pre-normalization offset, so it cannot be compared to
      // draft event times.
      gameClockStartTime = Number(e.time);
    }
    if (e.type === "draft_start" && draftPhaseStartTime === null) {
      draftPhaseStartTime = Number(e.time);
    }
    if (e.type === "draft_timings" && Number.isFinite(Number(e.time))) {
      const pickBanTime = Number(e.time);
      draftStartTime = draftStartTime === null
        ? pickBanTime
        : Math.min(draftStartTime, pickBanTime);
    }
    if (e.type === "epilogue" && typeof e.key === "string") {
      try {
        const replayInfo = JSON.parse(e.key);
        const dotaInfo = replayInfo.gameInfo_?.dota_ || replayInfo.game_info?.dota;
        const endTime = Number(dotaInfo?.endTime_ ?? dotaInfo?.end_time);
        if (Number.isFinite(endTime) && endTime > 1000000000) replayEndTime = endTime;
      } catch {
        // Some replay versions serialize epilogue metadata differently.
      }
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
  const playerLines = {};

  Object.entries(playersCoordinates).forEach(([slot, coordinates]) => {
    playerLines[slot] = GetPlayerLineLasthit(slot, coordinates, playersAt5Min);
  });

  const rolesPlayers = GetPlayerRole(playerLines);
  const slotByHeroName = {};
  const teamBySlot = {};
  const heroDamageBySlot = {};
  players.forEach((player) => {
    const slot = Number(player.key);
    const hero = heroesById[heroBySlot[player.key]];
    if (hero?.name) slotByHeroName[hero.name] = slot;
    teamBySlot[slot] = player.value < 128 ? "Radiant" : "Dire";
    heroDamageBySlot[slot] = 0;
  });
  heroDamageEvents.forEach((event) => {
    const attackerSlot = slotByHeroName[event.attackername] ?? slotByHeroName[event.sourcename];
    const targetSlot = slotByHeroName[event.targetname];
    const damage = Number(event.value);
    if (
      attackerSlot !== undefined &&
      targetSlot !== undefined &&
      teamBySlot[attackerSlot] !== teamBySlot[targetSlot] &&
      Number.isFinite(damage) &&
      damage > 0
    ) {
      heroDamageBySlot[attackerSlot] += damage;
    }
  });
  console.log(rolesPlayers);

  // Після циклу формуємо результат
  const duration = lastInterval ? lastInterval.time : 0;
  const pausedDuration = events.reduce((total, event) => {
    return event.type === "game_paused" && event.key === "pause_duration"
      ? total + (Number(event.value) || 0)
      : total;
  }, 0);
  const gameStartEpoch = replayEndTime && duration > 0
    ? replayEndTime - duration - pausedDuration
    : null;
  const actualDraftStartTime = draftStartTime ?? draftPhaseStartTime;
  const draftDuration = Number.isFinite(gameClockStartTime) && Number.isFinite(actualDraftStartTime)
    ? Math.max(0, gameClockStartTime - actualDraftStartTime)
    : null;
  const matchStartTime = gameStartEpoch !== null && draftDuration !== null
    ? new Date((gameStartEpoch - draftDuration) * 1000).toISOString().replace(".000Z", "Z")
    : null;
  const lastBuilding = buildings[buildings.length - 1];

  const matchData = {
    // Wall-clock start of the draft, serialized in the same UTC ISO format
    // used by matches.json.
    matchStartTime,
    bans,
    matchDate,
    duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`,
    winner: lastBuilding
      ? lastBuilding.targetname === "npc_dota_goodguys_fort" ? "Dire" : "Radiant"
      : null,
    roshansKilled,
    players: players.map((p) => ({
      slot: p.key,
      team: p.value < 128 ? "Radiant" : "Dire",
      accountid: p.accountid,
      role: rolesPlayers[p.key],
      name: knownPlayers[String(p.accountid)] || "Невідомо",
      hero: heroBySlot[p.key] || "Невідомо",
      creeps_stacked: stacksBySlot[p.key]?.creeps_stacked || 0,
      camps_stacked: stacksBySlot[p.key]?.camps_stacked || 0,
      obs_placed: stacksBySlot[p.key]?.obs_placed || 0,
      sen_placed: stacksBySlot[p.key]?.sen_placed || 0,
      kills: playerStatsBySlot[p.key]?.kills ?? null,
      deaths: playerStatsBySlot[p.key]?.deaths ?? null,
      assists: playerStatsBySlot[p.key]?.assists ?? null,
      ...(options.includeParserEventSummary ? {
        smokes_used: smokesBySlot[p.key] || 0,
        observer_wards_true_sight: wardStatsBySlot[p.key]?.observerTrueSight || 0,
        ward_gold_received: wardStatsBySlot[p.key]?.gold || 0,
        last_hits: playerStatsBySlot[p.key]?.lh ?? null,
        denies: playerStatsBySlot[p.key]?.denies ?? null,
        networth: playerStatsBySlot[p.key]?.networth ?? null,
        hero_damage: heroDamageBySlot[Number(p.key)] ?? 0,
      } : {}),
    })),
  };

  if (options.includeParserEventSummary) {
    matchData.replayEndTime = replayEndTime
      ? new Date(replayEndTime * 1000).toISOString()
      : null;
    matchData.gameStartTime = gameStartEpoch !== null
      ? new Date(gameStartEpoch * 1000).toISOString()
      : null;
    matchData.draftDuration = draftDuration;
    matchData.parserEventCount = events.length;
    matchData.parserEventTypes = events.reduce((counts, event) => {
      counts[event.type] = (counts[event.type] || 0) + 1;
      return counts;
    }, {});
  }

  return matchData;
}

module.exports = { GetMatchInfo };

import { roleName } from "./showPlayerRoles.js";

const detailsContainer = document.getElementById("matchDetails");

export default function ShowMatchDetails(match, heroesId) {
  detailsContainer.replaceChildren();
  detailsContainer.style.display = "block";

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "matchDetailsBack";
  backButton.dataset.action = "back-to-matches";
  backButton.textContent = "← До всіх матчів";
  detailsContainer.append(backButton);

  const heading = document.createElement("header");
  heading.className = "matchDetailsHeading";
  const matchId = (match.replay_file || "").replace(/\.dem$/i, "");
  const date = match.date ? new Date(match.date) : null;
  const dateText = date && !Number.isNaN(date.getTime())
    ? date.toLocaleString("uk-UA", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "Дата невідома";
  const title = document.createElement("h2");
  title.textContent = "Матч " + matchId;
  const meta = document.createElement("p");
  meta.textContent = dateText + " · Тривалість: " + (match.duration || "—");
  const winner = document.createElement("strong");
  winner.className = match.winner === "Radiant" ? "radiant" : "dire";
  winner.textContent = "Перемогла команда " + (match.winner === "Radiant" ? "Sentinel" : "Scourge");
  heading.append(title, meta, winner);
  detailsContainer.append(heading);

  const teams = document.createElement("div");
  teams.className = "matchDetailsTeams";
  ["Radiant", "Dire"].forEach((team) => {
    const teamCard = document.createElement("section");
    teamCard.className = "matchDetailsTeam " + team.toLowerCase();
    const teamHeading = document.createElement("h3");
    const rating = match.teamsRating?.[team];
    teamHeading.textContent = (team === "Radiant" ? "Sentinel" : "Scourge") + " · рейтинг " + (rating == null ? "—" : Math.round(rating / 5));
    teamCard.append(teamHeading);

    match.players.filter((player) => player.team === team).forEach((player) => {
      const row = document.createElement("article");
      row.className = "matchDetailsPlayer";
      const hero = heroesId[player.hero];
      if (hero) {
        const icon = document.createElement("img");
        icon.src = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/" + hero.npcName.replace("npc_dota_hero_", "") + ".png";
        icon.alt = hero.name;
        icon.title = hero.name;
        row.append(icon);
      }

      const identity = document.createElement("div");
      identity.className = "matchDetailsPlayerIdentity";
      const playerName = document.createElement("strong");
      playerName.textContent = player.name || "Невідомий гравець";
      const role = document.createElement("span");
      role.textContent =
        (hero?.name || "\u041d\u0435\u0432\u0456\u0434\u043e\u043c\u0438\u0439 \u0433\u0435\u0440\u043e\u0439") +
        " \u00b7 " +
        (roleName(player.role) || "\u2014");
      identity.append(playerName, role);
      row.append(identity);

      const stats = document.createElement("div");
      stats.className = "matchDetailsPlayerStats";
      const ratingChange = Number(player.changeRating);
      stats.append(document.createTextNode("Рейтинг: " + (player.rating ?? "—") + (Number.isFinite(ratingChange) ? " (" + (ratingChange > 0 ? "+" : "") + ratingChange + ")" : "")));
      row.append(stats);

      const stream = match.streams?.find((entry) => entry.streamerId == player.accountid);
      if (stream?.url) {
        const link = document.createElement("a");
        link.href = stream.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "matchDetailsStream streamUrl";
        const streamIcon = document.createElement("img");
        const platform = stream.url.toLowerCase().includes("youtube") || stream.url.toLowerCase().includes("youtu.be")
          ? "youtube.com"
          : stream.url.toLowerCase().includes("twitch")
            ? "twitch.tv"
            : null;
        if (platform) {
          streamIcon.src = "https://www.google.com/s2/favicons?domain=" + platform + "&sz=32";
          streamIcon.alt = "Відкрити стрім";
          streamIcon.title = "Відкрити стрім";
          streamIcon.width = 32;
          streamIcon.height = 32;
          link.append(streamIcon);
          row.append(link);
        }
      }
      teamCard.append(row);
    });
    teams.append(teamCard);
  });
  detailsContainer.append(teams);

  const bans = document.createElement("section");
  bans.className = "matchDetailsBans";
  const bansHeading = document.createElement("h3");
  bansHeading.textContent = "Забанені герої";
  bans.append(bansHeading);
  ["Radiant", "Dire"].forEach((team) => {
    const teamBans = match.bans?.[team.toLowerCase()] || [];
    if (!teamBans.length) return;
    const line = document.createElement("div");
    line.className = "matchDetailsBanTeam";
    const teamName = document.createElement("strong");
    teamName.textContent = (team === "Radiant" ? "Sentinel" : "Scourge") + ":";
    line.append(teamName);
    const icons = document.createElement("div");
    icons.className = "matchDetailsBanIcons";
    teamBans.forEach((id) => {
      const hero = heroesId[id];
      if (!hero) return;
      const icon = document.createElement("img");
      icon.src = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/" + hero.npcName.replace("npc_dota_hero_", "") + ".png";
      icon.alt = hero.name;
      icon.title = hero.name;
      icons.append(icon);
    });
    line.append(icons);
    bans.append(line);
  });
  detailsContainer.append(bans);

  if (match.streams?.length) {
    const streams = document.createElement("p");
    streams.className = "matchDetailsStreamList";
    streams.textContent = "Доступно посилань на стрім: " + match.streams.length;
    detailsContainer.append(streams);
  }
  detailsContainer.classList.add("activeContainer");
}

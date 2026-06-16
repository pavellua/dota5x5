const matchesStats = document.getElementById("matchesStats");
export default function ShowAllGames(resJson) {
  matchesStats.innerHTML = "";
  console.log(resJson);
  matchesStats.style.display = "flex";
  setTimeout(() => matchesStats.classList.add("activeContainer"), 10);
  const allMatches = resJson.matches;
  const heroesId = resJson.heroesId;

  allMatches.sort((a, b) => new Date(b.date) - new Date(a.date));
  allMatches.forEach((match) => {
    const matchContainer = document.createElement("div");
    const matchId = match.replay_file.replace(".dem", "");

    matchesStats.append(matchContainer);
    const matchDateIdContainer = document.createElement("div");
    matchContainer.append(matchDateIdContainer);
    const date = new Date(match.date.replace("Z", ""));

    const matchDateString = date.toLocaleString("uk-UA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    matchDateIdContainer.innerHTML = `<span class="matchId">Match id: ${matchId}</span><span class="matchDate">${matchDateString}</span>`;
    matchDateIdContainer.classList.add("matchDateIdContainer");

    const direContainer = document.createElement("div");
    const radiantContainer = document.createElement("div");
    const teamsContainer = document.createElement("div");
    teamsContainer.classList.add("teamsContainer");
    matchContainer.append(teamsContainer);
    teamsContainer.append(radiantContainer);
    teamsContainer.append(direContainer);
    radiantContainer.innerHTML = `<span class="radiant teamLabel">Sentinel</span>`;
    direContainer.innerHTML = `<span  class="dire teamLabel">Scourge</span>`;
    matchContainer.classList.add("matchContainer");
    matchContainer.setAttribute("data-match-id", matchId);
    match.players.forEach((player) => {
      const playerContainer = document.createElement("div");
      playerContainer.classList.add("playerContainer");
      const heroIconContainerString = getHeroIconContainer(heroesId, player);
      const streamIcon = getStreamIcon(player, match.streams);

      playerContainer.innerHTML = `${heroIconContainerString}<span class="playerName" data-player-id = ${player.accountid}>${player.name} </span> ${streamIcon}`;

      if (player.team == "Radiant") {
        radiantContainer.append(playerContainer);
      } else if (player.team == "Dire") {
        direContainer.append(playerContainer);
      }
    });
  });
}

function getHeroIconContainer(heroesId, player) {
  const imgSrc = heroesId[player.hero].npcName.replace("npc_dota_hero_", "");
  return `<img 
      class="matchHeroIcon"
            src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/${imgSrc}.png"
            alt="${heroesId[player.hero].name}"
            )"
          />`;
}

function getStreamIcon(player, streams) {
  const matchStreamer = streams.find(
    (stream) => stream.streamerId == player.accountid,
  );

  if (matchStreamer) {
    if (matchStreamer.url.includes("yout")) {
      return `<a target="_blank" href="${matchStreamer.url}" class="streamUrl"><img src="https://www.google.com/s2/favicons?domain=youtube.com&sz=32" width="32" height="32" /></a>`;
    } else if (matchStreamer.url.includes("twitch")) {
      return `<a target="_blank" href="${matchStreamer.url}" class="streamUrl"><img src="https://www.google.com/s2/favicons?domain=twitch.tv&sz=32" width="32" height="32" /></a>`;
    }
  }
  return "";
}

{
  /*
   */
}

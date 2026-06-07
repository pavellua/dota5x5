import PlayerStats from "../playersStats.js";
import RenderAllPlayers from "./renderAllPlayers.js";

const shuffleBtn = document.getElementById("shuffleBtn");
const allPlayersContainer = document.getElementById("allPlayersContainer");

const dataRequest = await fetch("/api/get-matches");
const matches = await dataRequest.json();

let playerStats = PlayerStats({ matches });

RenderAllPlayers(playerStats);

shuffleBtn.addEventListener("click", () => {
  const checkedPlayers = allPlayersContainer.querySelectorAll(
    'input[type="checkbox"]:checked',
  );
  console.log(playerStats);
  console.log(checkedPlayers);
  const activePlayerMas = [...checkedPlayers].map((playerInput) => ({
    id: playerInput.value,
    winrate: playerStats[playerInput.value].winrate,
    name: playerStats[playerInput.value].name,
  }));

  const best = getBestSplits(activePlayerMas);
  console.log(best);
  console.log(  );
});

function getCombinations(arr, k) {
  const result = [];
  function combine(start, current) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      combine(i + 1, current);
      current.pop();
    }
  }
  combine(0, []);
  return result;
}

function getBestSplits(players, topN = 10) {
  const combinations = getCombinations(players, 5);
  const results = [];

  for (const teamA of combinations) {
    const teamAIds = new Set(teamA.map((p) => p.id));
    const teamB = players.filter((p) => !teamAIds.has(p.id));

    const sumA = teamA.reduce((acc, p) => acc + p.winrate, 0);
    const sumB = teamB.reduce((acc, p) => acc + p.winrate, 0);
    const diff = Math.abs(sumA - sumB);

    results.push({ teamA, teamB, sumA, sumB, diff });
  }

  return results.sort((a, b) => a.diff - b.diff).slice(0, topN);
}

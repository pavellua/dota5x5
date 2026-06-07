const deleteBtn = document.getElementById("deleteBtn");
const replayNumberDeleteInput = document.getElementById("replayNumberDelete");
const streamersSelect = document.getElementById("streamers");
const streamUrlInput = document.getElementById("streamUrl");

const addReplaysBtn = document.getElementById("addReplaysBtn");
const addStreamBtn = document.getElementById("addStreamBtn");
const addMatchInfoBtn = document.getElementById("addMatchInfoBtn");
const matchDateInput = document.getElementById("matchDateInput");
const matchTimeInput = document.getElementById("matchTimeInput");

deleteBtn.addEventListener("click", async () => {
  const deleteReplayId = replayNumberDeleteInput.value;
  console.log(deleteReplayId);
  const dataRequest = await fetch(
    `/api/delete-replay-data?idReplay=${deleteReplayId}`,
  );
  const data = await dataRequest.json();
  console.log(data);
});

addReplaysBtn.addEventListener("click", async () => {
  const dataRequest = await fetch(`/api/add-replays`);
  const data = await dataRequest.json();
  console.log(data);
});

addStreamBtn.addEventListener("click", async () => {
  const deleteReplayId = replayNumberDeleteInput.value;
  const streamerId = streamersSelect.value;
  const streamUrl = streamUrlInput.value;

  const dataRequest = await fetch(
    `/api/add-stream?idReplay=${deleteReplayId}&streamerId=${streamerId}&streamUrl=${streamUrl}`,
  );
  const data = await dataRequest.json();
  console.log(data);
});

addMatchInfoBtn.addEventListener("click", async () => {
  const deleteReplayId = replayNumberDeleteInput.value;

  const streamUrl = streamUrlInput.value;
  const matchDate = matchDateInput.value;
  const matchTime = matchTimeInput.value;

  if (deleteReplayId && matchDate != "2026-05-06") {
    const dataRequest = await fetch(
      `/api/add-match-data?matchDate=${matchDate}&matchTime=${matchTime}&replayId=${deleteReplayId}`,
    );
    const data = await dataRequest.json();
    console.log(data);
  }
});

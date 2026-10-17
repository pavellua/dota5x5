const deleteBtn = document.getElementById("deleteBtn");
const replayNumberDeleteInput = document.getElementById("replayNumberDelete");
const addReplaysBtn = document.getElementById("addReplaysBtn");
const saveStreamsBtn = document.getElementById("saveStreamsBtn");
const streamsStatus = document.getElementById("streamsStatus");
const addMatchInfoBtn = document.getElementById("addMatchInfoBtn");
const matchDateInput = document.getElementById("matchDateInput");
const matchTimeInput = document.getElementById("matchTimeInput");
const playersRoleBtn = document.getElementById("playersRoleBtn");
const replayPreviewFile = document.getElementById("replayPreviewFile");
const parseReplayPreviewBtn = document.getElementById("parseReplayPreviewBtn");
const replayPreviewStatus = document.getElementById("replayPreviewStatus");
const replayPreviewResults = document.getElementById("replayPreviewResults");

parseReplayPreviewBtn.addEventListener("click", async () => {
  const fileName = replayPreviewFile.value.trim();
  replayPreviewStatus.textContent = "";
  replayPreviewResults.replaceChildren();
  if (!fileName) {
    replayPreviewStatus.textContent = "Введи назву реплею з папки replays.";
    replayPreviewFile.focus();
    return;
  }

  parseReplayPreviewBtn.disabled = true;
  replayPreviewStatus.textContent = "Парсер обробляє реплей…";
  try {
    const response = await fetch("/api/parse-replay-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName }),
    });
    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      if (responseText.includes("Cannot POST /api/parse-replay-preview")) {
        throw new Error(
          "Новий маршрут ще не завантажений. Зупини та знову запусти Node-сервер, потім онови цю сторінку.",
        );
      }
      throw new Error(
        `Сервер повернув не JSON (HTTP ${response.status}). Перевір, що запущений Node-сервер цього проєкту.`,
      );
    }
    if (!response.ok)
      throw new Error(data.error || "Не вдалося розпарсити реплей.");

    replayPreviewStatus.textContent = "Готово: " + data.replay_file;
    const matchDate = document.createElement("p");
    const formatMatchDate = (value) =>
      value
        ? new Intl.DateTimeFormat("uk-UA", {
            timeZone: "Europe/Kyiv",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          }).format(new Date(value))
        : "час відсутній у метаданих реплею";
    const formattedDraftDuration = Number.isFinite(data.draftDuration)
      ? `${Math.floor(data.draftDuration / 60)}:${String(data.draftDuration % 60).padStart(2, "0")}`
      : "невідомо";
    matchDate.textContent = `Початок драфту (перший пік/бан): ${formatMatchDate(data.matchStartTime)} · початок самої гри: ${formatMatchDate(data.gameStartTime)} · драфт тривав ${formattedDraftDuration}`;
    replayPreviewResults.append(matchDate);

    const summary = document.createElement("p");
    summary.textContent = `Результат: ${data.winner || "переможця не визначено"} · тривалість ${data.duration || "—"} · подій парсера ${data.parserEventCount ?? "—"}`;
    replayPreviewResults.append(summary);

    const roshanSummary = document.createElement("p");
    roshanSummary.textContent = `Вбивства Рошана — Radiant: ${data.roshansKilled?.radiant ?? "—"} · Dire: ${data.roshansKilled?.dire ?? "—"}`;
    replayPreviewResults.append(roshanSummary);

    const table = document.createElement("table");
    const head = document.createElement("thead");
    const headerRow = document.createElement("tr");
    [
      "Гравець",
      "Команда",
      "Герой (ID)",
      "K",
      "D",
      "A",
      "Роль",
      "Стаки кріпів/таборів",
      "Поставлено obs/sentry",
      "Смоки",
      "True Sight для obs",
      "Золото за obs",
      "Ластхіти",
      "Денаї",
      "Нетворс",
      "Шкода ворожим героям",
    ].forEach((label) => {
      const cell = document.createElement("th");
      cell.textContent = label;
      headerRow.append(cell);
    });
    head.append(headerRow);
    table.append(head);
    const body = document.createElement("tbody");
    (data.players || []).forEach((player) => {
      const row = document.createElement("tr");
      [
        player.name,
        player.team,
        player.hero,
        player.kills,
        player.deaths,
        player.assists,
        player.role,
        `${player.creeps_stacked ?? 0}/${player.camps_stacked ?? 0}`,
        `${player.obs_placed ?? 0}/${player.sen_placed ?? 0}`,
        player.smokes_used,
        player.observer_wards_true_sight,
        player.ward_gold_received,
        player.last_hits,
        player.denies,
        player.networth,
        player.hero_damage,
      ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value ?? "—";
        row.append(cell);
      });
      body.append(row);
    });
    table.append(body);
    replayPreviewResults.append(table);

    const details = document.createElement("details");
    const detailsSummary = document.createElement("summary");
    detailsSummary.textContent = "Усі отримані поля та типи подій парсера";
    const rawData = document.createElement("pre");
    rawData.textContent = JSON.stringify(data, null, 2);
    details.append(detailsSummary, rawData);
    replayPreviewResults.append(details);
  } catch (error) {
    replayPreviewStatus.textContent =
      error.message || "Помилка під час парсингу.";
  } finally {
    parseReplayPreviewBtn.disabled = false;
  }
});

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

saveStreamsBtn.addEventListener("click", async () => {
  const replayId = replayNumberDeleteInput.value.trim();
  const streams = [
    {
      streamerId: "107383793",
      input: document.getElementById("streamUrlPavlo"),
    },
    {
      streamerId: "1092509200",
      input: document.getElementById("streamUrlVladik"),
    },
    {
      streamerId: "173288536",
      input: document.getElementById("streamUrlKatia"),
    },
  ].filter(({ input }) => input.value.trim());

  streamsStatus.textContent = "";
  if (!replayId) {
    streamsStatus.textContent = "Спочатку введіть Replay ID.";
    replayNumberDeleteInput.focus();
    return;
  }
  if (!streams.length) {
    streamsStatus.textContent = "Вставте хоча б одне посилання на стрім.";
    return;
  }

  saveStreamsBtn.disabled = true;
  try {
    for (const { streamerId, input } of streams) {
      const response = await fetch("/api/add-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idReplay: replayId, streamerId, streamUrl: input.value.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error("Не вдалося зберегти посилання.");
    }
    streamsStatus.textContent = `Збережено посилань: ${streams.length}.`;
  } catch (error) {
    streamsStatus.textContent = error.message || "Помилка під час збереження.";
  } finally {
    saveStreamsBtn.disabled = false;
  }
});

addMatchInfoBtn.addEventListener("click", async () => {
  const deleteReplayId = replayNumberDeleteInput.value;

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

playersRoleBtn.addEventListener("click", async () => {
  const dataRequest = await fetch(`/api/get-players-roles`);
  const data = await dataRequest.json();
  console.log(data);
});

const express = require("express");
const fs = require("fs");
const path = require("path");
const { parseReplay, extractSummary } = require("./parser");
const { GetMatchInfo } = require("./serverFunctions/getMatchInfo");
const { GetHeroesId } = require("./serverFunctions/getHeroesId");

const app = express();
const REPLAYS_DIR = path.join(__dirname, "replays");

app.use(express.static("."));

// Кеш щоб не парсити одне й те саме двічі
const cache = {};

app.get("/api/matches", async (req, res) => {
  const heroesId = await GetHeroesId();
  const matches2 = JSON.parse(fs.readFileSync("./matches.json", "utf-8"));

  // return res.json({
  //   matches: matches2,
  //   heroesId,
  // });

  const replayFolder = "./replays";

  // Отримуємо список файлів
  const files = fs.readdirSync(replayFolder);

  // Беремо тільки .dem файли
  const replayFiles = files.filter((file) => file.endsWith(".dem"));

  // Читаємо існуючий matches.json
  let matches = [];

  if (fs.existsSync("./matches.json")) {
    matches = JSON.parse(fs.readFileSync("./matches.json", "utf8"));
  }

  const matchInfo = require("./data/gamesInfo.json");
  // Перебираємо всі реплеї
  for (const file of replayFiles) {
    try {
      console.log(`Обробка: ${file}`);
      const matchDateInfo = matchInfo[file.replace(".dem", "")];

      const replayPath = path.join(replayFolder, file);

      // Читаємо реплей
      const replay = fs.readFileSync(replayPath);

      // Отримуємо дані матчу
      const matchReplay = matches.find((match) => match.replay_file == file);
      if (matchReplay) {
        console.log("Ріплей вже є");
        continue;
      }
      const matchData = await GetMatchInfo(replay);
      matchData.date = matchDateInfo.date || "";
      matchData.streams = matchDateInfo.streams || [];
      // Можеш додати ім'я файлу
      matchData.replay_file = file;

      // Додаємо в масив
      matches.push(matchData);

      console.log(`Готово: ${file}`);
    } catch (err) {
      console.error(`Помилка в ${file}:`, err);
    }
  }
  res.json({
    matches: matches,
    heroesId,
  });
  // Зберігаємо всі матчі
  fs.writeFileSync("./matches.json", JSON.stringify(matches, null, 2));

  console.log(`Збережено ${matches.length} матчів`);
});

app.listen(3005, () => {
  console.log("Сервер запущено: http://localhost:3005");
});

app.get("/api/delete-replay-data", async (req, res) => {
  const replayId = req.query.idReplay;
  const matches = JSON.parse(fs.readFileSync("./matches.json", "utf-8"));
  const matchIndex = matches.findIndex(
    (match) => match.replay_file === replayId + ".dem",
  );
  if (matchIndex === -1) {
    console.log("Матч не знайдено");
    return res.status(404).json({ error: "Match not found" });
  }

  matches.splice(matchIndex, 1); // видаляє 1 елемент за індексом

  fs.writeFileSync("./matches.json", JSON.stringify(matches, null, 2), "utf-8");
  console.log("Матч видалено і оновлено файл");
  res.json({ success: true });

  // res.json({
  //   matches: matches,
  //   heroesId,
  // });
});

app.get("/api/add-replays", async (req, res) => {
  const heroesId = await GetHeroesId();

  const replayFolder = "./replays";

  // Отримуємо список файлів
  const files = fs.readdirSync(replayFolder);

  // Беремо тільки .dem файли
  const replayFiles = files.filter((file) => file.endsWith(".dem"));

  // Читаємо існуючий matches.json
  let matches = [];

  if (fs.existsSync("./matches.json")) {
    matches = JSON.parse(fs.readFileSync("./matches.json", "utf8"));
  }

  const matchInfo = require("./data/gamesInfo.json");
  // Перебираємо всі реплеї
  for (const file of replayFiles) {
    try {
      console.log(`Обробка: ${file}`);
      const matchDateInfo = matchInfo[file.replace(".dem", "")];
      const matchDate = matchDateInfo ? matchDateInfo.date : "";
      const streamsMas = matchDateInfo ? matchDateInfo.streams : [];
      const replayPath = path.join(replayFolder, file);

      // Читаємо реплей
      const replay = fs.readFileSync(replayPath);

      // Отримуємо дані матчу
      const matchReplay = matches.find((match) => match.replay_file == file);
      if (matchReplay) {
        console.log("Ріплей вже є");
        continue;
      }
      const matchData = await GetMatchInfo(replay);
      matchData.date = matchDate;
      matchData.streams = streamsMas;
      matchDateInfo.bans ? (matchData.bans = matchDateInfo.bans) : null;
      // Можеш додати ім'я файлу
      matchData.replay_file = file;

      // Додаємо в масив
      matches.push(matchData);

      console.log(`Готово: ${file}`);
    } catch (err) {
      console.error(`Помилка в ${file}:`, err);
    }
  }
  res.json({
    matches: matches,
    heroesId,
  });
  // Зберігаємо всі матчі
  fs.writeFileSync("./matches.json", JSON.stringify(matches, null, 2));

  console.log(`Збережено ${matches.length} матчів`);
});

app.get("/api/add-stream", async (req, res) => {
  const replayId = req.query.idReplay;
  const streamerId = req.query.streamerId;
  const streamUrl = req.query.streamUrl;

  const gamesInfo = JSON.parse(
    fs.readFileSync("./data/gamesInfo.json", "utf-8"),
  );
  const currentGame = gamesInfo[replayId];

  if (currentGame) {
    if (!currentGame.streams) {
      currentGame.streams = [];
    }
    currentGame.streams.push({
      url: streamUrl,
      streamerId: streamerId,
    });

    fs.writeFileSync(
      "./data/gamesInfo.json",
      JSON.stringify(gamesInfo, null, 2),
      "utf-8",
    );
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }

  // res.json({
  //   matches: matches,
  //   heroesId,
  // });
});

app.get("/api/get-matches", async (req, res) => {
  const matches = JSON.parse(fs.readFileSync("./matches.json", "utf-8"));
  res.json(matches);
});

app.get("/api/add-match-data", async (req, res) => {
  const gamesInfo = JSON.parse(
    fs.readFileSync("./data/gamesInfo.json", "utf-8"),
  );

  const matchDate = req.query.matchDate;
  const matchTime = req.query.matchTime;
  const replayId = req.query.replayId;

  const currentGame = gamesInfo[replayId];
  if (!currentGame) {
    console.log("Нові дані про ріплей");
    gamesInfo[replayId] = { date: `${matchDate}T${matchTime}:00Z` };
    fs.writeFileSync(
      "./data/gamesInfo.json",
      JSON.stringify(gamesInfo, null, 2),
      "utf-8",
    );
  } else {
    console.log("Дані про цю гру вже є");
  }
  console.log(gamesInfo);
});

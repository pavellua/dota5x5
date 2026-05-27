const express = require("express");
const fs = require("fs");
const path = require("path");
const { parseReplay, extractSummary } = require("./parser");
const { GetMatchInfo } = require("./serverFunctions/getMatchInfo");
const { GetHeroesId } = require("./serverFunctions/getHeroesId");

const app = express();
const REPLAYS_DIR = path.join(__dirname, "replays");

app.use(express.static("public"));

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

  // if (fs.existsSync("./matches.json")) {
  //   matches = JSON.parse(fs.readFileSync("./matches.json", "utf8"));
  // }
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

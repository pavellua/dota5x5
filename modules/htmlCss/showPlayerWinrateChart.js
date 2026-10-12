const chartContainer = document.getElementById("playerWinrateChart");
const individualContainerInfo = document.getElementById(
  "individualContainerInfo",
);
const DAY_MS = 24 * 60 * 60 * 1000;

export default function ShowPlayerWinrateChart(playerStats, playerId, data) {
  [...individualContainerInfo.children].forEach((element) => {
    element.style.display = "none";
    element.classList.remove("activeIndividContainer");
  });
  chartContainer.style.display = "block";
  chartContainer.classList.add("activeIndividContainer");
  chartContainer.replaceChildren();

  const matches = data.matches
    .map((match) => ({
      match,
      player: match.players.find(
        (entry) => String(entry.accountid) === String(playerId),
      ),
      date: match.date ? new Date(match.date) : null,
    }))
    .filter(
      ({ player, date }) => player && date && !Number.isNaN(date.getTime()),
    )
    .sort((a, b) => a.date - b.date);

  const heading = document.createElement("h3");
  heading.className = "playerWinrateHeading";
  heading.textContent =
    "Перемоги та поразки по днях · " +
    (playerStats[playerId]?.name || "Гравець");
  chartContainer.append(heading);

  if (!matches.length) {
    const emptyState = document.createElement("p");
    emptyState.textContent = "Для цього гравця ще немає матчів із датами.";
    chartContainer.append(emptyState);
    return;
  }

  const days = new Map();
  matches.forEach(({ match, player, date }) => {
    const dayStart = Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    if (!days.has(dayStart))
      days.set(dayStart, { date: dayStart, wins: 0, losses: 0, matches: [] });
    const day = days.get(dayStart);
    const won = player.team === match.winner;
    if (won) day.wins += 1;
    else day.losses += 1;
    day.matches.push({ match, player, won });
  });

  const dayValues = [...days.values()].sort((a, b) => a.date - b.date);
  const totalWins = dayValues.reduce((sum, day) => sum + day.wins, 0);
  const totalLosses = dayValues.reduce((sum, day) => sum + day.losses, 0);
  const summary = document.createElement("p");
  summary.className = "playerWinrateSummary";
  summary.textContent =
    totalWins +
    " перемог · " +
    totalLosses +
    " поразок · " +
    (totalWins + totalLosses) +
    " матчів";
  chartContainer.append(summary);

  const legend = document.createElement("div");
  legend.className = "winLossChartLegend";
  legend.innerHTML =
    '<span><i class="winLegend"></i>Перемоги</span><span><i class="lossLegend"></i>Поразки</span>';
  chartContainer.append(legend);

  const firstDay = dayValues[0].date;
  const lastDay = dayValues[dayValues.length - 1].date;
  const dayCount = Math.round((lastDay - firstDay) / DAY_MS) + 1;
  const step = 12;
  const width = Math.max(440, 48 + dayCount * step + 24);
  const height = 270;
  const baseline = 120;
  const plotHalf = 82;
  const maxPerDay = Math.max(
    1,
    ...dayValues.map((day) => Math.max(day.wins, day.losses)),
  );
  const barUnit = plotHalf / maxPerDay;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 " + width + " " + height);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("role", "img");
  svg.setAttribute(
    "aria-label",
    "Щоденні перемоги вгору зеленим і поразки вниз червоним",
  );
  svg.classList.add("playerWinrateSvg");

  const addLine = (y, className) => {
    const line = document.createElementNS(svg.namespaceURI, "line");
    line.setAttribute("x1", 42);
    line.setAttribute("x2", width - 12);
    line.setAttribute("y1", y);
    line.setAttribute("y2", y);
    line.setAttribute("class", className);
    svg.append(line);
  };
  addLine(baseline, "winLossZeroLine");
  addLine(baseline - plotHalf / 2, "winLossGridLine");
  addLine(baseline + plotHalf / 2, "winLossGridLine");

  const axisLabel = (value, y) => {
    const label = document.createElementNS(svg.namespaceURI, "text");
    label.setAttribute("x", 36);
    label.setAttribute("y", y + 4);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("class", "winrateAxisLabel");
    label.textContent = value;
    svg.append(label);
  };
  axisLabel("+" + Math.ceil(maxPerDay / 2), baseline - plotHalf / 2);
  axisLabel("0", baseline);
  axisLabel("−" + Math.ceil(maxPerDay / 2), baseline + plotHalf / 2);

  const showDay = (day) => {
    const date = new Date(day.date + 12 * 60 * 60 * 1000);
    const detail = document.createElement("div");
    detail.className = "winLossMatchDetail";
    const dayTitle = document.createElement("strong");
    dayTitle.textContent = date.toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const dayRecord = document.createElement("span");
    dayRecord.textContent = day.wins + " перемог · " + day.losses + " поразок";
    detail.append(dayTitle, dayRecord);

    day.matches.forEach(({ match, player, won }) => {
      const hero = data.heroesId[player.hero];
      const matchLine = document.createElement("span");
      matchLine.textContent =
        (won ? "Перемога" : "Поразка") +
        " · " +
        (hero?.name || "Невідомий герой") +
        " · матч " +
        (match.replay_file || "—").replace(/\.dem$/i, "");
      detail.append(matchLine);
    });

    const oldDetail = chartContainer.querySelector(".winLossMatchDetail");
    if (oldDetail) oldDetail.replaceWith(detail);
    else chartContainer.append(detail);
  };

  const dayByTimestamp = new Map(dayValues.map((day) => [day.date, day]));
  for (let index = 0; index < dayCount; index += 1) {
    const timestamp = firstDay + index * DAY_MS;
    const day = dayByTimestamp.get(timestamp);
    const centerX = 48 + index * step + step / 2;
    const axisDate = new Date(timestamp + 12 * 60 * 60 * 1000);

    if (axisDate.getDate() === 1 || index === 0 || index === dayCount - 1) {
      const tick = document.createElementNS(svg.namespaceURI, "line");
      tick.setAttribute("x1", centerX);
      tick.setAttribute("x2", centerX);
      tick.setAttribute("y1", 32);
      tick.setAttribute("y2", height - 52);
      tick.setAttribute("class", "winLossDayTick");
      svg.append(tick);
    }

    if (!day) continue;
    const dateLabel = document.createElementNS(svg.namespaceURI, "text");
    dateLabel.setAttribute("x", centerX);
    dateLabel.setAttribute("y", height - 8);
    dateLabel.setAttribute("text-anchor", "start");
    dateLabel.setAttribute("font-size", "10");
    dateLabel.setAttribute("transform", `rotate(-90 ${centerX} ${height - 8})`);
    dateLabel.setAttribute("class", "winrateAxisLabel");
    dateLabel.textContent = axisDate.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
    });
    svg.append(dateLabel);

    const addBar = (count, x, isWin) => {
      if (!count) return;
      const bar = document.createElementNS(svg.namespaceURI, "rect");
      const barHeight = Math.max(2, count * barUnit);
      bar.setAttribute("x", x);
      bar.setAttribute("width", 10);
      bar.setAttribute("height", barHeight);
      bar.setAttribute("y", isWin ? baseline - barHeight : baseline);
      bar.setAttribute("rx", 1);
      bar.setAttribute("stroke", "#190d2e");
      bar.setAttribute("stroke-width", "1");
      bar.setAttribute("class", isWin ? "winLossBar win" : "winLossBar loss");
      bar.setAttribute("tabindex", "0");
      bar.setAttribute("role", "button");
      bar.setAttribute(
        "aria-label",
        axisDate.toLocaleDateString("uk-UA") +
          ": " +
          count +
          (isWin ? " перемог" : " поразок"),
      );
      const title = document.createElementNS(svg.namespaceURI, "title");
      title.textContent =
        axisDate.toLocaleDateString("uk-UA") +
        " · " +
        count +
        (isWin ? " перемог" : " поразок");
      bar.append(title);
      bar.addEventListener("click", () => showDay(day));
      bar.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showDay(day);
        }
      });
      svg.append(bar);

      for (let gameIndex = 1; gameIndex < count; gameIndex += 1) {
        const divider = document.createElementNS(svg.namespaceURI, "line");
        const segmentHeight = barHeight / count;
        const dividerY = isWin
          ? baseline - gameIndex * segmentHeight
          : baseline + gameIndex * segmentHeight;
        divider.setAttribute("x1", x);
        divider.setAttribute("x2", x + 12);
        divider.setAttribute("y1", dividerY);
        divider.setAttribute("y2", dividerY);
        divider.setAttribute("class", "winLossSegmentDivider");
        svg.append(divider);
      }
    };
    addBar(day.wins, centerX - 6, true);
    addBar(day.losses, centerX - 6, false);
  }

  const scroller = document.createElement("div");
  scroller.className = "winLossChartScroller";
  scroller.append(svg);
  chartContainer.append(scroller);
  showDay(dayValues[dayValues.length - 1]);

  const ratingMatches = matches.filter(({ player }) =>
    Number.isFinite(Number(player.rating)),
  );
  if (ratingMatches.length) {
    const ratingSection = document.createElement("section");
    ratingSection.className = "playerRatingSection";
    const ratingHeading = document.createElement("h4");
    ratingHeading.className = "playerRatingHeading";
    ratingHeading.textContent = "Динаміка рейтингу";
    const currentRating = document.createElement("p");
    currentRating.className = "playerWinrateSummary";
    currentRating.textContent =
      "Поточний рейтинг: " +
      Math.round(Number(ratingMatches[ratingMatches.length - 1].player.rating));
    ratingSection.append(ratingHeading, currentRating);

    const ratingValues = ratingMatches.map(({ player }) =>
      Number(player.rating),
    );
    const lowRating = Math.min(...ratingValues);
    const highRating = Math.max(...ratingValues);
    const range = Math.max(100, highRating - lowRating);
    const minRating = Math.floor((lowRating - range * 0.12) / 50) * 50;
    const maxRating = Math.ceil((highRating + range * 0.12) / 50) * 50;
    const ratingHeight = 310;
    const ratingWidth = 760;
    const top = 18;
    const bottom = 34;
    const left = 80;
    const right = ratingWidth - 12;
    const ratingSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    ratingSvg.setAttribute(
      "viewBox",
      "0 0 " + ratingWidth + " " + ratingHeight,
    );
    ratingSvg.setAttribute("width", "100%");
    ratingSvg.setAttribute("height", ratingHeight);
    ratingSvg.setAttribute("role", "img");
    ratingSvg.setAttribute(
      "aria-label",
      "Графік зміни рейтингу гравця за матчами",
    );
    ratingSvg.classList.add("playerRatingSvg");

    for (let index = 0; index <= 2; index += 1) {
      const y = top + ((ratingHeight - top - bottom) * index) / 2;
      const value = Math.round(
        maxRating - ((maxRating - minRating) * index) / 2,
      );
      const grid = document.createElementNS(ratingSvg.namespaceURI, "line");
      grid.setAttribute("x1", left);
      grid.setAttribute("x2", right);
      grid.setAttribute("y1", y);
      grid.setAttribute("y2", y);
      grid.setAttribute("class", "winLossGridLine");
      ratingSvg.append(grid);
      const label = document.createElementNS(ratingSvg.namespaceURI, "text");
      label.setAttribute("x", left - 6);
      label.setAttribute("y", y + 4);
      label.setAttribute("text-anchor", "end");
      label.setAttribute("class", "winrateAxisLabel");
      label.textContent = String(value);
      ratingSvg.append(label);
    }

    const points = ratingMatches.map(({ player }, index) => {
      return {
        x:
          ratingMatches.length === 1
            ? (left + right) / 2
            : left + (index / (ratingMatches.length - 1)) * (right - left),
        y:
          top +
          ((maxRating - Number(player.rating)) / (maxRating - minRating)) *
            (ratingHeight - top - bottom),
      };
    });
    [0, Math.floor((points.length - 1) / 2), points.length - 1]
      .filter((value, index, values) => values.indexOf(value) === index)
      .forEach((pointIndex) => {
        const x = points[pointIndex].x;
        const tick = document.createElementNS(ratingSvg.namespaceURI, "line");
        tick.setAttribute("x1", x);
        tick.setAttribute("x2", x);
        tick.setAttribute("y1", top);
        tick.setAttribute("y2", ratingHeight - bottom);
        tick.setAttribute("class", "winLossDayTick");
        ratingSvg.append(tick);
        const label = document.createElementNS(ratingSvg.namespaceURI, "text");
        label.setAttribute("x", x);
        label.setAttribute("y", ratingHeight - 10);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("class", "winrateAxisLabel");
        label.textContent = String(pointIndex + 1);
        ratingSvg.append(label);
      });
    const path = document.createElementNS(ratingSvg.namespaceURI, "path");
    let pathData = "M " + points[0].x + " " + points[0].y;
    for (let index = 0; index < points.length - 1; index += 1) {
      const previous = points[Math.max(0, index - 1)];
      const start = points[index];
      const end = points[index + 1];
      const next = points[Math.min(points.length - 1, index + 2)];
      const tension = 0.22;
      const control1X = start.x + (end.x - previous.x) * tension;
      const control1Y = start.y + (end.y - previous.y) * tension;
      const control2X = end.x - (next.x - start.x) * tension;
      const control2Y = end.y - (next.y - start.y) * tension;
      pathData +=
        " C " +
        control1X +
        " " +
        control1Y +
        " " +
        control2X +
        " " +
        control2Y +
        " " +
        end.x +
        " " +
        end.y;
    }
    path.setAttribute("d", pathData);
    path.setAttribute("class", "playerRatingCurve");
    ratingSvg.append(path);

    const ratingScroller = document.createElement("div");
    ratingScroller.className = "playerRatingScroller";
    ratingScroller.append(ratingSvg);
    ratingSection.append(ratingScroller);
    chartContainer.append(ratingSection);
  }

  requestAnimationFrame(() => {
    scroller.scrollLeft = scroller.scrollWidth;
  });
}

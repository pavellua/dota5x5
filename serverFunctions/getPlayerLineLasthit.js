function GetPlayerLineLasthit(slot, coordinates, playersAt5Min) {
  const laneZones = {
    upper: {
      xMin: 70,
      xMax: 100,
      yMin: 140,
      yMax: 180,
    },

    mid: {
      xMin: 105,
      xMax: 135,
      yMin: 105,
      yMax: 135,
    },

    lower: {
      xMin: 160,
      xMax: 190,
      yMin: 75,
      yMax: 120,
    },
  };

  const stats = {
    lower: 0,
    mid: 0,
    upper: 0,
  };

  Object.values(coordinates).forEach(({ x, y }) => {
    if (
      x >= laneZones.lower.xMin &&
      x <= laneZones.lower.xMax &&
      y >= laneZones.lower.yMin &&
      y <= laneZones.lower.yMax
    ) {
      stats.lower++;
    }

    if (
      x >= laneZones.mid.xMin &&
      x <= laneZones.mid.xMax &&
      y >= laneZones.mid.yMin &&
      y <= laneZones.mid.yMax
    ) {
      stats.mid++;
    }

    if (
      x >= laneZones.upper.xMin &&
      x <= laneZones.upper.xMax &&
      y >= laneZones.upper.yMin &&
      y <= laneZones.upper.yMax
    ) {
      stats.upper++;
    }
  });

  const physicalLane = Object.entries(stats).sort((a, b) => b[1] - a[1])[0][0];

  let lane;

  if (physicalLane === "mid") {
    lane = "mid";
  } else if (slot < 5) {
    // Radiant
    lane = physicalLane === "lower" ? "safelane" : "offlane";
  } else {
    // Dire
    lane = physicalLane === "lower" ? "offlane" : "safelane";
  }

  const lastHits = playersAt5Min[slot]?.lh || 0;

  return {
    lane,
    lastHits,
    physicalLane,
  };
}

module.exports = { GetPlayerLineLasthit };

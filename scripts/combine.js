const fs = require("fs");

function combineHeatmaps() {
  const leetcode = JSON.parse(
    fs.readFileSync("./public/data/leetcode.json")
  );

  const gfg = JSON.parse(
    fs.readFileSync("./public/data/gfg.json")
  );

  const combined = {};

  // Add LeetCode data (timestamps in seconds)
  for (const [timestamp, count] of Object.entries(leetcode)) {
    const date = new Date(timestamp * 1000)
      .toISOString()
      .split("T")[0];

    combined[date] = (combined[date] || 0) + count;
  }

  // Add GFG data (already in date format)
  for (const [date, count] of Object.entries(gfg)) {
    combined[date] = (combined[date] || 0) + count;
  }

  fs.writeFileSync(
    "./public/data/heatmap.json",
    JSON.stringify(combined, null, 2)
  );

  console.log("Combined heatmap saved");
}

combineHeatmaps();

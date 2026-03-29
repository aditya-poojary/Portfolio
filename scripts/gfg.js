const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

async function fetchGFG() {
  const url = "https://auth.geeksforgeeks.org/user/adityapoojary7/practice/";
  const { data } = await axios.get(url);

  const $ = cheerio.load(data);
  const heatmap = {};

  $(".heatmap-cell").each((i, el) => {
    const date = $(el).attr("data-date");
    const count = $(el).attr("data-count");

    if (date) {
      heatmap[date] = Number(count);
    }
  });

  fs.writeFileSync(
    "./public/data/gfg.json",
    JSON.stringify(heatmap, null, 2)
  );

  console.log("GFG data saved");
}

fetchGFG();

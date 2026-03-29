const fs = require("fs");

async function fetchLeetCode() {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://leetcode.com"
    },
    body: JSON.stringify({
      query: `
        query userProfileCalendar($username: String!) {
          matchedUser(username: $username) {
            userCalendar {
              submissionCalendar
            }
          }
        }
      `,
      variables: { username: "adityapoojary07" }
    })
  });

  const data = await res.json();

  const calendar = JSON.parse(
    data.data.matchedUser.userCalendar.submissionCalendar
  );

  fs.writeFileSync(
    "./public/data/leetcode.json",
    JSON.stringify(calendar, null, 2)
  );

  console.log("LeetCode data saved");
}

fetchLeetCode();

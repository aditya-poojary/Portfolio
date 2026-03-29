const fs = require("fs");

const USERNAME = "adityapoojary07";

async function fetchLeetCode() {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://leetcode.com"
    },
    body: JSON.stringify({
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            profile {
              ranking
            }
            userCalendar {
              streak
              totalActiveDays
              submissionCalendar
            }
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: { username: USERNAME }
    })
  });

  const data = await res.json();
  const user = data.data.matchedUser;

  const calendar = JSON.parse(user.userCalendar.submissionCalendar);

  const leetcodeData = {
    username: USERNAME,
    ranking: user.profile.ranking,
    streak: user.userCalendar.streak,
    totalActiveDays: user.userCalendar.totalActiveDays,
    submissions: user.submitStatsGlobal.acSubmissionNum,
    calendar: calendar,
    lastUpdated: new Date().toISOString()
  };

  fs.writeFileSync(
    "./public/data/leetcode.json",
    JSON.stringify(leetcodeData, null, 2)
  );

  console.log("LeetCode data saved:", {
    ranking: leetcodeData.ranking,
    streak: leetcodeData.streak,
    totalActiveDays: leetcodeData.totalActiveDays
  });
}

fetchLeetCode();

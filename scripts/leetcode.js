const fs = require("fs");

const USERNAME = "adityapoojary07";

// Years to fetch contributions for (add more years as needed)
const YEARS_TO_FETCH = [2024, 2025, 2026];

async function fetchUserProfile() {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
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
      variables: { username: USERNAME },
    }),
  });

  const data = await res.json();
  return data.data.matchedUser;
}

async function fetchCalendarForYear(year) {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({
      query: `
        query userProfileCalendar($username: String!, $year: Int) {
          matchedUser(username: $username) {
            userCalendar(year: $year) {
              submissionCalendar
            }
          }
        }
      `,
      variables: { username: USERNAME, year: year },
    }),
  });

  const data = await res.json();
  if (data.data?.matchedUser?.userCalendar?.submissionCalendar) {
    return JSON.parse(data.data.matchedUser.userCalendar.submissionCalendar);
  }
  return {};
}

async function fetchLeetCode() {
  // Fetch user profile (ranking, streak, submissions)
  const user = await fetchUserProfile();

  if (!user) {
    return;
  }

  // Fetch calendar data for each year and merge
  const allCalendarData = {};

  for (const year of YEARS_TO_FETCH) {
    const yearCalendar = await fetchCalendarForYear(year);

    // Merge into allCalendarData
    Object.assign(allCalendarData, yearCalendar);
  }

  // Sort calendar by timestamp
  const sortedCalendar = {};
  Object.keys(allCalendarData)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((key) => {
      sortedCalendar[key] = allCalendarData[key];
    });

  const leetcodeData = {
    username: USERNAME,
    ranking: user.profile.ranking,
    streak: user.userCalendar.streak,
    totalActiveDays: user.userCalendar.totalActiveDays,
    submissions: user.submitStatsGlobal.acSubmissionNum,
    calendar: sortedCalendar,
    lastUpdated: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./public/data/leetcode.json",
    JSON.stringify(leetcodeData, null, 2)
  );
}

fetchLeetCode();

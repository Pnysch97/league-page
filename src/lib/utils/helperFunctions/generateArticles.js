import { getLeagueStandings, getLeagueUsers } from "$lib/utils/helper";

export const generateArticles = async () => {
  const standings = await getLeagueStandings().catch((err) => {
    console.error(err);
  });
  const users = await getLeagueUsers().catch((err) => {
    console.error(err);
  });

  if (!standings || !users) {
    return [];
  }

  const teams = Object.values(standings.standingsInfo);
  if (!teams.length) return [];

  teams.sort(
    (a, b) => b.wins - b.losses - (a.wins - a.losses) || b.wins - a.wins,
  );

  const leader = teams[0];
  const loser = teams[teams.length - 1];

  const leaderRoster = standings.rostersData[leader.rosterID - 1];
  const loserRoster = standings.rostersData[loser.rosterID - 1];

  const leaderUser = users[leaderRoster.owner_id];
  const loserUser = users[loserRoster.owner_id];

  const articleText = `
<p><strong>${leaderUser.metadata?.team_name || leaderUser.display_name}</strong> is currently leading the league with a record of ${leader.wins}-${leader.losses}-${leader.ties}.</p>
<p>At the other end of the standings, <strong>${loserUser.metadata?.team_name || loserUser.display_name}</strong> sits last at ${loser.wins}-${loser.losses}-${loser.ties}.</p>
`;

  const date = new Date().toLocaleDateString("en-US");

  return [
    {
      title: "League Snapshot",
      article: articleText,
      author: "AI Reporter",
      date,
    },
  ];
};

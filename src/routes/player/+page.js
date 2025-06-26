import {
  loadPlayers,
  getLeagueTransactions,
  getLeagueTeamManagers,
} from "$lib/utils/helper";

export async function load({ url, fetch }) {
  const playerID = url?.searchParams?.get("player");
  return {
    playerID,
    playersData: loadPlayers(fetch),
    transactionsData: getLeagueTransactions(),
    leagueTeamManagersData: getLeagueTeamManagers(),
  };
}

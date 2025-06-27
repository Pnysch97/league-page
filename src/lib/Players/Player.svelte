<script>
    import TransactionsPage from '../Transactions/TransactionsPage.svelte';
    import { getTeamFromTeamManagers } from '../utils/helperFunctions/universalFunctions';

    export let playerID;
    export let playersInfo;
    export let transactionsInfo;
    export let leagueTeamManagers;

    const players = playersInfo.players;
    const player = players[playerID];

    $: playerTransactions = transactionsInfo.transactions.filter(t => {
        for (const move of t.moves) {
            for (const cell of move) {
                if (cell && cell.player == playerID) return true;
            }
        }
        return false;
    });

    $: historyMap = {};
    for (const t of playerTransactions) {
        if (!historyMap[t.season]) historyMap[t.season] = new Set();
        for (const rid of t.rosters) {
            historyMap[t.season].add(rid);
        }
    }
    $: teamHistory = Object.entries(historyMap).map(([year, set]) => ({ year, rosters: Array.from(set) })).sort((a,b) => b.year - a.year);

    $: weeklyProjections = [];
    if (player && player.wi) {
        for (const w in player.wi) {
            weeklyProjections.push({ week: +w, opp: player.wi[w].o, proj: player.wi[w].p });
        }
        weeklyProjections.sort((a,b) => a.week - b.week);
    }
</script>

<style>
    .playerInfo {
        text-align: center;
        margin: 2em 0;
    }
    .history {
        margin: 2em auto;
        width: 90%;
        max-width: 600px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
    }
    th, td {
        padding: 4px 6px;
        border: 1px solid var(--ddd);
        text-align: center;
    }
</style>

{#if player}
<div class="playerInfo">
    <h2>{player.fn} {player.ln}</h2>
    <p>{player.pos}{player.t ? ` - ${player.t}` : ''}</p>
</div>

{#if teamHistory.length}
<div class="history">
    <h3>Teams History</h3>
    <ul>
        {#each teamHistory as entry}
            <li><b>{entry.year}:</b>
                {#each entry.rosters as rid, idx}
                    {#if idx > 0}, {/if}
                    {getTeamFromTeamManagers(leagueTeamManagers, rid, entry.year).name}
                {/each}
            </li>
        {/each}
    </ul>
</div>
{/if}

{#if weeklyProjections.length}
<div class="history">
    <h3>Weekly Projections</h3>
    <table>
        <thead><tr><th>Week</th><th>Opp</th><th>PPR</th></tr></thead>
        <tbody>
            {#each weeklyProjections as row}
                <tr><td>{row.week}</td><td>{row.opp}</td><td>{row.proj}</td></tr>
            {/each}
        </tbody>
    </table>
</div>
{/if}

<h3 style="text-align:center">Transaction History</h3>
<div class="history">
    {#if playerTransactions.length}
        <TransactionsPage {playersInfo} transactions={playerTransactions} {leagueTeamManagers} show="both" query="" page={0} perPage={5}/>
    {:else}
        <p>No transactions for this player.</p>
    {/if}
</div>
{:else}
<p class="playerInfo">Player not found.</p>
{/if}

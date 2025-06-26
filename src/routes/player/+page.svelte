<script>
    import LinearProgress from '@smui/linear-progress';
    import { Player } from '$lib/components';
    import { waitForAll } from '$lib/utils/helper';

    export let data;
    const { playerID, playersData, transactionsData, leagueTeamManagersData } = data;
</script>

<style>
    .holder {
        position: relative;
        z-index: 1;
    }
    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }
</style>

<div class="holder">
    {#await waitForAll(playersData, transactionsData, leagueTeamManagersData)}
        <div class="loading">
            <p>Gathering player data...</p>
            <LinearProgress indeterminate />
        </div>
    {:then [playersInfo, transactionsInfo, leagueTeamManagers]}
        {#if playerID && playersInfo.players[playerID]}
            <Player {playerID} {playersInfo} {transactionsInfo} {leagueTeamManagers} />
        {:else}
            <p>Player not found.</p>
        {/if}
    {:catch error}
        <p>Something went wrong: {error.message}</p>
    {/await}
</div>

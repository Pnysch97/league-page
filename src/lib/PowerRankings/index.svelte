<script>
    import {getNflState, getLeagueRosters, getLeagueTeamManagers, waitForAll, loadPlayers, getLeagueData} from '$lib/utils/helper';
    import PowerRankingsDisplay from './PowerRankingsDisplay.svelte';
    import { LoadingSpinner } from '$lib/components';
    
    const helperPromises = waitForAll(
        getNflState(),
        getLeagueRosters(),
        getLeagueTeamManagers(),
        getLeagueData(),
        loadPlayers(null),
    );

</script>

<style>
    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }
</style>

{#await helperPromises}
    <!-- promise is pending -->
    <div class="loading">
        <LoadingSpinner message="Calculating power rankings..." />
    </div>
{:then [nflState, rostersData, leagueTeamManagers, leagueData, playersInfo]}
    {#if leagueData.status != 'pre_draft' && leagueData.status != 'complete'}
        <PowerRankingsDisplay {nflState} {rostersData} {leagueTeamManagers} {leagueData} {playersInfo} />
    {/if}
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}




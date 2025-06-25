<script context="module">
    import { waitForAll, getLeagueRosters, getLeagueUsers, getLeagueData, loadPlayers, getLeagueStandings, getAwards } from '$lib/utils/helper';
    export async function load({ params }) {
        const leagueId = params.id;
        const rostersInfo = waitForAll(
            getLeagueData(leagueId),
            getLeagueRosters(leagueId),
            getLeagueUsers(leagueId),
            loadPlayers()
        );
        const standingsData = getLeagueStandings(leagueId);
        const usersData = getLeagueUsers(leagueId);
        const awardsData = getAwards(leagueId);
        return { props: { leagueId, rostersInfo, standingsData, usersData, awardsData } };
    }
</script>

<script>
    import LinearProgress from '@smui/linear-progress';
    import { Rosters, Standings, Awards } from '$lib/components';
    export let leagueId, rostersInfo, standingsData, usersData, awardsData;
</script>

<style>
    .section {
        margin: 2rem auto;
        width: 95%;
        max-width: 1000px;
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

<div class="section">
    <h2>Season {leagueId}</h2>

    {#await awardsData}
        <div class="loading">
            <p>Loading awards...</p>
            <LinearProgress indeterminate />
        </div>
    {:then { podiums, currentManagers }}
        {#if podiums[0]}
            <Awards podium={podiums[0]} {currentManagers} />
        {/if}
    {:catch error}
        <p>Something went wrong: {error.message}</p>
    {/await}
</div>

<div class="section">
    {#await standingsData}
        <div class="loading">
            <p>Loading standings...</p>
            <LinearProgress indeterminate />
        </div>
    {:then data}
        {#if data}
            <Standings standingsData={Promise.resolve(data)} usersData={usersData} />
        {:else}
            <p class="loading">Standings not available.</p>
        {/if}
    {:catch error}
        <p>Something went wrong: {error.message}</p>
    {/await}
</div>

<div class="section">
    {#await rostersInfo}
        <div class="loading">
            <p>Loading rosters...</p>
            <LinearProgress indeterminate />
        </div>
    {:then [leagueData, rosterData, users, playersInfo]}
        <Rosters {leagueData} {rosterData} {users} {playersInfo} />
    {:catch error}
        <p>Something went wrong: {error.message}</p>
    {/await}
</div>

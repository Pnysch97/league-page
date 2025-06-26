<script>
        import { Rosters, LoadingSpinner } from '$lib/components'

	export let data;
	const rostersInfo = data.rostersInfo;
</script>

<style>
	.holder {
		position: relative;
		z-index: 1;
	}
</style>

<div class="holder">
        {#await rostersInfo}
                <LoadingSpinner message="Retrieving roster data..." />
	{:then [leagueData, rosterData, leagueTeamManagers, playersInfo]}
		<!-- promise was fulfilled -->
		<Rosters {leagueData} {rosterData} {leagueTeamManagers} {playersInfo} /> <!-- displays rosters -->
	{:catch error}
		<!-- promise was rejected -->
		<p>Something went wrong: {error.message}</p>
	{/await}
</div>

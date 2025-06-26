<script>
        import { Rivalry, LoadingSpinner } from '$lib/components'
	import { waitForAll } from '$lib/utils/helper';

	export let data;
	const {
        leagueTeamManagerData,
        playersData,
        transactionsData,
        recordsData,
        playerOne,
        playerTwo,
    } = data;
</script>

<style>
	.holder {
		position: relative;
		z-index: 1;
	}
</style>

<div class="holder">
        {#await waitForAll(leagueTeamManagerData, playersData, transactionsData, recordsData)}
                <LoadingSpinner message="Gathering information..." />
	{:then [leagueTeamManagers, playersInfo, transactionsInfo, recordsInfo]}
		<!-- promise was fulfilled -->
		<Rivalry {leagueTeamManagers} {playersInfo} {transactionsInfo} {recordsInfo} {playerOne} {playerTwo} />
	{:catch error}
		<!-- promise was rejected -->
		<p>Something went wrong: {error.message}</p>
	{/await}
</div>

<script>
	import { waitForAll } from '$lib/utils/helper';
    import { LoadingSpinner } from '$lib/components';
    import Draft from './Draft.svelte'; 

    export let upcomingDraftData, previousDraftsData, leagueTeamManagersData, playersData;
</script>

<style>
	.loading {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
	}

    h4 {
        text-align: center;
    }

    h6 {
        text-align: center;
    }
</style>


{#await waitForAll(upcomingDraftData, leagueTeamManagersData, playersData) }
        <div class="loading">
                <LoadingSpinner message="Retrieving upcoming draft..." />
        </div>
{:then [upcomingDraft, leagueTeamManagers, {players}] }
    <h4>Upcoming {upcomingDraft.year} Draft</h4>
    <Draft draftData={upcomingDraft} {leagueTeamManagers} year={upcomingDraft.year} {players} />
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}


{#await waitForAll(previousDraftsData, leagueTeamManagersData, playersData) }
        <hr />
        <h4>Previous Drafts</h4>
        <div class="loading">
                <LoadingSpinner message="Retrieving previous drafts..." />
        </div>
{:then [previousDrafts, leagueTeamManagers, {players}] }
	<!-- Don't display anything unless there are previous drafts -->
	{#if previousDrafts.length}
		<hr />
		<h4>Previous Drafts</h4>
		{#each previousDrafts as previousDraft}
			<h6>{previousDraft.year} Draft</h6>
			<Draft draftData={previousDraft} previous={true} {leagueTeamManagers} year={previousDraft.year} {players} />
		{/each}
	{/if}
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}
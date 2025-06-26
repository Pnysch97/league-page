<script>
        import {AllManagers, LoadingSpinner} from '$lib/components';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	export let data;
	const {managers, leagueTeamManagersData} = data;

    onMount(() => {
        if(!managers.length) {
            goto('/');
        }
    })
</script>

<style>
	.main {
		position: relative;
		z-index: 1;
	}
</style>

<div class="main">
    {#await leagueTeamManagersData}
        <!-- promise is pending -->
        <LoadingSpinner message="Retrieving managers..." />
    {:then leagueTeamManagers}
        {#if managers.length}
            <AllManagers {managers}  {leagueTeamManagers}/>
        {/if}
    {:catch error}
        <!-- promise was rejected -->
        <p>Something went wrong: {error.message}</p>
    {/await}
</div>
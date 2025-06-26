<script>
    import { onMount } from 'svelte';
    import LinearProgress from '@smui/linear-progress';
    import SingleNews from './News/SingleNews.svelte';
    import { getNews } from '$lib/utils/helper';

    let articles = [];
    let loading = true;

    onMount(async () => {
        const { articles: fetched } = await getNews();
        articles = fetched.slice(0, 3);
        loading = false;
    });
</script>

<style>
.news {
    width: 90%;
    max-width: 800px;
    margin: 4rem auto;
}

.news h2 {
    text-align: center;
    margin-bottom: 1em;
}
</style>

<div class="news">
    <h2>Latest News</h2>
    {#if loading}
        <LinearProgress indeterminate />
    {:else}
        {#each articles as article}
            <SingleNews {article} />
        {/each}
    {/if}
</div>

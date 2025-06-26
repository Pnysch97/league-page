<script>
        import { News, Resources, LoadingSpinner } from '$lib/components';

	export let data;
	const articlesData = data.articlesData;
</script>

<style>
	.loading {
		position: relative;
		z-index: 1;
        width: 85%;
        margin: 0 auto 60px;
        max-width: 800px;
    }
</style>

<Resources />

<hr />

{#await articlesData}
        <div class="loading">
                <LoadingSpinner message="Retrieving fantasy news..." />
        </div>
{:then news}
	<!-- promise was fulfilled -->
	<News {news}/>
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}

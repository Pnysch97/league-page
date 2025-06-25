<script context="module">
        import { getArticles } from '$lib/utils/helper';

    export async function load() {
            const articlesData = getArticles();

            return {
                    props: {
                            articlesData
                    }
            };
    }
</script>

<script>
        import LinearProgress from '@smui/linear-progress';
        import { Articles } from '$lib/components';

        export let articlesData;
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

{#await articlesData}
        <div class="loading">
                <p>Generating articles...</p>
                <br />
                <LinearProgress indeterminate />
        </div>
{:then data}
        <Articles articlesData={data} />
{:catch error}
        <p>Something went wrong: {error.message}</p>
{/await}

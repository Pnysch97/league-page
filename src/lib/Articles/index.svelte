<script>
       import SingleArticle from "./SingleArticle.svelte";
       import Pagination from "../Pagination.svelte";
   import { getArticles } from "$lib/utils/helper";

   export let articlesData;
   let { articles, fresh } = articlesData;

   const getFreshArticles = async () => {
       const newArticles = await getArticles(true);
       articles = newArticles.articles;
   }

   if(!fresh) {
       getFreshArticles();
   }

    const perPage = 10;
    let total = 0;
    let page = 0;
    let displayArticles = [];

    const calculateTotal = (a) => {
        total = a.length;
    }

    $: calculateTotal(articles);

    const changePage = (dest) => {
        const start = dest * perPage;
        const end = (dest + 1) * perPage;
        displayArticles = articles.slice(start, end);
        page = dest;
    }

    $: changePage(page);

    let el;

    $: top = el?.getBoundingClientRect() ? el?.getBoundingClientRect().top  : 0;
</script>

<style>
    .pageBody {
        position: relative;
        z-index: 1;
        margin-bottom: 60px;
    }

    h4 {
        text-align: center;
    }

    .articles {
        width: 85%;
        margin: 0 auto;
        max-width: 800px;
    }

    :global(.article) {
        margin: 20px auto;
    }
</style>

<div class="pageBody">
    <div class="banner" bind:this={el}>
        <h4>AI Generated League Articles</h4>
    </div>

    <div class="articles">
        {#each displayArticles as article}
            <SingleArticle {article} />
        {/each}
        <Pagination {perPage} {total} bind:page={page} target={top} />
    </div>
</div>

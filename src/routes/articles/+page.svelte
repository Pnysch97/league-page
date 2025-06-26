<script>
  import ArticleCard from '$lib/Articles/ArticleCard.svelte';

  const placeholderArticles = [
    { title: 'Article Placeholder 1', description: 'AI generated content coming soon.' },
    { title: 'Article Placeholder 2', description: 'Stay tuned for future updates.' },
    { title: 'Article Placeholder 3', description: 'More articles will appear here shortly.' }
  ];
</script>

<style>
  #main {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 2em 0;
  }
</style>

<div id="main">
  {#each placeholderArticles as article}
    <ArticleCard {article.title} {article.description} title={article.title} description={article.description} />
  {/each}
</div>

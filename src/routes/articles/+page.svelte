<script>
  import { placeholderArticles } from '$lib/ai/articles';
</script>

<style>
  #main {
    margin: 30px auto;
    width: 95%;
    max-width: 1000px;
  }

  .card {
    display: block;
    background-color: var(--fff);
    border: 1px solid var(--bbb);
    border-radius: 1.5em;
    padding: 1em 1.5em;
    margin: 1em 0;
    text-decoration: none;
    color: inherit;
  }

  .card h2 {
    margin: 0 0 0.5em;
  }
</style>

<div id="main">
  <h1>Articles</h1>
  {#each placeholderArticles as article}
    <a class="card" href="/articles/{article.slug}">
      <h2>{article.title}</h2>
      <small>{article.date}</small>
      <p>{article.content}</p>
    </a>
  {/each}
</div>

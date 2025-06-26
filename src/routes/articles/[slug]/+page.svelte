<script>
  export let data;
  const { article } = data;
</script>

<style>
  #main {
    margin: 30px auto;
    width: 95%;
    max-width: 800px;
  }
</style>

<div id="main">
  <h1>{article.title}</h1>
  <small>{article.date}</small>
  <p>{article.content}</p>
  <p><a href="/articles">Back to Articles</a></p>
</div>

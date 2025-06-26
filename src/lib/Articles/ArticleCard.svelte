<script>
  export let title;
  export let description;
</script>

<style>
  .card {
    background-color: var(--fff);
    border: 1px solid var(--ccc);
    border-radius: 1em;
    box-shadow: 0 0 6px 0 var(--bbb);
    padding: 1em;
    margin: 1em;
    width: 280px;
  }

  h3 {
    margin-top: 0;
    text-align: center;
    font-size: 1.4em;
  }

  p {
    text-align: center;
    color: var(--g555);
    margin-bottom: 0;
  }
</style>

<div class="card">
  <h3>{title}</h3>
  <p>{description}</p>
</div>

<script>
    import { leagueName } from '$lib/utils/helper';
</script>

<style>
.hero {
    position: relative;
    background-image: url('/banner.png');
    background-size: cover;
    background-position: center;
    padding: 6rem 1rem;
    color: #fff;
    text-align: center;
}

.hero h1 {
    margin: 0;
    font-size: 3em;
}

.tagline {
    margin-top: 1rem;
    font-size: 1.5em;
}
</style>

<div class="hero">
    <h1>{leagueName}</h1>
    <div class="tagline">Welcome to the official league hub</div>
</div>

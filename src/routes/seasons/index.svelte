<script context="module">
    import { getAwards } from '$lib/utils/helper';
    export async function load() {
        const awardsData = getAwards();
        return { props: { awardsData } };
    }
</script>

<script>
    import LinearProgress from '@smui/linear-progress';
    export let awardsData;
</script>

<style>
    .seasons {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        width: 95%;
        max-width: 1200px;
        margin: 30px auto;
        z-index: 1;
    }
    .card {
        background: var(--r1);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        padding: 1rem;
        text-align: center;
    }
    .avatars {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .avatars img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 1px solid var(--bbb);
    }
    h3 {
        margin: 0.5rem 0;
        color: var(--blueOne);
    }
</style>

<div class="seasons">
    {#await awardsData}
        <div class="card" style="grid-column: 1 / -1;">
            <p>Loading season data...</p>
            <LinearProgress indeterminate />
        </div>
    {:then {podiums}}
        {#each podiums as podium}
            <div class="card">
                <h3>{podium.year}</h3>
                <div class="avatars">
                    <img src={podium.champion.avatar} alt="champion" title={`Champion: ${podium.champion.name}`} />
                    <img src={podium.second.avatar} alt="second" title={`2nd Place: ${podium.second.name}`} />
                    <img src={podium.third.avatar} alt="third" title={`3rd Place: ${podium.third.name}`} />
                </div>
                <div>
                    <strong>{podium.champion.name}</strong> won the title.
                </div>
            </div>
        {/each}
    {:catch error}
        <div class="card" style="grid-column: 1 / -1;">
            <p>Something went wrong: {error.message}</p>
        </div>
    {/await}
</div>

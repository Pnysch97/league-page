<script context="module">
    import { getLeagueTransactions, loadPlayers, waitForAll } from '$lib/utils/helper';
    export async function load({ params }) {
        const { id } = params;
        const transactionsData = getLeagueTransactions(false);
        const playersData = loadPlayers();
        return { props: { id, transactionsData, playersData } };
    }
</script>

<script>
    import LinearProgress from '@smui/linear-progress';
    import Transaction from '$lib/Transactions/Transaction.svelte';
    import { goto } from '$app/navigation';
    export let id, transactionsData, playersData;
</script>

<style>
    .page {
        margin: 2rem auto;
        width: 95%;
        max-width: 1000px;
        position: relative;
        z-index: 1;
    }
    .modern-btn {
        background-image: linear-gradient(135deg, var(--blueOne), #4c83c4);
        color: #fff;
        border: none;
        border-radius: 6px;
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .modern-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }
    .detail {
        margin-top: 1rem;
    }
</style>

<div class="page">
    <button class="modern-btn" on:click={() => goto('/transactions')}>Back to Transactions</button>

    {#await waitForAll(transactionsData, playersData)}
        <div class="loading">
            <p>Loading transaction...</p>
            <LinearProgress indeterminate />
        </div>
    {:then [{ transactions, currentManagers }, playersInfo]}
        {#if transactions}
            {#let tx = transactions.find(t => String(t.id) === id)}
                {#if tx}
                    <div class="detail">
                        <Transaction {tx} transaction={tx} {currentManagers} players={playersInfo.players} masterOffset={15} />
                    </div>
                {:else}
                    <p class="loading">Transaction not found.</p>
                {/if}
        {:else}
            <p class="loading">No transaction data.</p>
        {/if}
    {:catch error}
        <p class="loading">Something went wrong: {error.message}</p>
    {/await}
</div>

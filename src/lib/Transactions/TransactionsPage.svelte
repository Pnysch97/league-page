<script>
	import Textfield from '@smui/textfield';
  	import Icon from '@smui/textfield/icon';
	import Transaction from './Transaction.svelte';
        import IconButton from '@smui/icon-button';
        import { fade } from 'svelte/transition';
	import Pagination from '../Pagination.svelte';
	import { match } from 'fuzzyjs';
	import { goto } from '$app/navigation';
	import { getLeagueTransactions, loadPlayers } from '$lib/utils/helper';

       export let masterOffset = 0, show, playersInfo, query, queryPage, transactions, currentManagers, stale, perPage, team = 0, postUpdate=false;
       const oldQuery = query;
       let page = queryPage || 0;

	const refreshTransactions = async () => {
		const newTransactions = await getLeagueTransactions(false, true);
		transactions = newTransactions.transactions;
		currentManagers = newTransactions.currentManagers;
	}

	if(stale) {
		refreshTransactions();
	}

	let players = playersInfo.players;

	const refreshPlayers = async () => {
		const newPlayersInfo = await loadPlayers(true);
		players = newPlayersInfo.players;
	}

	if(playersInfo.stale) {
		refreshPlayers();
	}

	// filtered subset based on search
	let subsetTransactions = [];

       let totalTransactions = 0;

       const setFilter = (filterBy, transactions) => {
               if(filterBy == "both") {
                       return transactions;
               } else {
                       return transactions.filter( transaction => transaction.type == filterBy);
               }
       }

       const setTeamFilter = (teamId, transactions) => {
               if(!teamId || teamId == 0) {
                       return transactions;
               }
               teamId = parseInt(teamId);
               return transactions.filter(transaction => transaction.rosters.indexOf(teamId) > -1);
       }

       // filtered subset based on filter
       $: filteredByShow = setFilter(show, transactions);
       $: filteredTransactions = setTeamFilter(team, filteredByShow);

	const setQuery = (query, filteredTransactions) => {
		if(!filteredTransactions) {
			return [];
		}
		if(query && query.trim() != "") {
			subsetTransactions = filteredTransactions.filter( transaction => checkForQuery(transaction));
			totalTransactions = subsetTransactions.length;
		} else {
			subsetTransactions = filteredTransactions;
			totalTransactions = subsetTransactions.length;
		}

		const start = page * perPage;
		const end = (page + 1) * perPage;
		return subsetTransactions.slice(start, end);
	}
	$: displayTransactions = setQuery(query, filteredTransactions);

	const changePage = (dest, pageChange = false) => {
		if(queryPage == dest && pageChange) return;
		page = dest;
		if(dest > (filteredTransactions.length / perPage) || dest < 0) {
			page = 0;
		}
		displayTransactions = setQuery(query, filteredTransactions);
		if(postUpdate) {
                       setTimeout(() => {goto(`/transactions?show=${show}&query=${query}&team=${team}&page=${page+1}`, {noscroll: true,  keepfocus: true})}, 800);
		}
	}

	let lastUpdate = new Date;

	const search = () => {
		lastUpdate = new Date;
		query = query.trimLeft();
		if(query.trim() == oldQuery) return;
		page = 0;
		if(postUpdate) {
			updateQueryParam(false);
		}
	}

	let called = false;

	const updateQueryParam = (stack = true) => {
		if(called && !stack) {
			return;
		}
		called = true;
		const FIVE_SECONDS = 5 * 1000; /* five seconds */
		if(((new Date) - lastUpdate) > FIVE_SECONDS) {
			called = false;
                       goto(`/transactions?show=${show}&query=${query.trim()}&team=${team}&page=${page+1}`, {noscroll: true,  keepfocus: true});
			return;
		}
		return setTimeout(updateQueryParam, 2000); // check every 2 seconds
	}

	const clearSearch = () => {
		query = "";
		if(postUpdate) {
                       goto(`/transactions?show=${show}&query=&team=${team}&page=${page+1}`, {noscroll: true,  keepfocus: true});
		}
	}
	
	const checkMatch = (query, name) => {
		const nameMatch = match(query, name)
		if(nameMatch.match && nameMatch.score > 0) {
			(nameMatch.score);
			return true;
		}
	}

	const checkForQuery = (transaction) => {
		const moves = transaction.moves;
		for(const move of moves) {
			for(const col of move) {
				if(!col?.player) continue;
				return checkMatch(query, `${players[col.player].fn} ${players[col.player].ln}`);
			}
		}
		return false;
	}

	$: changePage(page, true);

	$: setQuery(query);

    let el;

    $: top = el?.getBoundingClientRect() ? el?.getBoundingClientRect().top  : 0;

        const setShow = (val) => {
                show = val;
                page = 0;
                changePage(0);
        }

       const setTeam = (val) => {
               team = parseInt(val);
               page = 0;
               changePage(0);
       }
</script>

<style>
	.transactionsParent {
		display: flex;
		flex-wrap: wrap;
		position: relative;
		width: 100%;
		z-index: 1;
		overflow-y: hidden;
	}

    @media (max-width: 1000px) {
    }

	.transactions {
		flex-grow: 1;
		padding: 0 15px;
	}

	p {
		text-align: center;
	}

	h5 {
		text-align: center;
		margin: 30px auto 16px;
	}

	.buttons {
		margin: 40px auto 0;
	}

	:global(.disabled) {
		pointer-events: none;
	}

	.invis-buttons {
		display: none !important;
	}

        .searchContainer {
                width: 100%;
                text-align: center;
                margin: 2em 0 .5em;
        }

        .teamFilter {
                width: 100%;
                text-align: center;
                margin: 1em 0;
        }

	.clearPlaceholder {
		width: 48px;
		display: inline-block;
	}
	
        .empty {
                width: 100%;
                font-style: italic;
                text-align: center;
                color: #999;
        }

        .modern-btn {
                background-image: linear-gradient(135deg, var(--blueOne), #4c83c4);
                color: #fff;
                border: none;
                border-radius: 6px;
                padding: 0.5rem 1rem;
                margin: 0 0.25rem;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
        }
        .modern-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .transaction-wrapper {
                margin-bottom: 1.5rem;
        }

        .detail-btn {
                margin-top: 0.5rem;
        }
</style>

<div class="transactionsParent">
        <div class="buttons {show == "trade" ? "" : "invis-buttons"}">
                <button class="modern-btn {show == 'trade' ? 'disabled' : ''}" on:click={() => setShow('trade')}>Trades</button>
                <button class="modern-btn {show == 'waiver' ? 'disabled' : ''}" on:click={() => setShow('waiver')}>Waivers</button>
                <button class="modern-btn {show == 'both' ? 'disabled' : ''}" on:click={() => setShow('both')}>Both</button>
                <button class="modern-btn {show == 'waiver' ? 'disabled' : ''}" on:click={() => setShow('waiver')}>Waivers Costs</button>
        </div>
        <div class="buttons {show == "waiver" ? "" : "invis-buttons"}">
                <button class="modern-btn {show == 'trade' ? 'disabled' : ''}" on:click={() => setShow('trade')}>Trades</button>
                <button class="modern-btn {show == 'waiver' ? 'disabled' : ''}" on:click={() => setShow('waiver')}>Waivers</button>
                <button class="modern-btn {show == 'both' ? 'disabled' : ''}" on:click={() => setShow('both')}>Both</button>
                <button class="modern-btn {show == 'waiver' ? 'disabled' : ''}" on:click={() => setShow('waiver')}>Waivers Costs</button>
        </div>
        <div class="buttons {show == "both" ? "" : "invis-buttons"}">
                <button class="modern-btn {show == 'trade' ? 'disabled' : ''}" on:click={() => setShow('trade')}>Trades</button>
                <button class="modern-btn {show == 'waiver' ? 'disabled' : ''}" on:click={() => setShow('waiver')}>Waivers</button>
                <button class="modern-btn {show == 'both' ? 'disabled' : ''}" on:click={() => setShow('both')}>Both</button>
                <button class="modern-btn {show == 'waiver' ? 'disabled' : ''}" on:click={() => setShow('waiver')}>Waivers Costs</button>
        </div>
        <div class="buttons {show == "waiver claims" ? "" : "invis-buttons"}">
                <button class="modern-btn {show == 'trade' ? 'disabled' : ''}" on:click={() => setShow('trade')}>Trades</button>
                <button class="modern-btn {show == 'waiver' ? 'disabled' : ''}" on:click={() => setShow('waiver')}>Waivers</button>
                <button class="modern-btn {show == 'both' ? 'disabled' : ''}" on:click={() => setShow('both')}>Both</button>
                <button class="modern-btn {show == 'waiver' ? 'disabled' : ''}" on:click={() => setShow('waiver')}>Waivers Costs</button>
        </div>
        <div class="teamFilter">
                <span class="clearPlaceholder" />
                <select bind:value={team} on:change={(e) => setTeam(e.target.value)}>
                        <option value="0">All Teams</option>
                        {#each Object.entries(currentManagers) as [id, manager]}
                                <option value={id}>{manager.name}</option>
                        {/each}
                </select>
                <span class="clearPlaceholder" />
        </div>
        <div class="searchContainer">
		<span class="clearPlaceholder" />
		<Textfield
			class="shaped-outlined"
			variant="outlined"
			bind:value={query}
			label="Search for a player..."
			on:input={() => search()}
		>
			<Icon class="material-icons" slot="leadingIcon">search</Icon>
		</Textfield>
		{#if query.length > 0}
			  <IconButton class="material-icons" on:click={() => clearSearch()}>clear</IconButton>
		{:else}
			<span class="clearPlaceholder" />
		{/if}
	</div>

	<div class="transactions" bind:this={el}>
		{#if show == "both"}
			<!-- trades -->
			<h5>Recent Transactions</h5>
		{:else if show == "trade"}
			<!-- trades -->
			<h5>Recent Trades</h5>
		{:else if show == "waiver"}
			<!-- waiver -->
			<h5>Recent Waivers</h5>
		{:else}
			<!-- waiver -->
			<h5>Waiver Costs</h5>
		{/if}

		<Pagination {perPage} total={totalTransactions} bind:page={page} target={top} scroll={false} />
                <div class="transactions-child">
                        {#each displayTransactions as transaction (transaction.id)}
                                <div class="transaction-wrapper" transition:fade>
                                        <Transaction {players} {transaction} masterOffset={masterOffset + 15} {currentManagers} />
                                        <button class="modern-btn detail-btn" on:click={() => goto(`/transactions/${transaction.id}`)}>Details</button>
                                </div>
                        {/each}
                </div>
		<Pagination {perPage} total={totalTransactions} bind:page={page} target={top} scroll={true} />

	</div>

	{#if totalTransactions == 0}
		{#if show == "trade"}
			<p class="empty">{query.trim() != "" ? "No trades match your search" : "Nobody has made any trades yet... that's just sad" }</p>
		{:else if show == "waiver"}
			<p class="empty">{query.trim() != "" ? "No waivers match your search" : "Nobody has made any waiver wire moves yet... that's just sad" }</p>
		{:else}
			<p class="empty">{query.trim() != "" ? "No transactions match your search" : "Nobody has made any moves yet... that's just sad" }</p>
		{/if}
	{/if}
</div>
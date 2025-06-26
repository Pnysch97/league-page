<script>
	import Textfield from '@smui/textfield';
  	import Icon from '@smui/textfield/icon';
        import Button, { Label } from '@smui/button';
        import IconButton from '@smui/icon-button';
        import Pagination from '../Pagination.svelte';
        import TransactionRow from './TransactionRow.svelte';
	import { match } from 'fuzzyjs';
	import { goto } from '$app/navigation';
        import { getLeagueTransactions, loadPlayers } from '$lib/utils/helper';

       export let show, playersInfo, query, season, queryPage, transactions, stale, perPage, postUpdate=false, leagueTeamManagers;
       const seasons = Object.keys(leagueTeamManagers.teamManagersMap).map(Number).sort((a,b) => b - a);
       let teamFilter = 'all';
       let minBid = '';
       let maxBid = '';
       $: teams = (() => {
               if(season === 'all') {
                       const names = new Set();
                       for(const yr in leagueTeamManagers.teamManagersMap) {
                               for(const rosterID in leagueTeamManagers.teamManagersMap[yr]) {
                                       names.add(leagueTeamManagers.teamManagersMap[yr][rosterID].team.name);
                               }
                       }
                       return Array.from(names).sort();
               }
               return Object.values(leagueTeamManagers.teamManagersMap[season]).map(t => t.team.name);
       })();
       const oldQuery = query;
        let page = queryPage || 0;

       let sortKey = 'date';
       let sortDir = 'desc';

       const sortArrow = (key) => {
               if(sortKey !== key) return '';
               return sortDir === 'asc' ? 'north' : 'south';
       };

       const getBid = (t) => {
               if(t.type !== 'waiver') return 0;
               for(const mv of t.moves) {
                       for(const col of mv) {
                               if(col?.bid) return col.bid;
                       }
               }
               return 0;
       };

       const sortTransactions = (a, b) => {
               let res = 0;
               if(sortKey === 'date') {
                       res = new Date(a.date) - new Date(b.date);
               } else if(sortKey === 'team') {
                       const ta = leagueTeamManagers.teamManagersMap[a.season]?.[a.rosters[0]]?.team.name || '';
                       const tb = leagueTeamManagers.teamManagersMap[b.season]?.[b.rosters[0]]?.team.name || '';
                       res = ta.localeCompare(tb);
               } else if(sortKey === 'bid') {
                       res = getBid(a) - getBid(b);
               } else if(sortKey === 'type') {
                       res = a.type.localeCompare(b.type);
               }
               return sortDir === 'asc' ? res : -res;
       };

       const setSort = (key) => {
               if(sortKey === key) {
                       sortDir = sortDir === 'asc' ? 'desc' : 'asc';
               } else {
                       sortKey = key;
                       sortDir = 'asc';
               }
       };

	const refreshTransactions = async () => {
		const newTransactions = await getLeagueTransactions(false, true);
		transactions = newTransactions.transactions;
	}

	if(stale) {
		refreshTransactions();
	}

	let players = playersInfo.players;

	const refreshPlayers = async () => {
		const newPlayersInfo = await loadPlayers(null, true);
		players = newPlayersInfo.players;
	}

	if(playersInfo.stale) {
		refreshPlayers();
	}

	// filtered subset based on search
	let subsetTransactions = [];

       let totalTransactions = 0;

       const filterSeason = (s, txs) => {
               if(s === 'all') return txs;
               return txs.filter(t => t.season == s);
       };

       const filterType = (filterBy, txs) => {
               if(filterBy == 'both') return txs;
               return txs.filter(t => t.type == filterBy);
       };

       const filterTeam = (team, txs) => {
               if(team === 'all') return txs;
               return txs.filter(t => t.rosters.some(r => {
                       const tm = leagueTeamManagers.teamManagersMap[t.season]?.[r];
                       return tm && tm.team.name === team;
               }));
       };

       const filterBid = (min, max, txs) => {
               return txs.filter(t => {
                       if(t.type !== 'waiver') return true;
                       let bid = 0;
                       for(const mv of t.moves) {
                               for(const col of mv) {
                                       if(col?.bid) { bid = col.bid; break; }
                               }
                               if(bid) break;
                       }
                       if(min !== '' && bid < min) return false;
                       if(max !== '' && bid > max) return false;
                       return true;
               });
       };

       // filtered subset based on filter
       $: seasonTransactions = filterSeason(season, transactions);
       $: typeTransactions = filterType(show, seasonTransactions);
       $: teamTransactions = filterTeam(teamFilter, typeTransactions);
       $: filteredTransactions = filterBid(minBid, maxBid, teamTransactions);
       $: sortedTransactions = [...filteredTransactions].sort(sortTransactions);

        const setQuery = (query, list) => {
                if(!list) {
                        return [];
                }
                if(query && query.trim() != "") {
                        subsetTransactions = list.filter( transaction => checkForQuery(transaction));
                        totalTransactions = subsetTransactions.length;
                } else {
                        subsetTransactions = list;
                        totalTransactions = subsetTransactions.length;
                }

		const start = page * perPage;
		const end = (page + 1) * perPage;
		return subsetTransactions.slice(start, end);
	}
        $: displayTransactions = setQuery(query, sortedTransactions);

	const changePage = (dest, pageChange = false) => {
		if(queryPage == dest && pageChange) return;
		page = dest;
                if(dest > (sortedTransactions.length / perPage) || dest < 0) {
                        page = 0;
                }
                displayTransactions = setQuery(query, sortedTransactions);
		if(postUpdate) {
           goto(`/transactions?show=${show}&query=${query}&page=${page+1}&season=${season}`, {noscroll: true,  keepfocus: true});
		}
	}

	let lastUpdate = new Date;

    let timer;

	const debounce = (dest) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
            goto(dest,{noscroll: true,  keepfocus: true});
		}, 750);
	}

	const search = () => {
		lastUpdate = new Date;
		query = query.trimLeft();
		if(query.trim() == oldQuery) return;
		page = 0;
		if(postUpdate) {
           const dest = `/transactions?show=${show}&query=${query.trim()}&page=${page+1}&season=${season}`;
            debounce(dest);
		}
	}

	const clearSearch = () => {
		query = "";
		if(postUpdate) {
                       goto(`/transactions?show=${show}&query=&page=${page+1}&season=${season}`, {noscroll: true,  keepfocus: true});
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
                               if(checkMatch(query, `${players[col.player].fn} ${players[col.player].ln}`)) {
                                       return true;
                               }
                       }
               }
               for(const roster of transaction.rosters) {
                       const team = leagueTeamManagers.teamManagersMap[transaction.season]?.[roster];
                       if(team) {
                               if(checkMatch(query, team.team.name)) {
                                       return true;
                               }
                               for(const managerID of team.managers) {
                                       const name = leagueTeamManagers.users[managerID]?.display_name;
                                       if(name && checkMatch(query, name)) {
                                               return true;
                                       }
                               }
                       }
               }
               return false;
       }

	$: changePage(page, true);

       $: setQuery(query, sortedTransactions);

    let el;

    $: top = el?.getBoundingClientRect() ? el?.getBoundingClientRect().top  : 0;

	const setShow = (val) => {
		show = val;
		page = 0;
		changePage(0);
	}
</script>

<style>
        .transactionsParent {
                display: flex;
                flex-direction: column;
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

        .filterBar {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
                margin: 20px auto;
                width: 100%;
        }

        .buttons {
                display: flex;
                gap: 0.5rem;
        }

        .buttons :global(.smui-button) {
                border-radius: 20px;
                text-transform: none;
        }

        .seasonFilter select {
                padding: 0.4rem 0.8rem;
                border-radius: 20px;
                border: 1px solid var(--blueTwo);
                background: var(--fff);
        }

        .teamFilter select,
        .bidFilter input {
                padding: 0.4rem 0.6rem;
                border-radius: 20px;
                border: 1px solid var(--blueTwo);
                background: var(--fff);
        }

        .bidFilter {
                display: flex;
                gap: 0.3rem;
                align-items: center;
        }

	:global(.disabled) {
		pointer-events: none;
	}


	.searchContainer {
		width: 100%;
		text-align: center;
		margin: 2em 0 .5em;
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

        .txTable {
                width: 100%;
                border-collapse: collapse;
                margin-top: 1rem;
        }

        .txTable th {
                text-align: left;
                cursor: pointer;
                padding: 0.5rem;
                border-bottom: 2px solid var(--blueTwo);
                }

        .sortIcon {
                font-size: 1rem;
                vertical-align: middle;
        }

        .txTable tbody tr:nth-child(odd) {
                background-color: var(--eee);
        }
</style>

<div class="transactionsParent">
        <div class="filterBar">
                <div class="buttons">
                        <Button class="{show == 'trade' ? 'disabled' : ''}" color="primary" onclick={() => setShow('trade')} variant="{show == 'trade' ? 'raised' : 'outlined'}" touch>
                                <Label>Trades</Label>
                        </Button>
                        <Button class="{show == 'waiver' ? 'disabled' : ''}" color="primary" onclick={() => setShow('waiver')} variant="{show == 'waiver' ? 'raised' : 'outlined'}" touch>
                                <Label>Waivers</Label>
                        </Button>
                        <Button class="{show == 'both' ? 'disabled' : ''}" color="primary" onclick={() => setShow('both')} variant="{show == 'both' ? 'raised' : 'outlined'}" touch>
                                <Label>Both</Label>
                        </Button>
                </div>
                <div class="seasonFilter">
                        <select bind:value={season} on:change={() => {teamFilter='all';changePage(0);}}>
                                <option value="all">All Seasons</option>
                                {#each seasons as yr}
                                        <option value={yr}>{yr}</option>
                                {/each}
                        </select>
                </div>
                <div class="teamFilter">
                        <select bind:value={teamFilter} on:change={() => changePage(0)}>
                                <option value="all">All Teams</option>
                                {#each teams as teamName}
                                        <option value={teamName}>{teamName}</option>
                                {/each}
                        </select>
                </div>
                <div class="bidFilter">
                        <input type="number" min="0" placeholder="Min Bid" bind:value={minBid} />
                        <input type="number" min="0" placeholder="Max Bid" bind:value={maxBid} />
                </div>
                <div class="searchContainer">
                        <span class="clearPlaceholder" />
                        <Textfield
                                class="shaped-outlined"
                                variant="outlined"
                                bind:value={query}
                                label="Search for a player or manager..."
                                on:input={() => search()}
                        >
                                <Icon class="material-icons" slot="leadingIcon">search</Icon>
                        </Textfield>
                        {#if query.length > 0}
                                  <IconButton class="material-icons" onclick={() => clearSearch()}>clear</IconButton>
                        {:else}
                                <span class="clearPlaceholder" />
                        {/if}
                </div>
        </div>

	<div class="transactions" bind:this={el}>
		{#if show == "both"}
			<!-- trades -->
			<h5>Recent Transactions</h5>
		{:else if show == "trade"}
			<!-- trades -->
			<h5>Recent Trades</h5>
		{:else}
			<!-- waiver -->
			<h5>Recent Waivers</h5>
		{/if}

                <Pagination {perPage} total={totalTransactions} bind:page={page} target={top} scroll={false} />
                <table class="txTable">
                        <thead>
                                <tr>
                                        <th on:click={() => setSort('date')}>
                                                Date <i class="material-icons sortIcon">{sortArrow('date')}</i>
                                        </th>
                                        <th on:click={() => setSort('team')}>
                                                Team(s) <i class="material-icons sortIcon">{sortArrow('team')}</i>
                                        </th>
                                        <th on:click={() => setSort('type')}>
                                                Type <i class="material-icons sortIcon">{sortArrow('type')}</i>
                                        </th>
                                        <th on:click={() => setSort('bid')}>
                                                Bid <i class="material-icons sortIcon">{sortArrow('bid')}</i>
                                        </th>
                                        <th>Details</th>
                                </tr>
                        </thead>
                        <tbody>
                        {#each displayTransactions as transaction (transaction.id)}
                                <TransactionRow {transaction} {players} {leagueTeamManagers} />
                        {/each}
                        </tbody>
                </table>
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


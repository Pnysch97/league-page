<script>
  export let transaction;
  export let players;
  export let leagueTeamManagers;

  const getTeams = () => {
    const names = transaction.rosters
      .map((r) => leagueTeamManagers.teamManagersMap[transaction.season]?.[r]?.team.name)
      .filter(Boolean);
    return names.join(' \u2194 ');
  };

  const getBid = () => {
    if (transaction.type !== 'waiver') return '';
    for (const mv of transaction.moves) {
      for (const col of mv) {
        if (col?.bid) return col.bid;
      }
    }
    return '';
  };

  const getDetails = () => {
    const details = transaction.rosters.map(() => []);

    for (const move of transaction.moves) {
      const origin = move.findIndex((c) => c === 'origin');
      for (let i = 0; i < move.length; i++) {
        const col = move[i];
        if (!col || col === 'origin') continue;

        let item = '';
        if (col.player) {
          const p = players[col.player];
          item = `${p.fn} ${p.ln}`;
        } else if (col.pick) {
          item = `${col.pick.season} R${col.pick.round}`;
        } else if (col.budget) {
          item = `${col.budget.amount}$`;
        }

        if (col.type === 'Added') {
          item = `<i class="material-icons addIcon">north</i> ${item}`;
        } else if (col.type === 'Dropped') {
          item = `<i class="material-icons dropIcon">south</i> ${item}`;
        } else if (col.type === 'trade') {
          const fromTeam =
            origin >= 0
              ? leagueTeamManagers.teamManagersMap[transaction.season]?.[
                  transaction.rosters[origin]
                ]?.team.name || ''
              : '';
          item = `${item} <i class="material-icons tradeIcon">arrow_forward</i> ${fromTeam}`;
        }

        details[i].push(item);
      }
    }

    return details
      .map((list, ix) => {
        if (!list.length) return null;
        const teamName =
          leagueTeamManagers.teamManagersMap[transaction.season]?.[
            transaction.rosters[ix]
          ]?.team.name;
        return `${teamName}: ${list.join(', ')}`;
      })
      .filter(Boolean)
      .join(' | ');
  };
</script>

<tr class={transaction.type}>
  <td>{transaction.date}</td>
  <td>{getTeams()}</td>
  <td>{transaction.type}</td>
  <td>{getBid()}</td>
  <td>{@html getDetails()}</td>
</tr>

<style>
  td {
    padding: 0.5rem 0.3rem;
    border-bottom: 1px solid var(--ddd);
    vertical-align: top;
  }

  tr.trade td {
    background: linear-gradient(90deg, var(--fff), var(--headerPrimary));
  }

  tr.waiver td {
    background: linear-gradient(90deg, var(--fff), var(--waiverAdd));
  }

  .addIcon {
    color: #00ceb8;
    font-size: 1rem;
    vertical-align: middle;
  }

  .dropIcon {
    color: #ff2a6d;
    font-size: 1rem;
    vertical-align: middle;
  }

  .tradeIcon {
    color: var(--blueTwo);
    font-size: 1rem;
    vertical-align: middle;
  }
</style>

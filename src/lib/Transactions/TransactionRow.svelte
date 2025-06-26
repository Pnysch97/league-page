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
    const items = [];
    for (const mv of transaction.moves) {
      for (const col of mv) {
        if (!col) continue;
        if (col.player) {
          const p = players[col.player];
          items.push(`${p.fn} ${p.ln}`);
        } else if (col.pick) {
          items.push(`${col.pick.season} R${col.pick.round}`);
        } else if (col.budget) {
          items.push(`${col.budget.amount}$`);
        }
      }
    }
    return items.join(', ');
  };
</script>

<tr>
  <td>{transaction.date}</td>
  <td>{getTeams()}</td>
  <td>{transaction.type}</td>
  <td>{getBid()}</td>
  <td>{getDetails()}</td>
</tr>

<style>
  td {
    padding: 0.5rem 0.3rem;
    border-bottom: 1px solid var(--ddd);
    vertical-align: top;
  }
</style>

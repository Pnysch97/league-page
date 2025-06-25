import { get } from 'svelte/store';
import {leagueData} from '$lib/stores';
import { leagueID } from '$lib/utils/leagueInfo';
import { safeFetch } from './universalFunctions';

export const getLeagueData = async (queryLeagueID = leagueID) => {
	if(get(leagueData)[queryLeagueID]) {
		return get(leagueData)[queryLeagueID];
	}
    const res = await safeFetch(`https://api.sleeper.app/v1/league/${queryLeagueID}`, {compress: true});
    if(!res) {
        return { error: 'Network request failed' };
    }
    const data = await res.json().catch((err) => { console.error(err); return null; });

    if (res.ok && data) {
        leagueData.update(ld => { ld[queryLeagueID] = data; return ld });
        return data;
    } else {
        throw new Error(data || 'Failed to load league data');
    }
}
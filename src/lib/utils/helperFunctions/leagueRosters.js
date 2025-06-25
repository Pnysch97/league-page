import { leagueID } from '$lib/utils/leagueInfo';
import { get } from 'svelte/store';
import {rostersStore} from '$lib/stores';
import { safeFetch } from './universalFunctions';

export const getLeagueRosters = async (queryLeagueID = leagueID) => {
	if(get(rostersStore)[queryLeagueID]) {
		return get(rostersStore)[queryLeagueID];
	}
    const res = await safeFetch(`https://api.sleeper.app/v1/league/${queryLeagueID}/rosters`, {compress: true});
    if(!res) {
        return { error: 'Network request failed' };
    }
    const data = await res.json().catch((err) => { console.error(err); return null; });
	
    if (res.ok && data) {
        const processedRosters = processRosters(data)
        rostersStore.update(r => {r[queryLeagueID] = processedRosters; return r});
        return processedRosters;
    } else {
        throw new Error(data || 'Failed to load rosters');
    }
}

const processRosters = (rosters) => {
	const startersAndReserve = [];
	for(const roster of rosters) {
		for(const starter of roster.starters) {
			startersAndReserve.push(starter);
		}
		if(roster.reserve) {
			for(const ir of roster.reserve) {
				startersAndReserve.push(ir);
			}
		}
	}
	return {rosters, startersAndReserve};
}
import { leagueID } from '$lib/utils/leagueInfo';
import { get } from 'svelte/store';
import {users} from '$lib/stores';
import { safeFetch } from './universalFunctions';

export const getLeagueUsers = async (queryLeagueID = leagueID) => {
	if(get(users)[queryLeagueID]) {
		return get(users)[queryLeagueID];
	}
        const res = await safeFetch(`https://api.sleeper.app/v1/league/${queryLeagueID}/users`, {compress: true});
        if(!res) {
                return { error: 'Network request failed' };
        }
        const data = await res.json().catch((err) => { console.error(err); return null; });
	
        if (res.ok && data) {
                const usersData = processUsers(data);
                users.update(u => {u[queryLeagueID] = usersData; return u});
                return usersData;
        } else {
                throw new Error(data || 'Failed to load users');
        }
}

const processUsers = (rawUsers) => {
	let finalUsers = {};
	for(const user of rawUsers) {
		finalUsers[user.user_id] = user;
	}
	return finalUsers;
}
import { json, error } from '@sveltejs/kit';
import { getPlayers } from '$lib/server/playersCache';

export async function GET({ params }) {
  const players = await getPlayers();
  const player = players[params.id];
  if (!player) {
    throw error(404, 'Player not found');
  }
  return json(player);
}

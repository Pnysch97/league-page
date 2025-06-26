import { json } from '@sveltejs/kit';
import { getPlayers } from '$lib/server/playersCache';

export async function GET() {
  const players = await getPlayers();
  return json(players);
}

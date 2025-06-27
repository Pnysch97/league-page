import { leagueID } from "$lib/utils/leagueInfo";
import { round } from "$lib/utils/helperFunctions/universalFunctions";
import { waitForAll } from "$lib/utils/helperFunctions/multiPromise";
import { error } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";

const CACHE_FILE = path.resolve("cache", "players.json");
const RAW_FILE = path.resolve("cache", "players_raw.json");
const CACHE_AGE = 24 * 60 * 60 * 1000; // one day

let cachedPlayers = null;
let cacheExpires = 0;
let fetchPromise = null;

export async function getPlayers() {
  const now = Date.now();
  if (cachedPlayers && now < cacheExpires) {
    return cachedPlayers;
  }
  if (fetchPromise) {
    return fetchPromise;
  }
  fetchPromise = loadPlayers(now);
  try {
    const players = await fetchPromise;
    return players;
  } finally {
    fetchPromise = null;
  }
}

async function loadPlayers(now) {
  try {
    const stat = await fs.stat(CACHE_FILE);
    const data = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
    const age = now - stat.mtimeMs;
    cachedPlayers = data;
    if (age < CACHE_AGE) {
      cacheExpires = stat.mtimeMs + CACHE_AGE;
      return data;
    }
    cacheExpires = now + 5 * 60 * 1000; // short expiry while refreshing
    refreshPlayers().catch((err) =>
      console.error("Failed background refresh", err)
    );
    return data;
  } catch {
    return refreshPlayers();
  }
}

async function refreshPlayers() {
  const now = Date.now();
  const [nflStateRes, leagueDataRes, playoffsRes] = await waitForAll(
    fetch("https://api.sleeper.app/v1/state/nfl", { compress: true }),
    fetch(`https://api.sleeper.app/v1/league/${leagueID}`, { compress: true }),
    fetch(`https://api.sleeper.app/v1/league/${leagueID}/winners_bracket`, {
      compress: true,
    })
  );

  const [nflState, leagueData, playoffs] = await waitForAll(
    nflStateRes.json(),
    leagueDataRes.json(),
    playoffsRes.json()
  );

  const playerData = await loadRawPlayers();

  let year = nflState.league_season;
  const regularSeasonLength = leagueData.settings.playoff_week_start - 1;
  const playoffLength = playoffs.pop().r;
  const fullSeasonLength = regularSeasonLength + playoffLength;

  const resPromises = [];
  for (let week = 1; week <= fullSeasonLength + 3; week++) {
    resPromises.push(
      fetch(
        `https://api.sleeper.app/projections/nfl/${year}/${week}?season_type=regular&position[]=DB&position[]=DEF&position[]=DL&position[]=FLEX&position[]=IDP_FLEX&position[]=K&position[]=LB&position[]=QB&position[]=RB&position[]=REC_FLEX&position[]=SUPER_FLEX&position[]=TE&position[]=WR&position[]=WRRB_FLEX&order_by=ppr`,
        { compress: true }
      )
    );
  }

  const responses = await waitForAll(...resPromises);

  const resJSONs = [];
  for (const res of responses) {
    if (!res.ok) {
      throw error(500, "No luck");
    }
    resJSONs.push(res.json());
  }

  const weeklyData = await waitForAll(...resJSONs);

  const players = computePlayers(playerData, weeklyData, leagueData.scoring_settings);
  cachedPlayers = players;
  cacheExpires = now + CACHE_AGE;
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(players));
  } catch {}
  return players;
}

async function loadRawPlayers() {
  const now = Date.now();
  try {
    const stat = await fs.stat(RAW_FILE);
    if (now - stat.mtimeMs < CACHE_AGE) {
      return JSON.parse(await fs.readFile(RAW_FILE, "utf8"));
    }
  } catch {}

  const res = await fetch("https://api.sleeper.app/v1/players/nfl", { compress: true });
  if (!res.ok) {
    throw error(500, "Failed to load players");
  }
  const data = await res.json();
  try {
    await fs.mkdir(path.dirname(RAW_FILE), { recursive: true });
    await fs.writeFile(RAW_FILE, JSON.stringify(data));
  } catch {}
  return data;
}

const computePlayers = (playerData, weeklyData, scoringSettings) => {
  const computedPlayers = {};
  for (const id in playerData) {
    const projPlayer = playerData[id];
    const player = {
      fn: projPlayer.first_name,
      ln: projPlayer.last_name,
      pos: projPlayer.position,
    };
    if (projPlayer.team) {
      player.t = projPlayer.team;
      player.wi = {};
    }
    if (projPlayer.team && projPlayer.injury_status) {
      player.is = projPlayer.injury_status;
    }
    computedPlayers[id] = player;
  }
  for (let week = 1; week <= weeklyData.length; week++) {
    for (const player of weeklyData[week - 1]) {
      const id = player.player_id;
      if (computedPlayers[id] == null || !computedPlayers[id].wi) continue;
      computedPlayers[id].wi[week] = {
        p: calculateProjection(player.stats, scoringSettings),
        o: player.opponent,
      };
    }
  }
  computedPlayers["OAK"] = computedPlayers["LV"];
  return computedPlayers;
};

const calculateProjection = (projectedStats, scoreSettings) => {
  let score = 0;
  for (const stat in projectedStats) {
    const multiplier = scoreSettings[stat] ? scoreSettings[stat] : 0;
    score += projectedStats[stat] * multiplier;
  }
  return round(score);
};

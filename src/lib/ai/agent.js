// Utility functions for generating articles using league data
import {
  getLeagueData,
  getLeagueRosters,
  getLeagueStandings,
  getNews,
} from "$lib/utils/helper";

/**
 * Gather basic league context for article generation.
 * Returns an object with league data, rosters, standings and news.
 */
export async function gatherLeagueContext() {
  const [league, rosters, standings, news] = await Promise.all([
    getLeagueData(),
    getLeagueRosters(),
    getLeagueStandings(),
    getNews(),
  ]);

  return { league, rosters, standings, news };
}

/**
 * Generate an article from the provided context.
 * This is a placeholder implementation.
 * Integrate your preferred LLM or API here (e.g. OpenAI).
 */
export async function generateArticle(context) {
  // TODO: call your LLM service with the context
  return `This is a placeholder article for league ${context.league?.name}`;
}

/**
 * Publish the generated article.
 * In production this might save to Contentful or another CMS.
 */
export async function publishArticle(article) {
  // TODO: implement publishing logic
  return article;
}

import { json } from "@sveltejs/kit";
import {
  gatherLeagueContext,
  generateArticle,
  publishArticle,
} from "$lib/ai/agent";

/**
 * Server endpoint to generate a new article.
 * Trigger with a POST request once integrated with your LLM provider.
 */
export async function POST() {
  const context = await gatherLeagueContext();
  const article = await generateArticle(context);
  const saved = await publishArticle(article);

  return json({ article: saved });
}

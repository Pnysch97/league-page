import { placeholderArticles } from '$lib/ai/articles';
import { error } from '@sveltejs/kit';

export function load({ params }) {
  const article = placeholderArticles.find((a) => a.slug === params.slug);
  if (!article) {
    throw error(404, 'Article not found');
  }
  return { article };
}

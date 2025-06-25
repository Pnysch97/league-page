import { get } from "svelte/store";
import { articles } from "$lib/stores";

export const getArticles = async (bypass = false) => {
  if (get(articles)[0] && !bypass) {
    return { articles: get(articles), fresh: false };
  }

  const res = await fetch("/api/getArticles", { compress: true }).catch(
    (err) => {
      console.error(err);
    },
  );
  if (!res || !res.ok) {
    const errText = res ? await res.text().catch(() => "") : "";
    console.error("Problem retrieving articles", errText);
    if (get(articles)[0]) {
      return { articles: get(articles), fresh: true };
    }
    return { articles: [], fresh: true };
  }

  const data = await res.json().catch((err) => {
    console.error(err);
  });
  articles.update(() => data.articles);
  return { articles: data.articles, fresh: true };
};

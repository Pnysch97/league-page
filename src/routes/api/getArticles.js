import { generateArticles } from "$lib/utils/helperFunctions/generateArticles";

export async function get() {
  try {
    const articles = await generateArticles();
    return {
      status: 200,
      body: JSON.stringify({ articles }),
    };
  } catch (err) {
    console.error(err);
    return {
      status: 500,
      body: JSON.stringify({ error: "Unable to generate articles" }),
    };
  }
}

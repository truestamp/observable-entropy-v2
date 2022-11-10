import { Command, ensureDirSync, isTooManyTries, retryAsync } from "../deps.ts";

import { fetchWithTimeout, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

const NUMBER_OF_STORIES = 5;

// Hacker News API: https://github.com/HackerNews/API
export async function hackerNews() {
  try {
    await retryAsync(
      async () => {
        console.log("hacker-news");

        const newsStories = await fetchWithTimeout(
          "https://hacker-news.firebaseio.com/v0/newstories.json",
        );

        if (newsStories.err) {
          throw new Error(`failed to fetch : status code ${newsStories.err}`);
        }

        const stories = [];

        for (let i = 0; i < NUMBER_OF_STORIES; i++) {
          const story = await fetchWithTimeout(
            `https://hacker-news.firebaseio.com/v0/item/${newsStories[i]}.json`,
          );
          if (story.err) {
            throw new Error(`failed to fetch : status code ${story.err}`);
          }

          const { by, id, time, title, url } = story;

          stories.push({ by, id, time, title, url });
        }

        ensureDirSync(ENTROPY_DIR);
        await writeCanonicalJSON(`${ENTROPY_DIR}/hacker-news.json`, {
          stories,
        });
      },
      { delay: 1000, maxTry: 3 },
    );
  } catch (error) {
    if (isTooManyTries(error)) {
      // Did not capture after 'maxTry' calls
      console.error(`hacker news : tooManyTries : ${error.message}`);
    } else {
      console.error(`hacker news : failed : ${error.message}`);
    }
  }
}

export const hackerNewsCommand = new Command()
  .description("Capture Hacker News.")
  .action(async () => {
    await hackerNews();
  });

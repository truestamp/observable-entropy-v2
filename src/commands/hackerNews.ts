import { Command, isTooManyTries, retryAsync } from "../deps.ts";

import { EntropyHackerNews, EntropyHackerNewsStory } from "../types.ts";
import { get, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

const NUMBER_OF_STORIES = 5;

// Hacker News API: https://github.com/HackerNews/API
export async function hackerNews() {
  try {
    await retryAsync(
      async () => {
        console.log("hacker-news");

        const newsStories = await get<number[]>(
          "https://hacker-news.firebaseio.com/v0/newstories.json",
        );

        const stories = [];

        for (let i = 0; i < NUMBER_OF_STORIES; i++) {
          const story: EntropyHackerNewsStory = await get<
            EntropyHackerNewsStory
          >(
            `https://hacker-news.firebaseio.com/v0/item/${newsStories[i]}.json`,
          );

          EntropyHackerNewsStory.parse(story);

          stories.push(story);
        }

        await writeCanonicalJSON(
          `${ENTROPY_DIR}/hacker-news.json`,
          EntropyHackerNews.parse({ stories }),
        );
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

import * as fs from "fs";
import { globby } from "globby";
import { LeetCode } from "./core/leetcode.js";
import { Notion } from "./core/notion.js";

(async function () {
  const notion = new Notion();
  const leetcode = new LeetCode();
  const { questions } = await leetcode.getAllQuestions();
  const {
    data: { id: databaseId },
  } = await notion.createDatabase();
  const paths = await globby("questions/", {
    expandDirectories: {
      files: ["*"],
      extensions: ["md"],
    },
  });

  paths.map(async (path) => {
    const promises = [];
    const content = fs.readFileSync(path, "utf-8");
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const removeDivide = line.substring(1, line.length - 1);
      const splitData = removeDivide.split("|");
      const titleNumber = splitData[0].match(/\[(.*)\]/);

      if (titleNumber) {
        const splitTitleNumber = titleNumber[1].split(".");
        const questionId = splitTitleNumber[0];

        if (Number.isInteger(parseInt(questionId))) {
          const tag = path.replace("questions/", "").replace(".md", "");
          const difficulty = splitData[2].trim();
          const rate = splitData[3].trim();
          const response = await notion.createQuestion(
            databaseId,
            questionId,
            questions,
            difficulty,
            tag,
            rate
          );
          promises.push(response);
        }
      }
    }
    await Promise.all(promises);
  });
})();

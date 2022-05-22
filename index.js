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
  const promisePath = [];
  let total = 0;

  for (const path of paths) {
    const promises = [];
    const content = await fs.readFileSync(path, "utf-8");
    const lines = content.split(/\r?\n/);
    total += lines.length;

    for (const line of lines) {
      const removeDivide = line.substring(1, line.length - 1);
      const splitData = removeDivide.split("|");
      const titleNumber = splitData[0].match(/\[(.*)\]/);
      const questionCNUrl = splitData[0].match(/\((.*)\)/);

      if (titleNumber) {
        const splitTitleNumber = titleNumber[1].split(".");
        const questionId = splitTitleNumber[0];
        const titleChinese = splitTitleNumber[1];

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
            rate,
            titleChinese,
            questionCNUrl[1].replace("-cn", "").replace(".com", ".cn")
          );
          promises.push(response);
        }
      }
    }
    promisePath.push(content);
    await Promise.all(promises);
  }

  await Promise.all(promisePath);

  console.log("Total Record: " + total);
})();

import axios from "axios";
import "dotenv/config";

export class Notion {
  constructor() {
    this.headers = {
      Accept: "application/json",
      "Notion-Version": process.env.NOTION_VERSION,
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    };
  }

  createDatabaseRequest() {
    return {
      properties: {
        "Completion Date": {
          name: "Completion Date",
          type: "formula",
          formula: {
            expression:
              '(prop("Completed") == true) ? now() : fromTimestamp(toNumber(""))',
          },
        },
        Id: {
          name: "ID",
          type: "number",
          number: {
            format: "number",
          },
        },
        Completed: {
          name: "Completed",
          type: "checkbox",
          checkbox: {},
        },
        Name: {
          id: "title",
          name: "Name",
          type: "title",
          title: {},
        },
        Difficulty: {
          name: "Difficulty",
          type: "select",
          select: {
            options: [
              {
                name: "困难",
                color: "red",
              },
              {
                name: "中等",
                color: "orange",
              },
              {
                name: "容易",
                color: "green",
              },
            ],
          },
        },
        Category: {
          name: "Category",
          type: "select",
          select: {
            options: [],
          },
        },
        Rate: {
          name: "Rate",
          type: "select",
          select: {
            options: [],
          },
        },
      },
      parent: {
        type: "page_id",
        page_id: process.env.NOTION_PAGE,
      },
    };
  }

  getQuestionsRequest(databaseId, questionId, question, difficulty, tag, rate) {
    console.log(question);
    return {
      properties: {
        Id: {
          number: parseInt(questionId),
        },
        Name: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: question.title,
                link: {
                  url: `https://leetcode.com/problems/${question.titleSlug}`,
                },
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: question.title,
              href: `https://leetcode.com/problems/${question.titleSlug}`,
            },
          ],
        },
        Difficulty: {
          select: {
            name: difficulty,
          },
        },
        Category: {
          select: {
            name: tag,
          },
        },
        Rate: {
          select: {
            name: rate,
          },
        },
      },
      parent: {
        database_id: databaseId,
      },
    };
  }

  async createDatabase() {
    return await axios
      .post(
        "https://api.notion.com/v1/databases/",
        this.createDatabaseRequest(),
        {
          headers: this.headers,
        }
      )
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return error;
      });
  }

  async createQuestion(
    databaseId,
    questionId,
    questions,
    difficulty,
    tag,
    rate
  ) {
    const promises = [];
    for (const question of questions) {
      if (question.frontendQuestionId == questionId) {
        try {
          const response = await axios.post(
            "https://api.notion.com/v1/pages",
            this.getQuestionsRequest(
              databaseId,
              questionId,
              question,
              difficulty,
              tag,
              rate
            ),
            {
              headers: this.headers,
            }
          );
          promises.push(response);
        } catch (e) {
          console.log("Error happened on Axios CreateQuestion:");
          console.log(e);
        }
      }
    }
    await Promise.all(promises);
  }
}

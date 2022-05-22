import axios from "axios";

export class LeetCode {
  constructor() {
    this.query = `query problemsetQuestionList(
        $categorySlug: String
        $limit: Int
        $skip: Int
        $filters: QuestionListFilterInput
    ) {
        problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
        ) {
            total: totalNum
            questions: data {
                acRate
                difficulty
                freqBar
                frontendQuestionId: questionFrontendId
                isFavor
                paidOnly: isPaidOnly
                status
                title
                titleSlug
                topicTags {
                    name
                    id
                    slug
                }
                hasSolution
                hasVideoSolution
            }
        }
    }`;

    this.data = JSON.stringify({
      query: this.query,
      variables: {
        categorySlug: "",
        skip: 0,
        limit: -1,
        filters: {},
      },
      operationName: "problemsetQuestionList",
    });

    this.config = {
      method: "post",
      url: "https://leetcode.com/graphql/",
      headers: {
        "content-type": "application/json",
      },
      data: this.data,
    };
  }

  async getAllQuestions() {
    return await axios(this.config)
      .then((response) => response.data.data.problemsetQuestionList)
      .catch((error) => console.log(error.toJSON()));
  }
}

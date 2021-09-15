import { DynamoDB } from "aws-sdk";

import createError from "http-errors";

import commonMiddleware from "utils/commonMiddleware";

const dynamoDb = new DynamoDB.DocumentClient();

async function getCats() {
  let catList = null;
  const params = {
    TableName: process.env.CAT_TABLE,
  };
  try {
    const response = await dynamoDb.scan(params).promise();
    catList = response.Items;
  } catch (error) {
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(catList),
  };
}

export const handler = commonMiddleware(getCats);

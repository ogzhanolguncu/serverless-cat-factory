import { APIGatewayEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import createError from "http-errors";

import commonMiddleware from "utils/commonMiddleware";

const dynamoDb = new DynamoDB.DocumentClient();

async function getCats(event: APIGatewayEvent) {
  const { id } = event.pathParameters as unknown as { id: string };
  const params = {
    TableName: process.env.CAT_TABLE,
    Key: { id },
  };

  let cat = null;

  try {
    const response = await dynamoDb.get(params).promise();
    if (!response.Item) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Cannot get an item that does not exist.",
        }),
      };
    }
    cat = response.Item;
  } catch (error) {
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(cat),
  };
}

export const handler = commonMiddleware(getCats);

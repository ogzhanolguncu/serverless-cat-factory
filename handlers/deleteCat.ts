import { APIGatewayEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import createError from "http-errors";

import commonMiddleware from "utils/commonMiddleware";

const dynamoDb = new DynamoDB.DocumentClient();

async function deleteCat(event: APIGatewayEvent) {
  const { id } = event.pathParameters as unknown as { id: string };
  const params = {
    TableName: process.env.CAT_TABLE,
    ReturnValues: "ALL_OLD",
    Key: { id },
  };

  try {
    const response = await dynamoDb.delete(params).promise();
    if (!response.Attributes) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Cannot delete an item that does not exist.",
        }),
      };
    }
  } catch (error) {
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Cat deleted successfully.",
    }),
  };
}

export const handler = commonMiddleware(deleteCat);

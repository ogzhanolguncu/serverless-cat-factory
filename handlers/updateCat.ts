import { APIGatewayEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import createError from "http-errors";

import commonMiddleware from "../utils/commonMiddleware";

const dynamoDb = new DynamoDB.DocumentClient();

async function updateCat(event: APIGatewayEvent) {
  const { id } = event.pathParameters as unknown as { id: string };
  const { age, color, name, specie } = event.body as any as Cat.Payload;

  const params = {
    TableName: process.env.CAT_TABLE,
    ReturnValues: "ALL_NEW",
    Key: { id },
    UpdateExpression:
      "SET specie = :specie, #name = :name, color = :color, age = :age, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":specie": specie,
      ":age": age,
      ":color": color,
      ":name": name,
      ":updatedAt": new Date().toISOString(),
    },
    ExpressionAttributeNames: {
      "#name": "name",
    },
  };

  try {
    const response = await dynamoDb.update(params).promise();
    if (!response.Attributes) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Cannot update a cat that does not exist.",
        }),
      };
    }
  } catch (error) {
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Cat updated successfully.",
    }),
  };
}

export const handler = commonMiddleware(updateCat);

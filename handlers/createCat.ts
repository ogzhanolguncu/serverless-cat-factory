import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import { nanoid } from "nanoid";
import createError from "http-errors";

import commonMiddleware from "utils/commonMiddleware";
import validator from "@middy/validator";
import { CatPayloadSchema } from "schemas/createCat";

const dynamoDb = new DynamoDB.DocumentClient();

async function createCat(event: APIGatewayProxyEvent) {
  const { age, color, name, specie } = event.body as any as Cat.CreatePayload;
  const timestamp = new Date().toISOString();

  const params = {
    TableName: process.env.CAT_TABLE,
    Item: {
      id: nanoid(),
      name,
      age,
      color,
      specie,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  try {
    await dynamoDb.put(params).promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(params.Item),
  };
}

export const handler = commonMiddleware(createCat).use(
  validator({
    inputSchema: CatPayloadSchema,
  })
);

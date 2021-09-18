import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

import { nanoid } from "nanoid";
import createError from "http-errors";
import validator from "@middy/validator";

import commonMiddleware from "utils/commonMiddleware";
import { CatPayloadSchema } from "schemas/createCat";
import { uploadPictureToS3 } from "lib/uploadPictureToS3";

const dynamoDb = new DynamoDB.DocumentClient();

async function createCat(event: APIGatewayProxyEvent) {
  const { age, color, name, specie } = event.body as any as Cat.Payload;
  const timestamp = new Date().toISOString();

  const base64 = (event.body as any).picture.replace(
    /^data:image\/\w+;base64,/,
    ""
  );
  const buffer = Buffer.from(base64, "base64");

  const id = nanoid();

  const pictureUrl = await uploadPictureToS3(id + ".jpg", buffer);

  const params = {
    TableName: process.env.CAT_TABLE,
    Item: {
      id,
      name,
      age,
      color,
      specie,
      createdAt: timestamp,
      updatedAt: timestamp,
      pictureUrl,
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

export const CatPayloadSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
        color: { type: "string" },
        specie: { type: "string" },
      },
      required: ["name", "age", "color", "specie"],
    },
  },
  required: ["body"],
} as const;

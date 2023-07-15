import { CustomError } from "./customError";

export const errorHandler = (error: unknown) => {
  const headers = { "content-type": "application/json" };

  if (error instanceof CustomError) {
    return {
      statusCode: error.statusCode,
      headers,
      body: JSON.stringify({ success: false, message: `Error - ${error.message}` }),
    };
  } else {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: "Error - Unknown error" }),
    };
  }
};

export const dispatchGet = (params: { [key: string]: string }): Object => {
  try {
    return {
      ...params,
    };
  } catch {
    return {
      code: `Error`,
      message: `Internal Server Error`,
    };
  }
};

export const dispatchPost = (contentType: string, rawJSON: string): Object => {
  try {
    return {
      contentType,
      body: analyzeJSON(rawJSON),
    };
  } catch {
    return {
      code: `Error`,
      message: `Internal Server Error`,
    };
  }
};

const doGet = (e: GoogleAppsScript.Events.DoGet) => {
  const { parameter: params } = e;
  return createJSONResponder(dispatchGet(params));
};

const doPost = (e: GoogleAppsScript.Events.DoPost) => {
  const { type: contentType, contents } = e.postData || {
    type: ``,
    contents: null,
  };
  return createJSONResponder(dispatchPost(contentType, contents));
};

const createJSONResponder = (
  data: any
): GoogleAppsScript.Content.TextOutput => {
  const response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  response.setContent(JSON.stringify(data));
  return response;
};

const analyzeJSON = (rawJSON: string): object | null => {
  try {
    return JSON.parse(rawJSON);
  } catch {
    return null;
  }
};

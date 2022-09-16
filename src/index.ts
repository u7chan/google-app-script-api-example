const doGet = (e: GoogleAppsScript.Events.DoGet) => {
  const { parameter: params } = e;
  const body = {
    params,
  };
  const response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  response.setContent(JSON.stringify(body));
  return response;
};

const doPost = (e: GoogleAppsScript.Events.DoPost) => {
  let body = {};
  try {
    const { type, contents } = e.postData || {
      type: ``,
      contents: null,
    };
    body = {
      contentType: type,
      request: analyzeJSON(contents),
    };
  } catch {
    body = {
      error: `Internal Server Error`,
    };
  }
  const response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  response.setContent(JSON.stringify(body));
  return response;
};

const analyzeJSON = (rawJSON: string): object | null => {
  try {
    return JSON.parse(rawJSON);
  } catch {
    return null;
  }
};

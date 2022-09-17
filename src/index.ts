// ----------------------------------------------------------------------------
// types
// ----------------------------------------------------------------------------

type ApiError = {
  code?: string;
  message?: string;
};

type Accounts = {
  id: string;
  name: string;
};

type Tasks = {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
};

type Resources = {
  accounts: Accounts;
  tasks: Tasks;
};

type Resource = keyof Resources;
const resourceKeys: string[] = ['accounts', 'tasks'] as Array<keyof Resources>;

type Result = ApiError | Accounts | Tasks;

// ----------------------------------------------------------------------------
// errors
// ----------------------------------------------------------------------------

class InvalidResourceError extends Error {
  constructor() {
    super();
    this.message = 'Invalid Resource';
  }
}

// ----------------------------------------------------------------------------
// dispatcher
// ----------------------------------------------------------------------------

export const dispatchGet = (params: { [key: string]: string }): Result => {
  try {
    const { path: resource = ``, ...rest } = params;
    return dataProvider(toResource(resource), rest);
  } catch (e: unknown) {
    const code = `Error`;
    let message = `Internal Server Error`;
    if (e instanceof InvalidResourceError) {
      message = e.message;
    }
    return {
      code,
      message,
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
      code: 'Error',
      message: 'Internal Server Error',
    };
  }
};

// ----------------------------------------------------------------------------
// api handler
// ----------------------------------------------------------------------------

const doGet = (e: GoogleAppsScript.Events.DoGet) => {
  const { parameter: params } = e;
  return createJSONResponder(dispatchGet(params));
};

const doPost = (e: GoogleAppsScript.Events.DoPost) => {
  const { type: contentType, contents } = e.postData || {
    type: '',
    contents: null,
  };
  return createJSONResponder(dispatchPost(contentType, contents));
};

// ----------------------------------------------------------------------------
// utils
// ----------------------------------------------------------------------------

const createJSONResponder = (
  data: Result
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

/**
 * @throws {InvalidResourceError}
 */
const toResource = (resource: string): Resource => {
  if (!resourceKeys.includes(resource)) {
    throw new InvalidResourceError();
  }
  return resource as Resource;
};

// ----------------------------------------------------------------------------
// data
// ----------------------------------------------------------------------------

type DataProvider = {
  read: <T extends Result>() => T;
  readMany: <T extends Result>() => T[];
  create: <T extends Result>(data: T) => void;
  delete: (resource: Resource, id: string) => void;
};

const dataProvider = <T extends Result>(
  resource: Resource,
  params: { [key: string]: string }
): T => {
  return {} as any; // TODO
};

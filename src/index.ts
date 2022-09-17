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
type Params = { [key: string]: string };

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

export const dispatchGet = (
  dataProvider: DataProvider,
  params: Params
): Result => {
  try {
    const { path: resource = '', ...rest } = params;
    return dataProvider.read(toResource(resource), rest);
  } catch (e: unknown) {
    const code = 'Error';
    let message = 'Internal Server Error';
    if (e instanceof InvalidResourceError) {
      message = e.message;
    } else {
      console.error(e);
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
  return createJSONResponder(dispatchGet(dataProvider, params));
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
  read: <T extends Result>(resource: Resource, params: Params) => T;
  create: <T extends Result>(data: T) => void;
  delete: (resource: Resource, id: string) => void;
};

const SpreadsheetProvider: DataProvider = {
  read: <T extends Result>(resource: Resource, params: Params): T => {
    throw new Error('Function not implemented.');
  },
  create: <T extends Result>(data: T): void => {
    throw new Error('Function not implemented.');
  },
  delete: (resource: keyof Resources, id: string): void => {
    throw new Error('Function not implemented.');
  },
};

const notImplementedMocks = {
  readMock: () => {
    throw new Error(`'readMock' not implemented.`);
  },
};

export const createMockProvider = (
  mocks: {
    readMock?: (resource: Resource, params: Params) => any;
  } = notImplementedMocks
): DataProvider => ({
  read: <T extends Result>(resource: Resource, params: Params): T => {
    return mocks.readMock(resource, params);
  },
  create: <T extends Result>(data: T): void => {
    throw new Error('Function not implemented.');
  },
  delete: (resource: keyof Resources, id: string): void => {
    throw new Error('Function not implemented.');
  },
});

const dataProvider: DataProvider = SpreadsheetProvider; // inject

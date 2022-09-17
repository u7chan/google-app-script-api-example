// ----------------------------------------------------------------------------
// api types
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
// api utils
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

// ----------------------------------------------------------------------------
// spreadsheet types
// ----------------------------------------------------------------------------

const ERROR_OPEN_SPREADSHEET_FAILED = `[ERROR] Open SpreadSheet Failed: "{0}"`;
const ERROR_OPEN_SHEET_FAILED = `[ERROR] Open Sheet Failed: "{0}"`;

type SpreadsheetFieldType = 'number' | 'string';

type SpreadsheetScheme = {
  field: string;
  fieldType: SpreadsheetFieldType;
};

// ----------------------------------------------------------------------------
// spreadsheet api
// ----------------------------------------------------------------------------

const getSpreadsheetRecords = <T>(
  fileName: string,
  sheetName: string,
  scheme: SpreadsheetScheme[]
) => {
  const spreadsheet = getSpreadsheetByName(fileName);
  if (!spreadsheet) {
    throw new Error(
      createErrorString(ERROR_OPEN_SPREADSHEET_FAILED, [fileName])
    );
  }
  const sheet = getSheetByName(spreadsheet, sheetName);
  if (!sheet) {
    throw new Error(createErrorString(ERROR_OPEN_SHEET_FAILED, [sheetName]));
  }
  return getSheetRecords<T>(sheet, scheme);
};

const toCast = (value: any, fieldType: SpreadsheetFieldType) => {
  switch (fieldType) {
    case 'number':
      return parseInt(value).toFixed();
    case 'string':
      return `${value}`;
  }
};

const getSheetRecords = <T>(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  sheetScheme: SpreadsheetScheme[]
): T[] => {
  return sheet
    .getDataRange()
    .getValues()
    .slice(1)
    .map((row) => {
      return sheetScheme
        .map(({ field, fieldType }, i) => ({
          [field]: toCast(row[i], fieldType),
        }))
        .reduce((preview, current) => ({ ...preview, ...current }), {} as T);
    });
};

// ----------------------------------------------------------------------------
// spreadsheet utils
// ----------------------------------------------------------------------------

/**
 * ファイル名でスプレッドシートのオブジェクトを取得する
 *
 * @param fileName ファイル名(拡張子を除く)
 * @returns スプレッドシートのオブジェクト / null
 */
const getSpreadsheetByName = (
  fileName: string
): GoogleAppsScript.Spreadsheet.Spreadsheet | null => {
  const files = DriveApp.getFilesByType(
    'application/vnd.google-apps.spreadsheet'
  );
  while (files.hasNext()) {
    const doc = files.next();
    if (doc.getName() === fileName) return SpreadsheetApp.open(doc);
  }
  return null;
};

/**
 * シート名からシートのオブジェクトを取得する
 *
 * @param spreadSheet スプレッドシート
 * @param sheetName シート名
 * @returns シートのオブジェクト / null
 */
const getSheetByName = (
  spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null,
  sheetName: string
): GoogleAppsScript.Spreadsheet.Sheet => {
  const result = spreadSheet
    .getSheets()
    .filter((sheet) => sheet.getName() == sheetName);
  return result.length > 0 ? result[0] : null;
};

/**
 * エラー文字列を生成する
 * 引数を埋め込む場合は、文字列中に波括弧を埋込む
 * (例) {0}={1}
 *
 * @param errorMessage エラーメッセージ
 * @param args エラーメッセージに埋め込む引数
 * @returns エラー文字列
 */
const createErrorString = (errorMessage: string, args: any[] = []): string => {
  let ret = errorMessage;
  args.forEach((value, index) => {
    ret = ret.replace(`{${index}}`, value);
  });
  return ret;
};

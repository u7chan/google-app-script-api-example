import { dispatchGet, createMockDataProvider } from '../index';

describe('dispatchGet', () => {
  it('params is empty', () => {
    // Given
    const params = {};
    const expected = { code: 'Error', message: 'Invalid Resource' };
    const dataProvider = createMockDataProvider();

    // When
    const actual = dispatchGet(dataProvider, params);

    // Then
    expect(actual).toStrictEqual(expected);
  });

  it('path is any', () => {
    // Given
    const params = { path: 'any' };
    const expected = { code: 'Error', message: 'Invalid Resource' };
    const dataProvider = createMockDataProvider();

    // When
    const actual = dispatchGet(dataProvider, params);

    // Then
    expect(actual).toStrictEqual(expected);
  });

  it('path is accounts', () => {
    // Given
    const expectedPath = 'accounts';
    const expectedAnyParams = { anyField: '#value' };
    const params = { path: expectedPath, ...expectedAnyParams };
    const readMock = jest.fn();
    const dataProvider = createMockDataProvider({
      readMock,
    });

    // When
    const actual = dispatchGet(dataProvider, params);

    // Then
    expect(readMock).toBeCalledTimes(1);
    expect(readMock).toBeCalledWith(expectedPath, expectedAnyParams);
  });
});

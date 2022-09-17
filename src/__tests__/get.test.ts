import { dispatchGet } from '../index';

describe('get.test', () => {
  it('params is empty', () => {
    // Given
    const params = {};
    const expected = { code: 'Error', message: 'Invalid Resource' };

    // When
    const actual = dispatchGet(params);

    // Then
    expect(actual).toStrictEqual(expected);
  });
});

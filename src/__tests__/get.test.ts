import { dispatchGet } from '../index';

describe('get.test', () => {
  it('params is empty', () => {
    // Given
    const expected = {};

    // When
    const actual = dispatchGet(expected);

    // Then
    expect(actual).toStrictEqual(expected);
  });
});

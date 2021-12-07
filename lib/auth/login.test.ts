import {describe, test} from '@jest/globals';
import {makeToken} from "./test-functions";
import {login} from "./login";
import {mockUser} from "../../fixtures/users";
import {getUserByEmail} from "./user";

jest.mock('./user', () => ({
  getUserByEmail: jest.fn(),
}));

jest.mock('./token', () => ({
  decodeToken: jest.fn(),
}));

describe('a user that exists', () => {
  describe('and is already logged in', () => {
    let user;
    beforeAll(async () => {
      const request = {cookies: {hackneyToken: makeToken({email: mockUser.email})}};
      (getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      user = await login(request);
    });

    test('the user name is retrieved', () => {
      expect(user).toHaveProperty('name', mockUser.name);
    });
  });
});

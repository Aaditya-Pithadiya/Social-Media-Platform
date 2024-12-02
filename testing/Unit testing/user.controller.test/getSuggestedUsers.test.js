// Unit tests for: getSuggestedUsers

import { User } from "../../models/user.model.js";
import { getSuggestedUsers } from '../user.controller';

// Mocking necessary modules
jest.mock("../../middlewares/Email.js", () => {
  const originalModule = jest.requireActual("../../middlewares/Email.js");
  return {
    __esModule: true,
    ...originalModule,
    SendVerificationCode: jest.fn(),
    welcomeEmail: jest.fn(),
  };
});

jest.mock("../../utils/datauri.js", () => {
  const originalModule = jest.requireActual("../../utils/datauri.js");
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(),
  };
});

jest.mock("mongoose", () => {
  const originalModule = jest.requireActual("mongoose");
  return {
    __esModule: true,
    ...originalModule,
    Types: {
      ObjectId: jest.fn().mockImplementation((id) => id),
    },
  };
});

jest.mock("axios");

describe('getSuggestedUsers() getSuggestedUsers method', () => {
  let req, res, next;

  beforeEach(() => {
    req = { id: 'userId123' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Happy paths', () => {
    it('should return a list of suggested users excluding the current user', async () => {
      // Arrange
      const mockUsers = [
        { _id: 'userId1', username: 'user1' },
        { _id: 'userId2', username: 'user2' },
      ];
      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });

      // Act
      await getSuggestedUsers(req, res, next);

      // Assert
      expect(User.find).toHaveBeenCalledWith({ _id: { $ne: req.id } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        users: mockUsers,
      });
    });
  });

  describe('Edge cases', () => {
    it('should return a 200 status with an empty list if no users are found', async () => {
      // Arrange
      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      // Act
      await getSuggestedUsers(req, res, next);

      // Assert
      expect(User.find).toHaveBeenCalledWith({ _id: { $ne: req.id } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        users: [],
      });
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const errorMessage = 'Database error';
      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error(errorMessage)),
      });

      // Act
      await getSuggestedUsers(req, res, next);

      // Assert
      expect(User.find).toHaveBeenCalledWith({ _id: { $ne: req.id } });
      expect(console.log).toHaveBeenCalledWith(new Error(errorMessage));
    });
  });
});

// End of unit tests for: getSuggestedUsers
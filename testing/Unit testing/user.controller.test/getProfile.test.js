import { Types } from "mongoose";
import { User } from "../../models/user.model.js";
import { getProfile } from '../user.controller';

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
      ObjectId: {
        isValid: jest.fn(),
      },
    },
  };
});

jest.mock("axios");

describe('getProfile() getProfile method', () => {
  let req, res, userId, user;

  beforeEach(() => {
    userId = '507f1f77bcf86cd799439011';
    req = { params: { id: userId } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    user = {
      _id: userId,
      username: 'testuser',
      email: 'test@example.com',
      posts: [],
      bookmarks: [],
    };
  });

  describe('Happy Paths', () => {
    it('should return user profile successfully when valid user ID is provided', async () => {
      // Arrange
      Types.ObjectId.isValid.mockReturnValue(true);
      User.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(user),
      });

      // Act
      await getProfile(req, res);

      // Assert
      expect(Types.ObjectId.isValid).toHaveBeenCalledWith(userId);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user,
        success: true,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should return 400 error when user ID is missing', async () => {
      // Arrange
      req.params.id = undefined;

      // Act
      await getProfile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or missing User ID',
        success: false,
      });
    });

    it('should return 400 error when user ID is invalid', async () => {
      // Arrange
      Types.ObjectId.isValid.mockReturnValue(false);

      // Act
      await getProfile(req, res);

      // Assert
      expect(Types.ObjectId.isValid).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or missing User ID',
        success: false,
      });
    });

    it('should return 500 error when an exception occurs', async () => {
      // Arrange
      Types.ObjectId.isValid.mockReturnValue(true);
      User.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act
      await getProfile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error.',
        success: false,
      });
    });
  });
});
// Unit tests for: forgotpassword


import { SendVerificationCode } from '../../middlewares/Email.js';
import { User } from "../../models/user.model.js";
import { forgotpassword } from '../user.controller';


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
  return {
    __esModule: true,
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

describe('forgotpassword() forgotpassword method', () => {
  let req, res, user;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@example.com',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    user = {
      email: 'test@example.com',
      isVerified: true,
      save: jest.fn(),
    };

    User.findOne = jest.fn().mockResolvedValue(user);
  });

  describe('Happy paths', () => {
    it('should send OTP if email is found and verified', async () => {
      // Test to ensure OTP is sent when email is found and verified
      await forgotpassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(user.save).toHaveBeenCalled();
      expect(SendVerificationCode).toHaveBeenCalledWith('test@example.com', expect.any(String));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'OTP sent to your email.', success: true });
    });
  });

  describe('Edge cases', () => {
    it('should return 400 if email is not provided', async () => {
      // Test to ensure 400 status is returned when email is not provided
      req.body.email = '';

      await forgotpassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email is required.', success: false });
    });

    it('should return 400 if email is not found or not verified', async () => {
      // Test to ensure 400 status is returned when email is not found or not verified
      User.findOne = jest.fn().mockResolvedValue(null);

      await forgotpassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email not found or not verified.', success: false });
    });

    it('should handle internal server error', async () => {
      // Test to ensure 500 status is returned on internal server error
      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      await forgotpassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error.', success: false });
    });
  });
});

// End of unit tests for: forgotpassword

// Unit tests for: Verifyotp


import bcrypt from "bcryptjs";
import { User } from "../../models/user.model.js";
import { Verifyotp } from '../user.controller';


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

describe('Verifyotp() Verifyotp method', () => {
  let req, res, userMock;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@example.com',
        otp: '123456',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    userMock = {
      email: 'test@example.com',
      verificationCode: '123456',
      save: jest.fn(),
    };

    User.findOne = jest.fn().mockResolvedValue(userMock);
    bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
  });

  describe('Happy Paths', () => {
    it('should verify OTP and change password successfully', async () => {
      // Test for successful OTP verification and password change
      await Verifyotp(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com', verificationCode: '123456' });
      expect(bcrypt.hash).toHaveBeenCalledWith('Password@123', 15);
      expect(userMock.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password changed successfully.', success: true });
    });
  });

  describe('Edge Cases', () => {
    it('should return error if email, otp, password, or confirmPassword is missing', async () => {
      // Test for missing fields
      req.body.email = '';
      await Verifyotp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required.', success: false });
    });

    it('should return error if OTP is invalid', async () => {
      // Test for invalid OTP
      User.findOne = jest.fn().mockResolvedValue(null);
      await Verifyotp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid OTP.', success: false });
    });

    it('should return error if passwords do not match', async () => {
      // Test for password mismatch
      req.body.confirmPassword = 'DifferentPassword';
      await Verifyotp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Passwords do not match.', success: false });
    });

    it('should return error if password does not meet criteria', async () => {
      // Test for password criteria
      req.body.password = 'weakpass';
      req.body.confirmPassword = 'weakpass';
      await Verifyotp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password must meet the required criteria.',
        success: false,
      });
    });

    it('should handle internal server error', async () => {
      // Test for internal server error
      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));
      await Verifyotp(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error.', success: false });
    });
  });
});

// End of unit tests for: Verifyotp
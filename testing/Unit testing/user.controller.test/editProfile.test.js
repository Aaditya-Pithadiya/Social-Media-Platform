// Unit tests for: editProfile

import { Types } from "mongoose";
import { User } from "../../models/user.model.js";
import cloudinary from "../../utils/cloudinary.js";
import getDataUri from "../../utils/datauri.js";
import { editProfile } from '../user.controller';

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

describe('editProfile() editProfile method', () => {
  let req, res, user;

  beforeEach(() => {
    req = {
      id: 'validUserId',
      body: {
        bio: 'New bio',
        gender: 'Other',
      },
      file: {
        originalname: 'profile.jpg',
        buffer: Buffer.from('image data'),
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    user = {
      _id: 'validUserId',
      bio: 'Old bio',
      gender: 'Male',
      profilePicture: 'oldProfilePicUrl',
      save: jest.fn(),
    };

    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });
    getDataUri.mockReturnValue('dataUri');
    cloudinary.uploader.upload = jest.fn().mockResolvedValue({ secure_url: 'newProfilePicUrl' });
    Types.ObjectId.isValid.mockReturnValue(true);
  });

  describe('Happy Paths', () => {
    it('should update the user profile successfully', async () => {
      // Test to ensure the profile is updated successfully
      await editProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith(req.id);
      expect(getDataUri).toHaveBeenCalledWith(req.file);
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith('dataUri');
      expect(user.bio).toBe(req.body.bio);
      expect(user.gender).toBe(req.body.gender);
      expect(user.profilePicture).toBe('newProfilePicUrl');
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Profile updated.',
        success: true,
        user,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should return 400 if userId is invalid', async () => {
      // Test to ensure invalid userId returns 400
      Types.ObjectId.isValid.mockReturnValue(false);

      await editProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or missing User ID',
        success: false,
      });
    });

    it('should return 404 if user is not found', async () => {
      // Test to ensure user not found returns 404
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await editProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found.',
        success: false,
      });
    });

    it('should handle errors gracefully', async () => {
      // Test to ensure errors are handled gracefully
      const error = new Error('Database error');
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(error),
      });

      await editProfile(req, res);

      expect(res.status).not.toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveBeenCalledWith({
        message: 'Profile updated.',
        success: true,
        user,
      });
    });
  });
});

// End of unit tests for: editProfile
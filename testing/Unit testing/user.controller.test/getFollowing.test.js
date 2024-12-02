// Unit tests for: getFollowing

import mongoose from 'mongoose';
import { getFollowing } from '../../controllers/user.controller.js';
import { User } from "../../models/user.model.js";

// Mock setup
jest.mock("../../models/user.model.js", () => ({
    User: {
        findById: jest.fn()
    }
}));

describe('getFollowing() getFollowing method', () => {
    let req, res, userId;

    beforeEach(() => {
        jest.clearAllMocks();
        
        userId = new mongoose.Types.ObjectId().toString();
        req = { 
            params: { id: userId } 
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Happy paths', () => {
        it('should return the list of following users when user is found', async () => {
            // Arrange
            const mockFollowing = [
                { username: 'user1', profilePicture: 'pic1.jpg' },
                { username: 'user2', profilePicture: 'pic2.jpg' }
            ];

            User.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    following: mockFollowing
                })
            });

            // Act
            await getFollowing(req, res);

            // Assert
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                following: mockFollowing
            });
        });
    });

    describe('Edge cases', () => {
        it('should return 404 if user is not found', async () => {
            // Arrange
            User.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            // Act
            await getFollowing(req, res);

            // Assert
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        it('should handle errors gracefully and return 500', async () => {
            // Arrange
            const dbError = new Error('Database error');
            User.findById.mockReturnValue({
                populate: jest.fn().mockRejectedValue(dbError)
            });

            // Act
            await getFollowing(req, res);

            // Assert
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Error fetching following',
                error: dbError
            });
        });

        it('should return 404 if userId is invalid', async () => {
            // Arrange
            req.params.id = 'invalidUserId';
            User.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            // Act
            await getFollowing(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });
    });
});
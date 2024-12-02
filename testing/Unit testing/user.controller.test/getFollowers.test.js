// Unit tests for: getFollowers

import mongoose from 'mongoose';
import { User } from "../../models/user.model.js";
import { getFollowers } from '../../controllers/user.controller.js';

// Mock setup
jest.mock("../../models/user.model.js", () => ({
    User: {
        findById: jest.fn()
    }
}));

describe('getFollowers() getFollowers method', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        
        req = {
            params: {
                id: new mongoose.Types.ObjectId().toString()
            }
        };
        
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Happy paths', () => {
        it('should return followers of a user when user is found', async () => {
            // Arrange
            const mockFollowers = [
                { username: 'follower1', profilePicture: 'pic1.jpg' },
                { username: 'follower2', profilePicture: 'pic2.jpg' }
            ];

            User.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue({
                    followers: mockFollowers
                })
            });

            // Act
            await getFollowers(req, res);

            // Assert
            expect(User.findById).toHaveBeenCalledWith(req.params.id);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                followers: mockFollowers
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
            await getFollowers(req, res);

            // Assert
            expect(User.findById).toHaveBeenCalledWith(req.params.id);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        it('should handle errors gracefully and return 500', async () => {
            // Arrange
            User.findById.mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error('Database error'))
            });

            // Act
            await getFollowers(req, res);

            // Assert
            expect(User.findById).toHaveBeenCalledWith(req.params.id);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Error fetching followers',
                error: expect.any(Error)
            });
        });

        it('should return 404 if user ID is invalid', async () => {
            // Arrange
            req.params.id = 'invalid-id';
            User.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            // Act
            await getFollowers(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });
    });
});
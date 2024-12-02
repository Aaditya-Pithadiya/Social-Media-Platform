// Unit tests for: searchUsers

import { searchUsers } from '../../controllers/user.controller.js';
import { User } from "../../models/user.model.js";

jest.mock("../../models/user.model.js", () => ({
    User: {
        find: jest.fn().mockReturnThis(),
        select: jest.fn()
    }
}));

describe('searchUsers() searchUsers method', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('Happy Paths', () => {
        it('should return a list of users matching the search query', async () => {
            // Arrange
            const mockUsers = [
                { username: 'johnDoe', profilePicture: 'url1' },
                { username: 'johnSmith', profilePicture: 'url2' }
            ];
            req.query.query = 'john';
            
            User.find.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUsers)
            });

            // Act
            await searchUsers(req, res);

            // Assert
            expect(User.find).toHaveBeenCalledWith({
                username: { $regex: '^john', $options: 'i' }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                users: mockUsers
            });
        });
    });

    describe('Edge Cases', () => {
        it('should return a 400 error if no search query is provided', async () => {
            // Act
            await searchUsers(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Search query is required"
            });
        });

        it('should return an empty list if no users match the search query', async () => {
            // Arrange
            req.query.query = 'nonexistent';
            User.find.mockReturnValue({
                select: jest.fn().mockResolvedValue([])
            });

            // Act
            await searchUsers(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                users: []
            });
        });

        it('should handle errors gracefully and return a 500 status', async () => {
            // Arrange
            req.query.query = 'error';
            User.find.mockReturnValue({
                select: jest.fn().mockRejectedValue(new Error('Database error'))
            });

            // Act
            await searchUsers(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Error searching users"
            });
        });
    });
});
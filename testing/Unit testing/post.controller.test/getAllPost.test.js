import { Post } from "../../models/post.model.js";
import { User } from "../../models/user.model.js";
import { getAllPost } from "../../controllers/post.controller.js";

// Mock setup
jest.mock("../../models/post.model.js", () => ({
    Post: {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis()
    }
}));

jest.mock("../../models/user.model.js", () => ({
    User: {
        findById: jest.fn().mockReturnValue({
            select: jest.fn()
        })
    }
}));

describe('getAllPost() getAllPost method', () => {
    let req, res, userId, mockUser, mockPosts;

    beforeEach(() => {
        jest.clearAllMocks();
        
        userId = 'user123';
        req = { id: userId };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        
        mockUser = {
            _id: userId,
            following: ['user456', 'user789']
        };
        
        mockPosts = [
            {
                _id: 'post1',
                author: { username: 'user456', profilePicture: 'pic1' },
                comments: []
            },
            {
                _id: 'post2',
                author: { username: 'user123', profilePicture: 'pic2' },
                comments: []
            }
        ];
    });

    describe('Happy Paths', () => {
        it('should return posts from followed users and self', async () => {
            // Arrange
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            Post.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockPosts)
            });

            // Act
            await getAllPost(req, res);

            // Assert
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(Post.find).toHaveBeenCalledWith({
                author: { $in: [...mockUser.following, userId] }
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                posts: mockPosts,
                success: true
            });
        });
    });

    describe('Edge Cases', () => {
        it('should return 404 if user is not found', async () => {
            // Arrange
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            // Act
            await getAllPost(req, res);

            // Assert
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User not found',
                success: false
            });
        });

        it('should handle errors gracefully and return 500', async () => {
            // Arrange
            const error = new Error('Database error');
            User.findById.mockReturnValue({
                select: jest.fn().mockRejectedValue(error)
            });

            // Act
            await getAllPost(req, res);

            // Assert
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Error retrieving posts',
                success: false
            });
        });
    });
});
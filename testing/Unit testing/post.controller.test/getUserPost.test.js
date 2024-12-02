import { Post } from "../../models/post.model.js";
import { getUserPost } from "../../controllers/post.controller.js";

// Mock setup
jest.mock("../../models/post.model.js", () => ({
    Post: {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis()
    }
}));

describe('getUserPost() getUserPost method', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { id: 'user123' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Happy paths', () => {
        it('should return posts for a valid user', async () => {
            // Arrange
            const mockPosts = [
                { _id: 'post1', author: { username: 'user1', profilePicture: 'pic1' }, comments: [] },
                { _id: 'post2', author: { username: 'user1', profilePicture: 'pic1' }, comments: [] }
            ];

            Post.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockPosts)
            });

            // Act
            await getUserPost(req, res);

            // Assert
            expect(Post.find).toHaveBeenCalledWith({ author: req.id });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                posts: mockPosts,
                success: true
            });
        });
    });

    describe('Edge cases', () => {
        it('should handle no posts found for the user', async () => {
            // Arrange
            Post.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([])
            });

            // Act
            await getUserPost(req, res);

            // Assert
            expect(Post.find).toHaveBeenCalledWith({ author: req.id });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                posts: [],
                success: true
            });
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            Post.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockRejectedValue(new Error('Database error'))
            });

            // Act
            await getUserPost(req, res);

            // Assert
            expect(Post.find).toHaveBeenCalledWith({ author: req.id });
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Error retrieving posts',
                success: false
            });
        });
    });
});
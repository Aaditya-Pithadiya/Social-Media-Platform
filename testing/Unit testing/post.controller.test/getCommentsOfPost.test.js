import { Comment } from "../../models/comment.model.js";
import { getCommentsOfPost } from "../../controllers/post.controller.js";

// Mock setup
jest.mock("../../models/comment.model.js", () => ({
    Comment: {
        find: jest.fn().mockReturnThis(),
        populate: jest.fn()
    }
}));

describe('getCommentsOfPost() getCommentsOfPost method', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: { id: 'post123' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Setup default mock implementation
        Comment.find.mockReturnThis();
        Comment.populate.mockResolvedValue([
            { 
                _id: '1', 
                text: 'Great post!', 
                author: { username: 'user1', profilePicture: 'pic1' } 
            },
            { 
                _id: '2', 
                text: 'Nice!', 
                author: { username: 'user2', profilePicture: 'pic2' } 
            }
        ]);
    });

    describe('Happy paths', () => {
        it('should return comments for a valid post ID', async () => {
            await getCommentsOfPost(req, res);

            expect(Comment.find).toHaveBeenCalledWith({ post: 'post123' });
            expect(Comment.populate).toHaveBeenCalledWith('author', 'username profilePicture');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                comments: expect.any(Array)
            });
        });
    });

    describe('Edge cases', () => {
        it('should return 404 if no comments are found', async () => {
            Comment.populate.mockResolvedValue([]);

            await getCommentsOfPost(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'No comments found for this post',
                success: false
            });
        });

        it('should handle errors gracefully', async () => {
            Comment.populate.mockRejectedValue(new Error('Database error'));

            await getCommentsOfPost(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Internal server error',
                success: false
            });
        });
    });
});
import { Comment } from "../../models/comment.model.js";
import { Post } from "../../models/post.model.js";
import { User } from "../../models/user.model.js";
import { deletePost } from "../../controllers/post.controller.js";

// Mock setup
jest.mock("../../models/post.model.js", () => ({
    Post: {
        findById: jest.fn(),
        findByIdAndDelete: jest.fn()
    }
}));

jest.mock("../../models/user.model.js", () => ({
    User: {
        findById: jest.fn()
    }
}));

jest.mock("../../models/comment.model.js", () => ({
    Comment: {
        deleteMany: jest.fn()
    }
}));

describe('deletePost() deletePost method', () => {
    let req, res, mockPost, mockUser;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: { id: 'postId' },
            id: 'authorId'
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockPost = {
            _id: 'postId',
            author: {
                toString: () => 'authorId'
            }
        };

        mockUser = {
            _id: 'authorId',
            posts: ['postId'],
            save: jest.fn().mockResolvedValue(true)
        };
    });

    describe('Happy Paths', () => {
        it('should delete a post successfully', async () => {
            Post.findById.mockResolvedValue(mockPost);
            User.findById.mockResolvedValue(mockUser);
            Post.findByIdAndDelete.mockResolvedValue(true);
            Comment.deleteMany.mockResolvedValue(true);

            await deletePost(req, res);

            expect(Post.findById).toHaveBeenCalledWith('postId');
            expect(Post.findByIdAndDelete).toHaveBeenCalledWith('postId');
            expect(User.findById).toHaveBeenCalledWith('authorId');
            expect(mockUser.save).toHaveBeenCalled();
            expect(Comment.deleteMany).toHaveBeenCalledWith({ post: 'postId' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Post deleted'
            });
        });
    });

    describe('Edge Cases', () => {
        it('should return 404 if post is not found', async () => {
            Post.findById.mockResolvedValue(null);

            await deletePost(req, res);

            expect(Post.findById).toHaveBeenCalledWith('postId');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post not found',
                success: false
            });
        });

        it('should return 403 if user is not the author of the post', async () => {
            mockPost.author.toString = () => 'differentAuthorId';
            Post.findById.mockResolvedValue(mockPost);

            await deletePost(req, res);

            expect(Post.findById).toHaveBeenCalledWith('postId');
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Unauthorized'
            });
        });

        it('should handle errors gracefully', async () => {
            Post.findById.mockRejectedValue(new Error('Database error'));

            await deletePost(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Internal server error',
                success: false
            });
        });
    });
});
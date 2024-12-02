import { Comment } from "../../models/comment.model.js";
import { Post } from "../../models/post.model.js";
import { addComment } from '../post.controller'; // Import the addComment function

jest.mock("../../models/post.model.js");
jest.mock("../../models/comment.model.js");
jest.mock("../../models/user.model.js");

describe('addComment() addComment method', () => {
    let req, res, post, comment;

    beforeEach(() => {
        req = {
            params: { id: 'postId' },
            id: 'userId',
            body: { text: 'This is a comment' }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        post = {
            comments: [],
            save: jest.fn()
        };

        comment = {
            _id: 'commentId', // Add an _id property to the comment object
            populate: jest.fn().mockResolvedValue({
                author: { username: 'testuser', profilePicture: 'url' }
            })
        };

        Post.findById.mockResolvedValue(post);
        Comment.create.mockResolvedValue(comment);
    });

    describe('Happy paths', () => {
        it('should add a comment to a post successfully', async () => {
            // Test that a comment is added successfully
            await addComment(req, res);

            expect(Post.findById).toHaveBeenCalledWith('postId');
            expect(Comment.create).toHaveBeenCalledWith({
                text: 'This is a comment',
                author: 'userId',
                post: 'postId'
            });
            expect(comment.populate).toHaveBeenCalledWith({
                path: 'author',
                select: 'username profilePicture'
            });
            expect(post.comments).toContain(comment._id);
            expect(post.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Comment Added',
                comment: expect.any(Object),
                success: true
            });
        });
    });

    describe('Edge cases', () => {
        it('should return 400 if text is not provided', async () => {
            // Test that a 400 error is returned if text is missing
            req.body.text = '';

            await addComment(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'text is required',
                success: false
            });
        });

        it('should handle post not found scenario', async () => {
            // Test that a 404 error is returned if the post is not found
            Post.findById.mockResolvedValue(null);

            await addComment(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Post not found',
                success: false
            });
        });

        it('should handle errors gracefully', async () => {
            // Test that errors are handled gracefully
            const error = new Error('Database error');
            Post.findById.mockRejectedValue(error);

            await addComment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Internal server error',
                success: false
            });
        });
    });
});
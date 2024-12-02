// Unit tests for: followOrUnfollow

import { followOrUnfollow } from '../../controllers/user.controller.js';
import { User } from "../../models/user.model.js";

jest.mock("../../models/user.model.js");

describe('followOrUnfollow() followOrUnfollow method', () => {
    let req, res, userHimself, userBeingFollowed;

    beforeEach(() => {
        userHimself = 'user1';
        userBeingFollowed = 'user2';
        req = {
            id: userHimself,
            params: { id: userBeingFollowed }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Happy Paths', () => {
        it('should follow a user successfully', async () => {
            // Setup mock data
            const user = { following: [], save: jest.fn() };
            const targetUser = { followers: [], save: jest.fn() };

            User.findById
                .mockResolvedValueOnce(user)
                .mockResolvedValueOnce(targetUser);

            // Execute the function
            await followOrUnfollow(req, res);

            // Simulate the follow action
            user.following.push(userBeingFollowed);
            targetUser.followers.push(userHimself);

            // Verify the results
            expect(User.findById).toHaveBeenCalledWith(userHimself);
            expect(User.findById).toHaveBeenCalledWith(userBeingFollowed);
            expect(user.following).toContain(userBeingFollowed);
            expect(targetUser.followers).toContain(userHimself);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'followed successfully', success: true });
        });

        it('should unfollow a user successfully', async () => {
            // Setup mock data
            const user = { following: [userBeingFollowed], save: jest.fn() };
            const targetUser = { followers: [userHimself], save: jest.fn() };

            User.findById
                .mockResolvedValueOnce(user)
                .mockResolvedValueOnce(targetUser);

            // Execute the function
            await followOrUnfollow(req, res);

            // Simulate the unfollow action
            user.following = user.following.filter(id => id !== userBeingFollowed);
            targetUser.followers = targetUser.followers.filter(id => id !== userHimself);

            // Verify the results
            expect(User.findById).toHaveBeenCalledWith(userHimself);
            expect(User.findById).toHaveBeenCalledWith(userBeingFollowed);
            expect(user.following).not.toContain(userBeingFollowed);
            expect(targetUser.followers).not.toContain(userHimself);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Unfollowed successfully', success: true });
        });
    });

    describe('Edge Cases', () => {
        it('should not allow a user to follow/unfollow themselves', async () => {
            req.params.id = userHimself;

            // Execute the function
            await followOrUnfollow(req, res);

            // Verify the results
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        });

        it('should return an error if the user or target user is not found', async () => {
            User.findById.mockResolvedValueOnce(null);

            // Execute the function
            await followOrUnfollow(req, res);

            // Verify the results
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User not found',
                success: false
            });
        });

        it('should handle database errors gracefully', async () => {
            User.findById.mockRejectedValueOnce(new Error('Database error'));

            // Execute the function
            await followOrUnfollow(req, res);

            // Verify the results
            expect(res.status).not.toHaveBeenCalledWith(200);
            expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });
});

// End of unit tests for: followOrUnfollow
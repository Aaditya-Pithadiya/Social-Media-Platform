import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Post } from "../../models/post.model.js";
import { User } from "../../models/user.model.js";
import { login } from '../user.controller';

jest.mock("../../models/user.model.js");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../models/post.model.js");

describe('login() login method', () => {
    let req, res, user;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'Password123!'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn().mockReturnThis()
        };
        user = {
            _id: new mongoose.Types.ObjectId().toString(), // Mock ObjectId as a string
            username: 'testuser',
            email: 'test@example.com',
            password: 'hashedPassword',
            isVerified: true,
            posts: ['postId1', 'postId2']
        };
    });

    describe('Happy Paths', () => {
        it('should login successfully with correct credentials', async () => {
            // Mocking dependencies
            User.findOne.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('token123');
            Post.findById.mockResolvedValue({
                author: new mongoose.Types.ObjectId(user._id), // Correct instantiation of ObjectId
            });

            // Execute the login function
            await login(req, res);

            // Assertions
            expect(res.cookie).toHaveBeenCalledWith('token', 'token123', expect.any(Object));
            expect(res.json).toHaveBeenCalledWith({
                message: `Welcome back ${user.username}`,
                success: true,
                user: expect.objectContaining({
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                }),
            });
        });
    });

    describe('Edge Cases', () => {
        it('should return 401 if email is missing', async () => {
            req.body.email = '';

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Something is missing, please check!",
                success: false
            });
        });

        it('should return 401 if password is missing', async () => {
            req.body.password = '';

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Something is missing, please check!",
                success: false
            });
        });

        it('should return 401 if user is not found', async () => {
            User.findOne.mockResolvedValue(null);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Incorrect email or password",
                success: false
            });
        });

        it('should return 401 if user is not verified', async () => {
            user.isVerified = false;
            User.findOne.mockResolvedValue(user);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "User is not Verified !!!!!",
                success: false
            });
        });

        it('should return 401 if password does not match', async () => {
            User.findOne.mockResolvedValue(user);
            bcrypt.compare.mockResolvedValue(false);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Incorrect password",
                success: false
            });
        });

        it('should handle unexpected errors gracefully', async () => {
            User.findOne.mockRejectedValue(new Error('Unexpected error'));

            await login(req, res);

            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
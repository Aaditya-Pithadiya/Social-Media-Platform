import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { SendVerificationCode, welcomeEmail } from '../middlewares/Email.js'

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const ExistUser = await User.findOne({ email });
        if (ExistUser) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        };
        const hashedPassword = await bcrypt.hash(password, 15);
        const verificationCode = Math.floor(100000 + Math.random()*900000).toString()
        const user = new User({
            email,
            password : hashedPassword,
            username,
            verificationCode
        })

        await user.save()
        SendVerificationCode(user.email,verificationCode)

        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
            user
        });
    } catch (error) {
        console.log(error);
    }
}

export const Verifyemail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        console.log(otp);

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and code are required" });
        }

        // Find user by email and verification code
        const user = await User.findOne({ email, verificationCode: otp });

        if (!user) {
            // If no user is found with the given email and code, delete the unverified user with that email
            await User.deleteOne({ email, isVerified: false });
            return res.status(400).json({ success: false, message: "Invalid or expired code. User removed from database." });
        }

        // If the code is correct, verify the user
        user.isVerified = true;
        user.verificationCode = undefined; // Clear the verification code after successful verification
        await user.save();
        await welcomeEmail(user.email, user.name);

        return res.status(200).json({ success: true, message: "Email verified!" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect password",
                success: false,
            });
        };

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        const populatedPosts = await Promise.all(
            user.posts.map( async (postId) => {
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )

        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: user.posts
        }
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};

export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path:'posts', createdAt:-1}).populate('bookmarks');
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};
export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
};

export const followOrUnfollow = async (req, res) => {
    try {
        const userHimself = req.id;
        const userBeingFollowed = req.params.id;
        if (userHimself === userBeingFollowed) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        }

        const user = await User.findById(userHimself);
        const targetUser = await User.findById(userBeingFollowed);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }

        const isFollowing = user.following.includes(userBeingFollowed);

        if (isFollowing) {
            await Promise.all([
                User.updateOne({ _id: userHimself }, { $pull: { following: userBeingFollowed } }),
                User.updateOne({ _id: userBeingFollowed }, { $pull: { followers: userHimself } }),
            ])
            return res.status(200).json({ message: 'Unfollowed successfully', success: true });
        } else {
            await Promise.all([
                User.updateOne({ _id: userHimself }, { $push: { following: userBeingFollowed } }),
                User.updateOne({ _id: userBeingFollowed }, { $push: { followers: userHimself } }),
            ])
            return res.status(200).json({ message: 'followed successfully', success: true });
        }
        
    } catch (error) {
        console.log(error);
    }
}
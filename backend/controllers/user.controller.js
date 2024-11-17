import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { SendVerificationCode, welcomeEmail } from '../middlewares/Email.js';
import { Types } from "mongoose";

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required.", success: false });
        }

        if (!/^[a-zA-Z0-9]+$/.test(username) ) {
            return res.status(400).json({
                message: "Username can only contain letters and numbers.",
                success: false,
            });
        }
        if(username.length > 15){
            return res.status(400).json({
                message : "Username can be of max length 15.",
                success : false
            })
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long, include a number, special character, uppercase, and lowercase letter.",
                success: false,
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use.", success: false });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already in use.", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 15);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        const user = new User({
            email,
            username,
            password: hashedPassword,
            verificationCode,
            verificationExpires
        });

        await user.save();
        SendVerificationCode(user.email, verificationCode);

        return res.status(201).json({
            message: "Account created successfully. Please verify your email.",
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error.", success: false });
    }
};

export const Verifyemail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required.", success: false });
        }

        const user = await User.findOne({ email, verificationCode: otp });

        if (!user || Date.now() > user.verificationExpires) {
            await User.deleteOne({ email, isVerified: false });
            return res.status(400).json({
                message: "Invalid or expired code. User has been removed.",
                success: false,
            });
        }

        user.isVerified = true;
        user.verificationExpires = null;
        user.verificationCode = undefined;
        await user.save();

        welcomeEmail(user.email, user.username);

        return res.status(200).json({ message: "Email verified successfully!", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error.", success: false });
    }
};

export const forgotpassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required.", success: false });
        }

        const user = await User.findOne({ email });

        if (!user || !user.isVerified) {
            return res.status(400).json({ message: "Email not found or not verified.", success: false });
        }

        user.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        SendVerificationCode(user.email, user.verificationCode);

        return res.status(200).json({ message: "OTP sent to your email.", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error.", success: false });
    }
};

export const Verifyotp = async (req, res) => {
    try {
        const { email, otp, password, confirmPassword } = req.body;

        if (!email || !otp || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required.", success: false });
        }

        const user = await User.findOne({ email, verificationCode: otp });

        if (!user || Date.now() > user.verificationExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP.", success: false });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match.", success: false });
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(password)) {
            return res.status(400).json({
                message: "Password must meet the required criteria.",
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 15);
        user.password = hashedPassword;
        user.verificationCode = undefined;
        user.verificationExpires = null;
        await user.save();

        return res.status(200).json({ message: "Password changed successfully.", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error.", success: false });
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

        const populatedPosts = (await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);
                if (post && post.author && post.author.equals(user._id)) {
                    return post;
                }
                return null;
            })
        )).filter(post => post !== null);

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
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000  }).json({
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

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                error: "Invalid or missing User ID",
                success: false
            });
        }

        let user = await User.findById(userId).populate({ path: 'posts', createdAt: -1 }).populate('bookmarks');
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error.", success: false });
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (!userId  || !Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                error: "Invalid or missing User ID",
                success: false
            });
        }

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



export const searchUsers = async (req, res) => {
    try {
      const { query } = req.query;
  
      if (!query) {
        return res.status(400).json({ success: false, message: "Search query is required" });
      }
  
      const users = await User.find({
        username: { $regex: `^${query}`, $options: 'i' }
      }).select('username profilePicture');
  
      res.status(200).json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error searching users" });
    }
  };


 export const getFollowers = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id).populate('followers', 'username profilePicture');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, followers: user.followers });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching followers', error });
    }
  };
  
  // Fetch following of a user
 export const getFollowing = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id).populate('following', 'username profilePicture');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.status(200).json({ success: true, following: user.following });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching following', error });
    }
  };
  
  

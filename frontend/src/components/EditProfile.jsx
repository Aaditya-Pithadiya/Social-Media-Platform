import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { setAuthUser } from '../redux/authSlice';

const EditProfile = () => {
    const imageRef = useRef();
    const { user } = useSelector(store => store.auth);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        profilePhoto: user?.profilePicture,
        bio: user?.bio,
        gender: user?.gender
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) setInput({ ...input, profilePhoto: file });
    }

    const selectChangeHandler = (value) => {
        setInput({ ...input, gender: value });
    }

    const editProfileHandler = async () => {
        const formData = new FormData();
        formData.append("bio", input.bio);
        formData.append("gender", input.gender);
        if (input.profilePhoto) {
            formData.append("profilePhoto", input.profilePhoto);
        }
 
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8000/api/v1/user/profile/edit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            if (res.data.success) {
                const updatedUserData = {
                    ...user,
                    bio: res.data.user?.bio,
                    profilePicture: res.data.user?.profilePicture,
                    gender: res.data.user.gender
                };
                dispatch(setAuthUser(updatedUserData));
                navigate(`/profile/${user?._id}`);
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex max-w-2xl mx-auto p-8 bg-gray-50 rounded-lg shadow-md mt-12'>
            <section className='flex flex-col gap-6 w-full'>
                <h1 className='font-bold text-2xl text-purple-600'>Edit Profile</h1>
                <div className='flex items-center justify-between bg-gray-200 rounded-lg p-4'>
                    <div className='flex items-center gap-3'>
                        <Avatar>
                            <AvatarImage src={user?.profilePicture} alt="profile_image" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className='font-semibold text-gray-700'>{user?.username}</h1>
                            <span className='text-sm text-gray-600'>{user?.bio || 'Bio here...'}</span>
                        </div>
                    </div>
                    <input ref={imageRef} onChange={fileChangeHandler} type='file' className='hidden' />
                    <Button onClick={() => imageRef?.current.click()} className='bg-purple-600 text-white hover:bg-purple-700 rounded-md'>
                        Change photo
                    </Button>
                </div>
                <div>
                    <h1 className='font-semibold text-lg text-gray-700 mb-2'>Bio</h1>
                    <Textarea
                        value={input.bio}
                        onChange={(e) => setInput({ ...input, bio: e.target.value })}
                        name='bio'
                        className="focus:ring-transparent focus:border-purple-500 text-gray-800"
                        placeholder="Write something about yourself"
                    />
                </div>
                <div>
                    <h1 className='font-semibold text-lg text-gray-700 mb-2'>Gender</h1>
                    <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
                        <SelectTrigger className="w-full border-gray-300 focus:border-purple-500">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex justify-end mt-4'>
                    {loading ? (
                        <Button className='w-full bg-purple-600 text-white hover:bg-purple-700'>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please wait
                        </Button>
                    ) : (
                        <Button onClick={editProfileHandler} className='w-full bg-purple-600 text-white hover:bg-purple-700'>
                            Submit
                        </Button>
                    )}
                </div>
            </section>
        </div>
    )
}

export default EditProfile;

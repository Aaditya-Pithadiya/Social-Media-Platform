import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setPosts } from '../redux/postSlice';

const useGetAllPost = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/v1/post/all', {
                    withCredentials: true
                });

                if (response.data.success) {
                    dispatch(setPosts(response.data.posts));
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, [dispatch]);
};

export default useGetAllPost;

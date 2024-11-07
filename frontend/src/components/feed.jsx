import React from 'react';
import Posts from './Posts';

const  Feed = () => {
    return (
        <div className='flex flex-col items-center my-8 pl-[10%]'>
           <Posts/>
        </div>
    );
};

export default  Feed;
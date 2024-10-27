import React from 'react'
import { assets } from '../assets/assets'

const Result = () => {
  return (
    <div className='mx-4 my-3 lg:mx-44 mt-14 min-h-[75vh]'>
    <div className='bg-white rounded-lg px-8 py-6 drop-shadow-sm'>
      {/*---Image Container---*/}
      <div className='flex flex-col sm:grid grid-cols-2 gap-8'>
        {/*--- Left Side ---*/}
        <div>
            <p className='font-semibold text-gray-600 mb-2'>Original</p>
            <img className='rounded-md border' src={assets.image_w_bg} alt="" />
        </div>
        {/* --- Right Side--- */}
        <div className='font-semibold text-gray-600 mb-2'>
        <p className='font-semibold text-gray-600 mb-2'>Background Removed</p>
        <div className='rounded-md border border-gray-300 h-full relative bg-layer overflow-hidden'>
        <img src={assets.image_wo_bg} alt="" />

        </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Result

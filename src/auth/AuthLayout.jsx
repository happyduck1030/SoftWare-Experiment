import React from 'react'
import { Outlet } from 'react-router'
import bgimg from '../../public/assets/images/bg.png'

const AuthLayout = () => {
  return (
    <>
      <section className='flex flex-1 justify-center items-center flex-col py-10 bg-purple-900'>
        <Outlet />
      </section>
    <img src={bgimg} alt="bg" className=' hidden h-screen xl:block w-1/2 object-cover'/>

    </>
  )
}

export default AuthLayout
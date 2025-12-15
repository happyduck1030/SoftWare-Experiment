import { useState } from 'react'
import './index.css'
import { Route, Routes } from 'react-router-dom'
import AuthLayout from './auth/AuthLayout'
import SignupForm from './auth/forms/SignupForm'
import LoginForm from './auth/forms/LoginForm'
import AdminHome from './admin/layout/AdminHome'
import EmployeeHome from './employee/layout/EmployeeHome'
import Pixel404 from './employee/pages/Pixel404'

function App() {

  return (
    <>
      <main className='flex h-screen w-screen'>
        
        <Routes>
          <Route element={<AuthLayout />}> 
          <Route path='/signup' element={<SignupForm />} />
          <Route path='/' element={<LoginForm />} />
          </Route>
          <Route path='/admin/*' element={<AdminHome />}/>
          <Route path='/employee/*' element={<EmployeeHome />}/>
          <Route path='/404' element={<Pixel404 />} />
          <Route path='*' element={<Pixel404 />} />
        </Routes>
      </main>
    </>
  )
}

export default App

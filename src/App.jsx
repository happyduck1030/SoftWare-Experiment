import { useState } from 'react'
import './index.css'
import { Route, Routes } from 'react-router-dom'
import AuthLayout from './auth/AuthLayout'
import SignupForm from './auth/forms/SignupForm'
import LoginForm from './auth/forms/LoginForm'
import AdminHome from './admin/layout/AdminHome'
import EmployeeHome from './employee/layout/EmployeeHome'

function App() {

  return (
    <>
      <main className='flex h-screen'>
        
        <Routes>
          <Route element={<AuthLayout />}> 
          <Route path='/signup' element={<SignupForm />} />
          <Route path='/' element={<LoginForm />} />
          </Route>
          <Route path='/admin/*' element={<AdminHome />}/>
          <Route path='/employee/*' element={<EmployeeHome />}/>
        </Routes>
      </main>
    </>
  )
}

export default App

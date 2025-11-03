import { useState } from 'react'
import './index.css'
import { Route, Routes } from 'react-router-dom'
import AuthLayout from './auth/AuthLayout'
import SignupForm from './auth/forms/SignupForm'
import LoginForm from './auth/forms/LoginForm'
function App() {

  return (
    <>
      <main className='flex h-screen'>
        
        <Routes>
          <Route element={<AuthLayout />}> 
          <Route path='/signup' element={<SignupForm />} />
          <Route path='/' element={<LoginForm />} />
          </Route>
        </Routes>
      </main>
    </>
  )
}

export default App

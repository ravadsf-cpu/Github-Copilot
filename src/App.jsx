import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import NesPage from './pages/NesPage'

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/nes" element={<NesPage/>} />
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p>Not found</p>
            <a href="/" className="text-cleary-300 underline">Home</a>
          </div>
        </div>
      } />
    </Routes>
  )
}
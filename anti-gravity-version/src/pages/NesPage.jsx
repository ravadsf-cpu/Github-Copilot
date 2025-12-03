import React from 'react'
import NesApp from '../components/NesApp'
import { Link } from 'react-router-dom'

export default function NesPage(){
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#021026] to-[#00070a] p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-white">Cleary — NES Mode</h1>
          <p className="text-sm text-gray-400 mt-1">A retro NES-style UI demo inside Cleary.</p>
          <div className="mt-3">
            <Link to="/" className="text-cleary-300 underline text-sm">← Back to Home</Link>
          </div>
        </header>

        <NesApp />
      </div>
    </div>
  )
}
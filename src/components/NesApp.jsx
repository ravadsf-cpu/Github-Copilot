import React, { useState, useEffect } from 'react'

// Simple NES-style app: a tiny interactive UI that mimics old NES look and feel.
// No external APIs. Drop-in React component using Tailwind for styling.

const initialScreen = {
  title: 'CLEARY NES',
  menu: ['Start', 'Settings', 'About'],
}

export default function NesApp() {
  const [screen, setScreen] = useState('menu')
  const [cursor, setCursor] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    function onKey(e) {
      if (screen !== 'menu') return
      if (e.key === 'ArrowUp') setCursor((c) => Math.max(0, c - 1))
      if (e.key === 'ArrowDown') setCursor((c) => Math.min(initialScreen.menu.length - 1, c + 1))
      if (e.key === 'Enter') handleSelect(cursor)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, cursor])

  function handleSelect(index) {
    const choice = initialScreen.menu[index]
    if (choice === 'Start') {
      setScreen('game')
      setMessage('Starting...
Press B to go back')
    } else if (choice === 'Settings') {
      setScreen('settings')
    } else if (choice === 'About') {
      setScreen('about')
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <div className="bg-[#0b1220] border-4 border-gray-800 rounded-lg shadow-lg p-4 font-mono text-xs text-[#e6eef8]">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-bold">{initialScreen.title}</div>
          <div className="text-xs text-gray-400">PWR 12%</div>
        </div>

        {screen === 'menu' && (
          <div>
            <div className="mb-3">Select Option:</div>
            <ul>
              {initialScreen.menu.map((m, i) => (
                <li key={m} className={`flex items-center gap-2 py-1 ${i === cursor ? 'text-yellow-300' : 'text-gray-300'}`}> 
                  <span className={`w-4 ${i === cursor ? 'text-yellow-300' : 'text-gray-600'}`}>{i === cursor ? '▶' : ' '}</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-gray-500">Use ↑ ↓ and Enter to navigate</div>
          </div>
        )}

        {screen === 'game' && (
          <div className="mt-2">
            <div className="text-sm font-semibold text-green-300">GAME MODE</div>
            <div className="mt-2 p-3 bg-black/30 rounded">
              <div className="text-xs">You are in a demo NES environment. This area can be replaced with any interactive mini-app, video or AI-driven experience.</div>
              <div className="mt-2 text-sm text-gray-200">{message}</div>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 bg-yellow-400 text-black rounded" onClick={() => { setScreen('menu'); setMessage('') }}>B: Back</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setMessage('You pressed A! (demo)')}>A: Action</button>
            </div>
          </div>
        )}

        {screen === 'settings' && (
          <div className="mt-2">
            <div className="font-semibold">Settings</div>
            <div className="mt-2 text-gray-300">Theme: NES Classic</div>
            <div className="mt-2">
              <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={() => setScreen('menu')}>Back</button>
            </div>
          </div>
        )}

        {screen === 'about' && (
          <div className="mt-2">
            <div className="font-semibold">About Cleary NES</div>
            <div className="mt-2 text-gray-300">A playful demo within Cleary to capture the feel of an NES UI. Press Back to return.</div>
            <div className="mt-2">
              <button className="px-3 py-1 bg-gray-700 text-white rounded" onClick={() => setScreen('menu')}>Back</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
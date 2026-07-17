import { useState } from 'react'
import AuthModal from './components/AuthModal'
import Header from './components/Header'
import './App.css'

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(
    window.location.pathname === '/login',
  )

  const openAuth = () => {
    window.history.pushState({}, '', '/login')
    setIsAuthOpen(true)
  }

  const closeAuth = () => {
    window.history.pushState({}, '', '/')
    setIsAuthOpen(false)
  }

  return (
    <>
      <Header onAuthClick={openAuth} />
      {isAuthOpen && <AuthModal onClose={closeAuth} />}
    </>
  )
}

export default App

import { useState } from 'react'
import Header from './components/Header'
import LoginModal from './components/LoginModal'
import './App.css'

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(
    window.location.pathname === '/login',
  )

  const openLogin = () => {
    window.history.pushState({}, '', '/login')
    setIsLoginOpen(true)
  }

  const closeLogin = () => {
    window.history.pushState({}, '', '/')
    setIsLoginOpen(false)
  }

  return (
    <>
      <Header onLoginClick={openLogin} />
      {isLoginOpen && <LoginModal onClose={closeLogin} />}
    </>
  )
}

export default App

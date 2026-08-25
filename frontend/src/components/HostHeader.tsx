import { useState } from 'react'
import type { AuthUser } from '../stores/authStore'
import UserProfileMenu from './UserProfileMenu'
import logo from '../assets/logo.png'
import './HostHeader.css'

type HostHeaderProps = {
  user: AuthUser
  pathname: string
  onLogout: () => Promise<void>
  onNavigate: (path: string) => void
}

const hostMenus = [
  { label: '대시보드', path: '/host/dashboard' },
  { label: '숙소 관리', path: '/host/properties' },
  { label: '객실 관리', path: '/host/rooms' },
  { label: '예약 관리', path: '/host/reservations' },
]

function HostHeader({ user, pathname, onLogout, onNavigate }: HostHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigate = (path: string) => {
    onNavigate(path)
    setIsMenuOpen(false)
  }

  const isActive = (path: string) =>
    path === '/host/dashboard'
      ? pathname === path
      : pathname === path || pathname.startsWith(`${path}/`)

  return (
    <header className="host-header">
      <nav className="host-header-inner" aria-label="호스트 메뉴">
        <button
          type="button"
          className="host-header-brand"
          aria-label="TripFlow Host 대시보드"
          onClick={() => navigate('/host/dashboard')}
        >
          <img src={logo} alt="TripFlow" />
          <span>Host</span>
        </button>

        <button
          type="button"
          className="host-header-menu-button"
          aria-label={isMenuOpen ? '호스트 메뉴 닫기' : '호스트 메뉴 열기'}
          aria-expanded={isMenuOpen}
          aria-controls="host-header-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          id="host-header-menu"
          className={`host-header-menu${isMenuOpen ? ' is-open' : ''}`}
        >
          <div className="host-header-links">
            {hostMenus.map((menu) => (
              <button
                type="button"
                key={menu.path}
                className={isActive(menu.path) ? 'is-active' : ''}
                aria-current={isActive(menu.path) ? 'page' : undefined}
                onClick={() => navigate(menu.path)}
              >
                {menu.label}
              </button>
            ))}
          </div>

          <div className="host-header-actions">
            <button
              type="button"
              className="host-traveler-mode-button"
              onClick={() => navigate('/')}
            >
              여행자 모드로 전환
            </button>

            <UserProfileMenu
              user={user}
              items={[{ label: '마이페이지', onSelect: () => navigate('/mypage') }]}
              onLogout={onLogout}
            />
          </div>
        </div>
      </nav>
    </header>
  )
}

export default HostHeader

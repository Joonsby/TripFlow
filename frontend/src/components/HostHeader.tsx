import { useEffect, useState } from 'react'
import type { AuthUser } from '../stores/authStore'
import { lockBodyScroll } from '../utils/bodyScrollLock'
import UserProfileMenu from './UserProfileMenu'
import logo from '../assets/logo.png'
import dashboardIcon from '../assets/host-nav-dashboard.png'
import propertyIcon from '../assets/host-nav-property.png'
import roomIcon from '../assets/host-nav-room.png'
import reservationIcon from '../assets/host-nav-reservation.png'
import moreIcon from '../assets/host-nav-more.png'
import './HostHeader.css'

type HostHeaderProps = {
  user: AuthUser
  pathname: string
  onLogout: () => Promise<void>
  onNavigate: (path: string) => void
}

const hostMenus = [
  { label: '대시보드', path: '/host/dashboard', icon: dashboardIcon },
  { label: '숙소 관리', path: '/host/properties', icon: propertyIcon },
  { label: '객실 관리', path: '/host/rooms', icon: roomIcon },
  { label: '예약 관리', path: '/host/reservations', icon: reservationIcon },
]

function HostHeader({ user, pathname, onLogout, onNavigate }: HostHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  useEffect(() => {
    if (!isMenuOpen) return

    const unlockBodyScroll = lockBodyScroll()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      unlockBodyScroll()
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMoreOpen) return
    const unlockBodyScroll = lockBodyScroll()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMoreOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      unlockBodyScroll()
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isMoreOpen])

  const navigate = (path: string) => {
    onNavigate(path)
    setIsMenuOpen(false)
    setIsMoreOpen(false)
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

        <button
          type="button"
          className={`host-header-backdrop${isMenuOpen ? ' is-open' : ''}`}
          aria-label="호스트 메뉴 닫기"
          tabIndex={isMenuOpen ? 0 : -1}
          onClick={() => setIsMenuOpen(false)}
        />

        <div
          id="host-header-menu"
          className={`host-header-menu${isMenuOpen ? ' is-open' : ''}`}
        >
          <div className="host-sidebar-heading">
            <div>
              <img src={logo} alt="" />
              <strong>호스트 메뉴</strong>
            </div>
            <button type="button" aria-label="호스트 메뉴 닫기" onClick={() => setIsMenuOpen(false)}>×</button>
          </div>

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
              items={[{ label: '호스트 마이페이지', onSelect: () => navigate('/host/profile') }]}
              onLogout={onLogout}
            />
          </div>
        </div>
      </nav>
      <nav className="host-bottom-nav" aria-label="호스트 모바일 메뉴">
        {hostMenus.map((menu) => (
          <button
            type="button"
            key={menu.path}
            className={isActive(menu.path) ? 'is-active' : ''}
            aria-current={isActive(menu.path) ? 'page' : undefined}
            onClick={() => navigate(menu.path)}
          >
            <img className="host-bottom-icon" src={menu.icon} alt="" aria-hidden="true" />
            <small>{menu.label.replace(' 관리', '')}</small>
          </button>
        ))}
        <button
          type="button"
          className={isMoreOpen || pathname === '/host/profile' ? 'is-active' : ''}
          aria-expanded={isMoreOpen}
          aria-controls="host-more-sheet"
          onClick={() => setIsMoreOpen(true)}
        >
          <img className="host-bottom-icon" src={moreIcon} alt="" aria-hidden="true" />
          <small>더보기</small>
        </button>
      </nav>
      <button
        type="button"
        className={`host-more-backdrop${isMoreOpen ? ' is-open' : ''}`}
        aria-label="더보기 메뉴 닫기"
        tabIndex={isMoreOpen ? 0 : -1}
        onClick={() => setIsMoreOpen(false)}
      />
      <section id="host-more-sheet" className={`host-more-sheet${isMoreOpen ? ' is-open' : ''}`} aria-hidden={!isMoreOpen} aria-label="호스트 더보기 메뉴">
        <div className="host-more-handle" aria-hidden="true" />
        <div className="host-more-sheet-heading">
          <div className="account-avatar" aria-hidden="true">{user.name.trim().charAt(0) || '?'}</div>
          <div><strong>{user.name}</strong><span>{user.email}</span></div>
          <button type="button" aria-label="더보기 메뉴 닫기" onClick={() => setIsMoreOpen(false)}>×</button>
        </div>
        <div className="host-more-actions">
          <button type="button" onClick={() => navigate('/host/profile')}><span>내</span><div><strong>호스트 마이페이지</strong><small>계정 정보 확인 및 관리</small></div></button>
          <button type="button" onClick={() => navigate('/')}><span>여</span><div><strong>여행자 모드로 전환</strong><small>숙소 검색 화면으로 이동</small></div></button>
          <button type="button" className="is-logout" onClick={() => { setIsMoreOpen(false); void onLogout() }}><span>나</span><div><strong>로그아웃</strong><small>현재 계정에서 로그아웃</small></div></button>
        </div>
      </section>
    </header>
  )
}

export default HostHeader

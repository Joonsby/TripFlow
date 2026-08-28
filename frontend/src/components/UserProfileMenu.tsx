import { useEffect, useRef, useState } from 'react'
import type { AuthUser } from '../stores/authStore'
import SidebarActionButton from './SidebarActionButton'
import './UserProfileMenu.css'

export type UserProfileMenuItem = {
  label: string
  onSelect: () => void
  className?: string
}

type UserProfileMenuProps = {
  user: AuthUser
  items: UserProfileMenuItem[]
  onLogout: () => Promise<void>
  logoutLabel?: string
  loggingOutLabel?: string
}

function UserProfileMenu({
  user,
  items,
  onLogout,
  logoutLabel = '로그아웃',
  loggingOutLabel = '로그아웃 중...',
}: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  const selectItem = (item: UserProfileMenuItem) => {
    setIsOpen(false)
    item.onSelect()
  }

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setIsOpen(false)
    try {
      await onLogout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <SidebarActionButton
        type="button"
        className="profile-button"
        isActive={isOpen}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="profile-avatar" aria-hidden="true">
          {user.name.trim().charAt(0) || '?'}
        </span>
        <span className="profile-name">{user.name}</span>
        <svg className="profile-chevron" viewBox="0 0 20 20" aria-hidden="true">
          <path d="m6 8 4 4 4-4" />
        </svg>
      </SidebarActionButton>

      {isOpen && (
        <div className="profile-dropdown" role="menu">
          {items.map((item) => (
            <button
              type="button"
              role="menuitem"
              key={item.label}
              className={item.className}
              onClick={() => selectItem(item)}
            >
              {item.label}
            </button>
          ))}
          <span className="profile-dropdown-divider" aria-hidden="true" />
          <button
            type="button"
            role="menuitem"
            className="profile-logout"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
          >
            {isLoggingOut ? loggingOutLabel : logoutLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export default UserProfileMenu

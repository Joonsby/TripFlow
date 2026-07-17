import { useEffect, useRef, useState } from 'react'
import logo from '../assets/logo.png'
import './Header.css'

type Theme = 'light' | 'dark'

type Language = {
  code: string
  label: string
}

const languages: Language[] = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
]

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)

const formatDate = (date: Date) => date.toISOString().slice(0, 10)

type HeaderProps = {
  onAuthClick?: () => void
}

function Header({ onAuthClick }: HeaderProps) {
  const [theme, setTheme] = useState<Theme>('light')
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (!isMobileMenuOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false)
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return

      const isInsidePanel = mobileMenuPanelRef.current?.contains(event.target)
      const isMenuButton = mobileMenuButtonRef.current?.contains(event.target)

      if (!isInsidePanel && !isMenuButton) {
        setIsMobileMenuOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)
    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (!isLanguageOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !languageMenuRef.current?.contains(event.target)
      ) {
        setIsLanguageOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isLanguageOpen])

  const isDarkMode = theme === 'dark'

  return (
    <header className="site-header">
      <nav className="header-nav" aria-label="주요 메뉴">
        <a className="header-logo" href="/" aria-label="TripFlow 홈">
          <img src={logo} alt="TripFlow" />
        </a>

        <button
          ref={mobileMenuButtonRef}
          type="button"
          className="mobile-menu-button"
          aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-header-menu"
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        >
          <span />
          <span />
          <span />
        </button>

        <button
          type="button"
          className={`mobile-menu-backdrop${isMobileMenuOpen ? ' is-open' : ''}`}
          aria-label="메뉴 닫기"
          tabIndex={isMobileMenuOpen ? 0 : -1}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div
          ref={mobileMenuPanelRef}
          id="mobile-header-menu"
          className={`header-menu-panel${isMobileMenuOpen ? ' is-open' : ''}`}
        >
          <a className="sidebar-logo" href="/" aria-label="TripFlow 홈">
            <img src={logo} alt="TripFlow" />
          </a>

        <form className="header-search" aria-label="숙소 검색">
          <label className="search-field">
            <span>위치</span>
            <input type="text" name="location" placeholder="어디로 떠나나요?" />
          </label>

          <label className="search-field">
            <span>체크인</span>
            <input type="date" name="checkIn" defaultValue={formatDate(today)} />
          </label>

          <label className="search-field">
            <span>체크아웃</span>
            <input
              type="date"
              name="checkOut"
              defaultValue={formatDate(tomorrow)}
            />
          </label>

          <label className="search-field search-field-guests">
            <span>인원</span>
            <input
              type="number"
              name="guests"
              min="1"
              max="15"
              defaultValue="2"
            />
          </label>

          <button className="search-button" type="submit">
            검색
          </button>
        </form>

        <div className="header-actions" aria-label="사용자 메뉴">
          <button
            type="button"
            className="auth-link auth-link-primary"
            onClick={() => {
              setIsMobileMenuOpen(false)
              onAuthClick?.()
            }}
          >
            로그인 또는 회원가입
          </button>

          <div className="language-menu" ref={languageMenuRef}>
            <button
              type="button"
              className="language-button"
              aria-label={`언어 선택: ${selectedLanguage.label}`}
              aria-haspopup="listbox"
              aria-expanded={isLanguageOpen}
              onClick={() => setIsLanguageOpen((isOpen) => !isOpen)}
            >
              <svg
                className="header-action-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
              </svg>
              <span className="mobile-action-label">
                언어 선택: {selectedLanguage.label}
              </span>
            </button>

            {isLanguageOpen && (
              <div className="language-list" role="listbox">
                {languages.map((language) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedLanguage.code === language.code}
                    className="language-option"
                    key={language.code}
                    onClick={() => {
                      setSelectedLanguage(language)
                      setIsLanguageOpen(false)
                    }}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="theme-toggle"
            aria-label={isDarkMode ? '화이트 모드로 변경' : '다크 모드로 변경'}
            aria-pressed={isDarkMode}
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          >
            {isDarkMode ? (
              <svg
                className="header-action-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
              </svg>
            ) : (
              <svg
                className="header-action-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            )}
            <span className="mobile-action-label">
              {isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            </span>
          </button>
        </div>
        </div>
      </nav>

    </header>
  )
}

export default Header

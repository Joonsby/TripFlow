import type { AuthUser } from '../stores/authStore'
import './AccountPages.css'

type HostPageProps = {
  user: AuthUser
  pathname: string
  onNavigate: (path: string) => void
}

const sectionTitles: Record<string, string> = {
  '/host/properties': '숙소 관리',
  '/host/rooms': '객실 관리',
  '/host/reservations': '예약 관리',
}

function HostPage({ user, pathname, onNavigate }: HostPageProps) {
  const isDashboard = pathname === '/host/dashboard'
  const sectionPath = Object.keys(sectionTitles).find(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
  const title = isDashboard ? '호스트 대시보드' : sectionTitles[sectionPath ?? ''] ?? '숙소 등록'

  return (
    <main className="account-page">
      <div className="account-page-inner host-dashboard-layout">
        <header className="host-register-heading">
          <span>HOST DASHBOARD</span>
          <h1>{title}</h1>
          <p>{user.name}님의 TripFlow 호스트 공간입니다.</p>
        </header>

        <section className="host-register-card host-dashboard-card">
          <div className="host-register-icon" aria-hidden="true">⌂</div>
          <h2>
            {isDashboard
              ? '아직 등록된 숙소가 없습니다.'
              : `${title} 기능을 준비하고 있습니다.`}
          </h2>
          <p>
            {isDashboard
              ? '첫 번째 숙소를 등록해보세요.'
              : '숙소 등록 기능과 함께 순차적으로 제공될 예정입니다.'}
          </p>
          {isDashboard && (
            <button type="button" onClick={() => onNavigate('/host/properties/new')}>
              숙소 등록하기
            </button>
          )}
        </section>
      </div>
    </main>
  )
}

export default HostPage

import type { AuthUser } from '../stores/authStore'
import './AccountPages.css'

type HostPageProps = {
  user: AuthUser
  onNavigate: (path: string) => void
}

function HostPage({ user, onNavigate }: HostPageProps) {
  return (
    <main className="account-page">
      <div className="account-page-inner account-page-inner-narrow host-dashboard-layout">
        <header className="host-register-heading">
          <span>HOST DASHBOARD</span>
          <h1>호스트 페이지</h1>
          <p>{user.name}님, TripFlow 호스트 등록이 완료되었습니다.</p>
        </header>

        <section className="host-register-card host-dashboard-card">
          <div className="host-register-icon" aria-hidden="true">⌂</div>
          <h2>호스트 기능을 준비하고 있습니다.</h2>
          <p>다음 단계에서 숙소 등록과 관리 기능을 이 페이지에 연결할 수 있습니다.</p>
          <button type="button" onClick={() => onNavigate('/')}>
            메인으로 돌아가기
          </button>
        </section>
      </div>
    </main>
  )
}

export default HostPage

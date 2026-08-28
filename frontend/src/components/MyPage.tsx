import type { AuthUser } from '../stores/authStore'
import AccountProfileCard from './AccountProfileCard'
import './AccountPages.css'

type MyPageProps = {
  user: AuthUser
  onNavigate: (path: string) => void
}

function MyPage({ user, onNavigate }: MyPageProps) {
  return (
    <main className="account-page">
      <div className="account-page-inner mypage-layout">
        <header className="account-page-heading">
          <span>MY TRIPFLOW</span>
          <h1>마이페이지</h1>
          <p>내 계정 정보를 확인하고 호스트 활동을 시작할 수 있어요.</p>
        </header>

        <div className="mypage-card-grid">
          <AccountProfileCard user={user} />

          <section className="host-cta-card" aria-labelledby="host-cta-title">
            <div className="host-cta-icon" aria-hidden="true">⌂</div>
            <div className="host-cta-copy">
              <span>HOST</span>
              <h2 id="host-cta-title">
                {user.isHost ? '호스트 페이지로 이동' : '호스트가 되어보세요'}
              </h2>
              <p>
                {user.isHost
                  ? '숙소를 등록하고 호스트 활동을 관리해 보세요.'
                  : '나만의 공간을 여행자에게 소개할 준비를 시작해 보세요.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(user.isHost ? '/host/dashboard' : '/host/register')}
            >
              {user.isHost ? '호스트 화면으로 이동' : '호스트 되기'}
            </button>
          </section>
        </div>
      </div>
    </main>
  )
}

export default MyPage

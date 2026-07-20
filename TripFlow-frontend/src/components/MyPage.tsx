import type { AuthUser } from '../stores/authStore'
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
          <section className="account-card" aria-labelledby="profile-title">
            <div className="account-section-heading">
              <div className="account-avatar" aria-hidden="true">
                {user.name.trim().charAt(0) || '?'}
              </div>
              <div>
                <h2 id="profile-title">사용자 기본 정보</h2>
                <p>TripFlow에 등록된 계정 정보입니다.</p>
              </div>
            </div>
            <dl className="account-info-list">
              <div>
                <dt>이름</dt>
                <dd>{user.name}</dd>
              </div>
              <div>
                <dt>이메일</dt>
                <dd>{user.email}</dd>
              </div>
            </dl>
          </section>

          <section className="host-cta-card" aria-labelledby="host-cta-title">
            <div className="host-cta-icon" aria-hidden="true">⌂</div>
            <div className="host-cta-copy">
              <span>HOST</span>
              <h2 id="host-cta-title">호스트가 되어보세요</h2>
              <p>나만의 공간을 여행자에게 소개할 준비를 시작해 보세요.</p>
            </div>
            <button type="button" onClick={() => onNavigate('/host/register')}>
              호스트 되기
            </button>
          </section>
        </div>
      </div>
    </main>
  )
}

export default MyPage

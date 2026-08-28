import type { AuthUser } from '../stores/authStore'

type AccountProfileCardProps = {
  user: AuthUser
  title?: string
  description?: string
}

function AccountProfileCard({
  user,
  title = '사용자 기본 정보',
  description = 'TripFlow에 등록된 계정 정보입니다.',
}: AccountProfileCardProps) {
  return (
    <section className="account-card" aria-labelledby="profile-title">
      <div className="account-section-heading">
        <div className="account-avatar" aria-hidden="true">{user.name.trim().charAt(0) || '?'}</div>
        <div>
          <h2 id="profile-title">{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <dl className="account-info-list">
        <div><dt>이름</dt><dd>{user.name}</dd></div>
        <div><dt>이메일</dt><dd>{user.email}</dd></div>
      </dl>
    </section>
  )
}

export default AccountProfileCard

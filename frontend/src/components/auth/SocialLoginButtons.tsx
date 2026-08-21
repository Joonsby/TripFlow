import googleLogo from '../../assets/google.png'
import kakaoLogo from '../../assets/kakao.png'
import naverLogo from '../../assets/naver.png'

const providers = [
  { name: 'Google', image: googleLogo, className: 'auth-modal-social-logo' },
  { name: '카카오', image: kakaoLogo, className: 'auth-modal-social-logo auth-modal-social-logo-kakao' },
  { name: '네이버', image: naverLogo, className: 'auth-modal-social-logo' },
]

type Props = { onSocialClick: (provider: string) => void }

export default function SocialLoginButtons({ onSocialClick }: Props) {
  return (
    <div className="auth-modal-social-wrap">
      <div className="auth-modal-divider"><span>또는</span></div>
      <div className="auth-modal-social" aria-label="소셜 로그인">
        {providers.map((provider) => (
          <button type="button" className="auth-modal-social-button" key={provider.name}
            aria-label={`${provider.name}로 계속하기`} onClick={() => onSocialClick(provider.name)}>
            <img src={provider.image} alt="" aria-hidden="true" className={provider.className} />
          </button>
        ))}
      </div>
    </div>
  )
}

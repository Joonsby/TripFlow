import type { CSSProperties } from 'react'
import staysAtlas from '../assets/tripflow-stays-atlas.png'
import './HomePage.css'

type HomePageProps = {
  onNavigate: (path: string) => void
}

const destinations = [
  { name: '서울', description: '도심 속 감각적인 하루', icon: '✦', tone: 'sky' },
  { name: '부산', description: '파도 가까이 머무는 여행', icon: '≈', tone: 'blue' },
  { name: '제주', description: '천천히 쉬어가는 섬', icon: '⌁', tone: 'green' },
  { name: '강릉', description: '바다와 숲 사이의 휴식', icon: '△', tone: 'navy' },
]

const featuredStays = [
  {
    location: '서울 종로구',
    name: '남산을 품은 모던 한옥',
    rating: '4.94',
    reviews: 128,
    price: 189000,
    position: '0%',
    tag: '게스트 선호',
  },
  {
    location: '부산 해운대구',
    name: '파노라마 오션 스테이',
    rating: '4.89',
    reviews: 96,
    price: 224000,
    position: '33.333%',
    tag: '오션뷰',
  },
  {
    location: '제주 제주시',
    name: '오름 아래 고요한 돌집',
    rating: '4.97',
    reviews: 84,
    price: 173000,
    position: '66.666%',
    tag: '한적한 휴식',
  },
  {
    location: '강원 강릉시',
    name: '안개 숲 프라이빗 캐빈',
    rating: '4.92',
    reviews: 67,
    price: 208000,
    position: '100%',
    tag: '신규 오픈',
  },
]

const travelStyles = [
  { icon: '☼', title: '햇살 좋은 오션뷰', copy: '창문 너머로 바다가 펼쳐지는 숙소' },
  { icon: '⌂', title: '감성적인 한옥', copy: '오늘의 감각으로 다시 만나는 전통 공간' },
  { icon: '♨', title: '온전한 쉼', copy: '스파와 자쿠지가 있는 프라이빗 스테이' },
]

function HomePage({ onNavigate }: HomePageProps) {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <img src={staysAtlas} alt="서울, 부산, 제주, 강릉의 다양한 여행 숙소" />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <span className="home-eyebrow">FIND YOUR FLOW</span>
          <h1 id="home-hero-title">
            머무는 순간까지<br />여행이 되도록
          </h1>
          <p>도시의 설렘부터 자연 속 여유까지, 지금 나에게 맞는 공간을 발견하세요.</p>
          <div className="home-hero-actions">
            <a href="#featured-stays">추천 숙소 둘러보기</a>
            <button type="button" onClick={() => onNavigate('/host/register')}>
              내 공간 호스팅하기
            </button>
          </div>
        </div>
        <div className="home-hero-stats" aria-label="TripFlow 서비스 현황">
          <div><strong>1,240+</strong><span>엄선된 숙소</span></div>
          <div><strong>98%</strong><span>게스트 만족도</span></div>
          <div><strong>24/7</strong><span>여행 지원</span></div>
        </div>
      </section>

      <div className="home-content">
        <section className="home-section home-destinations" aria-labelledby="destination-title">
          <div className="home-section-heading">
            <div>
              <span>어디로 떠나볼까요?</span>
              <h2 id="destination-title">지금 인기 있는 여행지</h2>
            </div>
            <p>TripFlow 여행자들이 이번 주 가장 많이 찾은 지역이에요.</p>
          </div>
          <div className="destination-grid">
            {destinations.map((destination) => (
              <button
                type="button"
                className={`destination-card destination-card-${destination.tone}`}
                key={destination.name}
              >
                <span className="destination-icon" aria-hidden="true">{destination.icon}</span>
                <span><strong>{destination.name}</strong><small>{destination.description}</small></span>
                <span className="destination-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>

        <section className="home-section" id="featured-stays" aria-labelledby="featured-title">
          <div className="home-section-heading">
            <div>
              <span>취향으로 고른 공간</span>
              <h2 id="featured-title">이번 주 추천 숙소</h2>
            </div>
            <button type="button" className="home-text-button">전체 보기 <span>→</span></button>
          </div>
          <div className="stay-grid">
            {featuredStays.map((stay) => (
              <article className="stay-card" key={stay.name}>
                <div
                  className="stay-card-image"
                  style={{ '--atlas-position': stay.position } as CSSProperties}
                  role="img"
                  aria-label={`${stay.name} 숙소 전경`}
                >
                  <span>{stay.tag}</span>
                  <button type="button" aria-label={`${stay.name} 찜하기`}>♡</button>
                </div>
                <div className="stay-card-content">
                  <div className="stay-card-meta">
                    <span>{stay.location}</span>
                    <span>★ {stay.rating} ({stay.reviews})</span>
                  </div>
                  <h3>{stay.name}</h3>
                  <p><strong>{stay.price.toLocaleString('ko-KR')}원</strong> / 박</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section home-style-section" aria-labelledby="style-title">
          <div className="home-section-heading">
            <div>
              <span>나답게 머무는 방법</span>
              <h2 id="style-title">여행 스타일로 찾아보세요</h2>
            </div>
          </div>
          <div className="travel-style-grid">
            {travelStyles.map((style) => (
              <button type="button" className="travel-style-card" key={style.title}>
                <span aria-hidden="true">{style.icon}</span>
                <div><strong>{style.title}</strong><small>{style.copy}</small></div>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </section>

        <section className="home-host-banner" aria-labelledby="home-host-title">
          <div>
            <span>TRIPFLOW HOST</span>
            <h2 id="home-host-title">당신의 공간이 누군가의 여행이 됩니다</h2>
            <p>간단한 호스트 등록으로 공간의 새로운 가능성을 시작해 보세요.</p>
          </div>
          <button type="button" onClick={() => onNavigate('/host/register')}>호스트 되기</button>
        </section>
      </div>
    </main>
  )
}

export default HomePage

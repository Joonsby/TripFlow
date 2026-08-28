import { useEffect, useMemo, useRef, useState } from 'react'
import type { AuthUser } from '../stores/authStore'
import { lockBodyScroll } from '../utils/bodyScrollLock'
import stayAtlas from '../assets/tripflow-stays-atlas.png'
import './AccountPages.css'
import './HostManagement.css'

type HostPageProps = {
  user: AuthUser
  pathname: string
  onNavigate: (path: string) => void
}

const propertySteps = ['기본 정보', '위치', '시설 및 이용 정보', '사진', '확인']
type PropertyField = 'propertyName' | 'propertyType' | 'representativePhone' | 'shortIntroduction' | 'postCode' | 'roadAddress' | 'detailAddress' | 'amenities' | 'checkIn' | 'checkOut' | 'photos'
type ValidationError = { field: PropertyField; message: string } | null
type MapCoordinates = { latitude: number; longitude: number }
type PropertySnapshot = {
  propertyName: string
  propertyType: string
  representativePhone: string
  shortIntroduction: string
  detailedIntroduction: string
  postCode: string
  roadAddress: string
  detailAddress: string
  mapCoordinates: MapCoordinates | null
  isMapVisible: boolean
  selectedAmenities: string[]
  checkIn: string
  checkOut: string
  usageGuide: string
  photoFiles: File[]
  representativePhoto: File | null
}

type KakaoMapInstance = {
  addControl: (control: unknown, position: unknown) => void
  getCenter: () => unknown
  relayout: () => void
  setCenter: (position: unknown) => void
}

type KakaoMarkerInstance = { setPosition: (position: unknown) => void }

type KakaoMapsApi = {
  LatLng: new (latitude: number, longitude: number) => unknown
  Map: new (container: HTMLElement, options: { center: unknown; level: number; draggable?: boolean }) => KakaoMapInstance
  Marker: new (options: { map: KakaoMapInstance; position: unknown }) => KakaoMarkerInstance
  MapTypeControl: new () => unknown
  ZoomControl: new () => unknown
  ControlPosition: { TOPRIGHT: unknown; RIGHT: unknown }
  services: {
    Status: { OK: string }
    Geocoder: new () => { addressSearch: (address: string, callback: (result: KakaoGeocoderResult[], status: string) => void) => void }
  }
}

type KakaoBrowserWindow = typeof window & {
  kakao?: {
    maps?: KakaoMapsApi
    Postcode?: new (options: { oncomplete: (data: KakaoPostcodeResult) => void; onclose?: () => void }) => { open: () => void }
  }
  daum?: { Postcode?: new (options: { oncomplete: (data: KakaoPostcodeResult) => void; onclose?: () => void }) => { open: () => void } }
}

const KAKAO_POSTCODE_SCRIPT_ID = 'kakao-postcode-sdk'
const KAKAO_POSTCODE_SCRIPT_URL = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

const loadScript = (id: string, source: string) => new Promise<void>((resolve, reject) => {
  const existingScript = document.getElementById(id) as HTMLScriptElement | null
  if (existingScript?.dataset.loaded === 'true') {
    resolve()
    return
  }

  const script = existingScript ?? document.createElement('script')
  script.addEventListener('load', () => {
    script.dataset.loaded = 'true'
    resolve()
  }, { once: true })
  script.addEventListener('error', () => reject(new Error(`${id} 스크립트를 불러오지 못했습니다.`)), { once: true })
  if (!existingScript) {
    script.id = id
    script.src = source
    script.async = true
    document.head.appendChild(script)
  }
})

const formatMobilePhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

function Dashboard({ user, onNavigate }: Pick<HostPageProps, 'user' | 'onNavigate'>) {
  return (
    <>
      <header className="host-page-heading host-page-heading-row">
        <div>
          <span>HOST DASHBOARD</span>
          <h1>안녕하세요, {user.name} 호스트님</h1>
          <p>제주 바다 스테이의 오늘 운영 현황입니다.</p>
        </div>
        <button type="button" className="host-secondary-button" onClick={() => onNavigate('/host/reservations')}>예약 전체보기</button>
      </header>
      <section className="host-stat-grid" aria-label="오늘 운영 요약">
        {[['오늘 체크인', '3', '오후 3시부터'], ['오늘 체크아웃', '2', '오전 11시까지'], ['예약 중 객실', '7', '전체 10개 객실'], ['이번 달 매출', '₩4,280,000', '지난달보다 12% 증가']].map(([label, value, description], index) => (
          <article key={label} className={`host-stat-card tone-${index + 1}`}><span>{label}</span><strong>{value}</strong><small>{description}</small></article>
        ))}
      </section>
      <div className="host-dashboard-columns">
        <section className="host-panel">
          <div className="host-panel-heading"><div><span>TODAY</span><h2>오늘의 일정</h2></div><span className="host-live-badge">실시간</span></div>
          <div className="host-schedule-list">
            {[['15:00', '체크인', '김민수', '디럭스 오션뷰 · 2박'], ['16:30', '체크인', '이서연', '스탠다드 더블 · 1박'], ['18:00', '체크인', '박지훈', '패밀리 스위트 · 3박']].map(([time, status, guest, room]) => <article key={`${time}-${guest}`}><time>{time}</time><div><b>{status} · {guest}</b><span>{room}</span></div><button type="button">예약 보기</button></article>)}
          </div>
        </section>
        <section className="host-panel">
          <div className="host-panel-heading"><div><span>PROPERTY</span><h2>숙소 운영 상태</h2></div><button type="button" className="host-inline-link" onClick={() => onNavigate('/host/properties')}>관리하기 →</button></div>
          <div className="host-property-summary"><div className="host-atlas-image atlas-sea" style={{ backgroundImage: `url(${stayAtlas})` }} /><div><span className="host-status-badge is-active">운영 중</span><h3>제주 바다 스테이</h3><p>제주특별자치도 제주시 애월읍 해안로 123</p><dl><div><dt>객실</dt><dd>3개 유형</dd></div><div><dt>판매</dt><dd>10개 객실</dd></div></dl></div></div>
        </section>
      </div>
      <section className="host-panel">
        <div className="host-panel-heading"><div><span>RECENT</span><h2>최근 예약</h2></div><button type="button" className="host-inline-link" onClick={() => onNavigate('/host/reservations')}>전체보기 →</button></div>
        <div className="host-data-table host-recent-table"><div className="host-table-row is-head"><span>예약번호</span><span>게스트</span><span>객실</span><span>일정</span><span>결제 금액</span><span>상태</span></div>{[['TF-260827-1042', '김민수', '디럭스 오션뷰', '8.28 ~ 8.30', '₩360,000', '예약 확정'], ['TF-260826-1038', '이서연', '스탠다드 더블', '8.28 ~ 8.29', '₩140,000', '예약 확정'], ['TF-260825-1029', '최유진', '패밀리 스위트', '9.02 ~ 9.04', '₩520,000', '결제 완료']].map((row) => <div className="host-table-row" key={row[0]}>{row.map((value, index) => <span key={value} data-label={['예약번호', '게스트', '객실', '일정', '결제 금액', '상태'][index]} className={index === 5 ? 'host-booking-status' : ''}>{value}</span>)}</div>)}</div>
      </section>
    </>
  )
}

function Properties({ onNavigate }: Pick<HostPageProps, 'onNavigate'>) {
  return (
    <>
      <header className="host-page-heading host-page-heading-row">
        <div>
          <span>PROPERTIES</span>
          <h1>숙소 관리</h1>
          <p>숙소 정보와 운영 상태를 관리합니다.</p>
        </div>
        <span className="host-limit-note">등록 숙소 1 / 1</span>
      </header>
      <div className="host-filter-tabs" role="tablist" aria-label="숙소 상태 필터">
        {['전체 1', '작성 중 0', '운영 중 1', '판매 중지 0'].map((label, index) => (
          <button key={label} type="button" className={index === 0 ? 'is-active' : ''} role="tab" aria-selected={index === 0}>{label}</button>
        ))}
      </div>
      <article className="host-property-card">
        <div className="host-atlas-image atlas-sea" style={{ backgroundImage: `url(${stayAtlas})` }}><span className="host-status-badge is-active">운영 중</span></div>
        <div className="host-property-card-body"><div><span>HOTEL · JEJU</span><h2>제주 바다 스테이</h2><p>제주특별자치도 제주시 애월읍 해안로 123</p></div><div className="host-property-facts"><dl><dt>객실 유형</dt><dd>3개</dd></dl><dl><dt>전체 객실</dt><dd>10개</dd></dl><dl><dt>이번 달 예약</dt><dd>18건</dd></dl><dl><dt>평점</dt><dd>4.8</dd></dl></div><div className="host-property-card-actions"><button type="button" className="host-secondary-button">게스트 화면 미리보기</button><button type="button" className="host-primary-button" onClick={() => onNavigate('/host/properties/new')}>숙소 정보 수정</button></div></div>
      </article>
      <section className="host-property-notice"><div><b>숙소 판매 상태</b><span>현재 모든 객실이 정상적으로 판매되고 있습니다.</span></div><button type="button" className="host-secondary-button">판매 중지</button></section>
    </>
  )
}

function PropertyForm({ onNavigate }: Pick<HostPageProps, 'onNavigate'>) {
  const [step, setStep] = useState(0)
  const [editingFromReview, setEditingFromReview] = useState(false)
  const [propertyName, setPropertyName] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [representativePhone, setRepresentativePhone] = useState('')
  const [shortIntroduction, setShortIntroduction] = useState('')
  const [detailedIntroduction, setDetailedIntroduction] = useState('')
  const [postCode, setPostCode] = useState('')
  const [roadAddress, setRoadAddress] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [usageGuide, setUsageGuide] = useState('')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [representativePhoto, setRepresentativePhoto] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<ValidationError>(null)
  const [addressNotice, setAddressNotice] = useState('')
  const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false)
  const [isMapVisible, setIsMapVisible] = useState(false)
  const [mapCoordinates, setMapCoordinates] = useState<MapCoordinates | null>(null)
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false)
  const reviewSnapshotRef = useRef<PropertySnapshot | null>(null)
  const propertyNameRef = useRef<HTMLInputElement>(null)
  const propertyTypeRef = useRef<HTMLSelectElement>(null)
  const representativePhoneRef = useRef<HTMLInputElement>(null)
  const shortIntroductionRef = useRef<HTMLInputElement>(null)
  const postCodeRef = useRef<HTMLInputElement>(null)
  const roadAddressRef = useRef<HTMLInputElement>(null)
  const detailAddressRef = useRef<HTMLInputElement>(null)
  const firstAmenityRef = useRef<HTMLInputElement>(null)
  const checkInRef = useRef<HTMLInputElement>(null)
  const checkOutRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const photoButtonRef = useRef<HTMLButtonElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const kakaoMapContainerRef = useRef<HTMLDivElement | null>(null)
  const kakaoMapRef = useRef<KakaoMapInstance | null>(null)
  const kakaoMarkerRef = useRef<KakaoMarkerInstance | null>(null)
  const photoPreviews = useMemo(
    () => photoFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photoFiles],
  )

  useEffect(() => () => {
    photoPreviews.forEach(({ url }) => URL.revokeObjectURL(url))
  }, [photoPreviews])

  useEffect(() => {
    const container = mapContainerRef.current
    const maps = (window as KakaoBrowserWindow).kakao?.maps
    if (!container || !maps || !isMapVisible || !mapCoordinates) return

    const position = new maps.LatLng(mapCoordinates.latitude, mapCoordinates.longitude)
    let map = kakaoMapRef.current
    let marker = kakaoMarkerRef.current
    if (!map || kakaoMapContainerRef.current !== container) {
      map = new maps.Map(container, { center: position, level: 3, draggable: false })
      map.addControl(new maps.MapTypeControl(), maps.ControlPosition.TOPRIGHT)
      map.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT)
      kakaoMapRef.current = map
      kakaoMapContainerRef.current = container
      marker = null
    }
    if (!marker) {
      marker = new maps.Marker({ map, position })
      kakaoMarkerRef.current = marker
    } else {
      marker.setPosition(position)
    }
    map.relayout()
    map.setCenter(position)

    let resizeFrame = 0
    const resizeObserver = new ResizeObserver(() => {
      window.cancelAnimationFrame(resizeFrame)
      resizeFrame = window.requestAnimationFrame(() => {
        const map = kakaoMapRef.current
        if (!map || container.clientWidth === 0 || container.clientHeight === 0) return
        const center = map.getCenter()
        map.relayout()
        map.setCenter(center)
      })
    })
    resizeObserver.observe(container)

    return () => {
      window.cancelAnimationFrame(resizeFrame)
      resizeObserver.disconnect()
    }
  }, [isMapVisible, mapCoordinates, step])

  useEffect(() => {
    if (!isDiscardConfirmOpen) return
    return lockBodyScroll()
  }, [isDiscardConfirmOpen])

  const clearFieldError = (field: PropertyField) => {
    if (validationError?.field === field) setValidationError(null)
  }

  const next = () => {
    const validations = step === 0
      ? [
          { field: 'propertyName' as const, valid: propertyName.trim().length > 0, message: '숙소명을 입력해주세요.', target: propertyNameRef.current },
          { field: 'propertyType' as const, valid: propertyType.length > 0, message: '숙소 유형을 선택해주세요.', target: propertyTypeRef.current },
          { field: 'representativePhone' as const, valid: /^010-\d{4}-\d{4}$/.test(representativePhone), message: '대표 전화번호를 010-1234-5678 형식으로 입력해주세요.', target: representativePhoneRef.current },
          { field: 'shortIntroduction' as const, valid: shortIntroduction.trim().length > 0, message: '숙소 한 줄 소개를 입력해주세요.', target: shortIntroductionRef.current },
        ]
      : step === 1
        ? [
            { field: 'postCode' as const, valid: postCode.trim().length > 0, message: '우편번호를 입력해주세요.', target: postCodeRef.current },
            { field: 'roadAddress' as const, valid: roadAddress.trim().length > 0, message: '도로명 주소를 입력해주세요.', target: roadAddressRef.current },
            { field: 'detailAddress' as const, valid: detailAddress.trim().length > 0, message: '상세 주소를 입력해주세요.', target: detailAddressRef.current },
          ]
        : step === 2
          ? [
              { field: 'amenities' as const, valid: selectedAmenities.length > 0, message: '제공하는 편의시설을 한 개 이상 선택해주세요.', target: firstAmenityRef.current },
              { field: 'checkIn' as const, valid: checkIn.length > 0, message: '체크인 시간을 선택해주세요.', target: checkInRef.current },
              { field: 'checkOut' as const, valid: checkOut.length > 0, message: '체크아웃 시간을 선택해주세요.', target: checkOutRef.current },
            ]
          : step === 3
            ? [{ field: 'photos' as const, valid: photoFiles.length > 0, message: '숙소 사진을 한 장 이상 추가해주세요.', target: photoButtonRef.current }]
            : []
    const firstInvalid = validations.find(({ valid }) => !valid)

    if (firstInvalid) {
      setValidationError({ field: firstInvalid.field, message: firstInvalid.message })
      window.requestAnimationFrame(() => firstInvalid.target?.focus())
      return
    }

    setValidationError(null)
    if (editingFromReview) {
      setEditingFromReview(false)
      reviewSnapshotRef.current = null
      setStep(propertySteps.length - 1)
      return
    }
    setStep((current) => Math.min(current + 1, propertySteps.length - 1))
  }

  const previous = () => {
    if (editingFromReview) {
      setIsDiscardConfirmOpen(true)
      return
    }
    setValidationError(null)
    setStep((current) => Math.max(current - 1, 0))
  }

  const editFromReview = (targetStep: number) => {
    reviewSnapshotRef.current = {
      propertyName, propertyType, representativePhone, shortIntroduction, detailedIntroduction,
      postCode, roadAddress, detailAddress, mapCoordinates, isMapVisible,
      selectedAmenities: [...selectedAmenities], checkIn, checkOut, usageGuide, photoFiles: [...photoFiles], representativePhoto,
    }
    setValidationError(null)
    setEditingFromReview(true)
    setStep(targetStep)
  }

  const discardReviewChanges = () => {
    const snapshot = reviewSnapshotRef.current
    if (snapshot) {
      setPropertyName(snapshot.propertyName)
      setPropertyType(snapshot.propertyType)
      setRepresentativePhone(snapshot.representativePhone)
      setShortIntroduction(snapshot.shortIntroduction)
      setDetailedIntroduction(snapshot.detailedIntroduction)
      setPostCode(snapshot.postCode)
      setRoadAddress(snapshot.roadAddress)
      setDetailAddress(snapshot.detailAddress)
      setMapCoordinates(snapshot.mapCoordinates)
      setIsMapVisible(snapshot.isMapVisible)
      setSelectedAmenities([...snapshot.selectedAmenities])
      setCheckIn(snapshot.checkIn)
      setCheckOut(snapshot.checkOut)
      setUsageGuide(snapshot.usageGuide)
      setPhotoFiles([...snapshot.photoFiles])
      setRepresentativePhoto(snapshot.representativePhoto)
    }
    setValidationError(null)
    setIsDiscardConfirmOpen(false)
    setEditingFromReview(false)
    reviewSnapshotRef.current = null
    setStep(propertySteps.length - 1)
  }

  const handleAddressSearch = async () => {
    if (isAddressSearchLoading) return
    setAddressNotice('')
    setIsAddressSearchLoading(true)

    try {
      await loadScript(KAKAO_POSTCODE_SCRIPT_ID, KAKAO_POSTCODE_SCRIPT_URL)
      const postcodeWindow = window as KakaoBrowserWindow
      const Postcode = postcodeWindow.kakao?.Postcode ?? postcodeWindow.daum?.Postcode
      if (!Postcode) throw new Error('Kakao 우편번호 서비스를 초기화하지 못했습니다.')

      new Postcode({
        oncomplete: (data) => {
          const address = data.roadAddress || data.autoRoadAddress || data.address
          const maps = postcodeWindow.kakao?.maps
          setPostCode(data.zonecode)
          setRoadAddress(address)
          setMapCoordinates(null)
          if (validationError?.field === 'postCode' || validationError?.field === 'roadAddress') setValidationError(null)

          if (!maps) {
            setAddressNotice('지도 서비스를 불러오지 못했습니다. 주소는 정상적으로 입력되었습니다.')
            setIsAddressSearchLoading(false)
            window.requestAnimationFrame(() => detailAddressRef.current?.focus())
            return
          }

          const geocoder = new maps.services.Geocoder()
          geocoder.addressSearch(address, (results, status) => {
            if (status !== maps.services.Status.OK || !results[0]) {
              setAddressNotice('주소의 지도 위치를 찾지 못했습니다. 주소를 다시 검색해주세요.')
              setIsMapVisible(false)
              setIsAddressSearchLoading(false)
              return
            }

            const latitude = Number(results[0].y)
            const longitude = Number(results[0].x)
            setMapCoordinates({ latitude, longitude })
            setIsMapVisible(true)
            setIsAddressSearchLoading(false)
            window.requestAnimationFrame(() => detailAddressRef.current?.focus())
          })
        },
        onclose: () => setIsAddressSearchLoading(false),
      }).open()
    } catch (error) {
      console.error('Kakao 우편번호 서비스 실행 실패:', error)
      setAddressNotice('주소 검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
      setIsAddressSearchLoading(false)
    }
  }

  return (
    <>
      <header className="host-page-heading host-form-page-heading">
        <button type="button" className="host-text-button" onClick={() => onNavigate('/host/properties')}>← 숙소 관리</button>
        <span>NEW PROPERTY</span>
        <h1>새 숙소 등록</h1>
        <p>입력한 내용은 나중에 수정할 수 있습니다.</p>
      </header>

      <nav className="property-steps" aria-label="숙소 등록 단계">
        <ol>
          {propertySteps.map((label, index) => (
            <li
              key={label}
              className={`${index === step ? 'is-current' : ''}${index < step ? ' is-complete' : ''}`}
              aria-current={index === step ? 'step' : undefined}
            >
              <b>{index < step ? '✓' : index + 1}</b>
              <span>{label}</span>
            </li>
          ))}
        </ol>
      </nav>

      <section className="property-form-card">
        {editingFromReview && (
          <div className="property-review-edit-notice" role="status">
            <span>확인 단계에서 수정 중</span>
            <strong>{propertySteps[step]}</strong>
            <small>수정을 마치면 아래의 ‘수정 완료’를 눌러 확인 단계로 돌아가세요.</small>
          </div>
        )}
        {step === 0 && (
          <div className="property-form-content">
            <div className="host-section-title"><span>1 / 5</span><h2>어떤 숙소를 운영하시나요?</h2><p>게스트에게 가장 먼저 보여줄 기본 정보입니다.</p></div>
            <div className="property-form-grid">
              <label><span>숙소명 <em>필수</em></span><input ref={propertyNameRef} value={propertyName} className={validationError?.field === 'propertyName' ? 'is-invalid' : ''} aria-invalid={validationError?.field === 'propertyName'} aria-describedby={validationError?.field === 'propertyName' ? 'property-name-error' : undefined} placeholder="예: 제주 바다 스테이" onChange={(event) => { setPropertyName(event.target.value); clearFieldError('propertyName') }} />{validationError?.field === 'propertyName' && <small id="property-name-error" className="property-field-error" role="alert">{validationError.message}</small>}</label>
              <label><span>숙소 유형 <em>필수</em></span><select ref={propertyTypeRef} value={propertyType} className={validationError?.field === 'propertyType' ? 'is-invalid' : ''} aria-invalid={validationError?.field === 'propertyType'} aria-describedby={validationError?.field === 'propertyType' ? 'property-type-error' : undefined} onChange={(event) => { setPropertyType(event.target.value); clearFieldError('propertyType') }}><option value="" disabled>숙소 유형 선택</option><option>호텔</option><option>펜션</option><option>게스트하우스</option><option>리조트</option><option>한옥</option></select>{validationError?.field === 'propertyType' && <small id="property-type-error" className="property-field-error" role="alert">{validationError.message}</small>}</label>
              <label>
                <span>대표 전화번호 <em>필수</em></span>
                <input
                  type="tel"
                  inputMode="numeric"
                  ref={representativePhoneRef}
                  value={representativePhone}
                  className={validationError?.field === 'representativePhone' ? 'is-invalid' : ''}
                  aria-invalid={validationError?.field === 'representativePhone'}
                  aria-describedby={validationError?.field === 'representativePhone' ? 'representative-phone-error' : undefined}
                  placeholder="010-1234-5678"
                  maxLength={13}
                  onChange={(event) => { setRepresentativePhone(formatMobilePhoneNumber(event.target.value)); clearFieldError('representativePhone') }}
                />
                {validationError?.field === 'representativePhone' && <small id="representative-phone-error" className="property-field-error" role="alert">{validationError.message}</small>}
              </label>
              <label className="is-wide"><span>숙소 한 줄 소개 <em>필수</em></span><input ref={shortIntroductionRef} value={shortIntroduction} className={validationError?.field === 'shortIntroduction' ? 'is-invalid' : ''} aria-invalid={validationError?.field === 'shortIntroduction'} aria-describedby={validationError?.field === 'shortIntroduction' ? 'short-introduction-error' : undefined} placeholder="숙소의 매력을 한 문장으로 소개해주세요" maxLength={80} onChange={(event) => { setShortIntroduction(event.target.value); clearFieldError('shortIntroduction') }} />{validationError?.field === 'shortIntroduction' && <small id="short-introduction-error" className="property-field-error" role="alert">{validationError.message}</small>}</label>
              <label className="is-wide"><span>상세 소개 <i>선택</i></span><textarea rows={6} value={detailedIntroduction} placeholder="숙소 주변 환경과 특별한 경험을 소개해주세요" onChange={(event) => setDetailedIntroduction(event.target.value)} /></label>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="property-form-content">
            <div className="host-section-title"><span>2 / 5</span><h2>숙소 위치를 알려주세요</h2><p>사업자 소재지가 아닌 실제 게스트가 방문할 주소를 입력합니다.</p></div>
            <div className="property-address-search"><div><input ref={postCodeRef} value={postCode} className={validationError?.field === 'postCode' ? 'is-invalid' : ''} aria-label="우편번호" aria-invalid={validationError?.field === 'postCode'} aria-describedby={validationError?.field === 'postCode' ? 'post-code-error' : undefined} placeholder="주소 검색을 이용해주세요" readOnly />{validationError?.field === 'postCode' && <small id="post-code-error" className="property-field-error" role="alert">{validationError.message}</small>}</div><button type="button" disabled={isAddressSearchLoading} onClick={() => void handleAddressSearch()}>{isAddressSearchLoading ? '주소 검색 중...' : '주소 검색'}</button></div>
            {addressNotice && <p className="property-address-notice" role="status">{addressNotice}</p>}
            <div className="property-form-grid"><label className="is-wide"><span>도로명 주소 <em>필수</em></span><input ref={roadAddressRef} value={roadAddress} className={validationError?.field === 'roadAddress' ? 'is-invalid' : ''} aria-invalid={validationError?.field === 'roadAddress'} aria-describedby={validationError?.field === 'roadAddress' ? 'road-address-error' : undefined} placeholder="주소 검색을 이용해주세요" readOnly />{validationError?.field === 'roadAddress' && <small id="road-address-error" className="property-field-error" role="alert">{validationError.message}</small>}</label><label className="is-wide"><span>상세 주소 <em>필수</em></span><input ref={detailAddressRef} value={detailAddress} className={validationError?.field === 'detailAddress' ? 'is-invalid' : ''} aria-invalid={validationError?.field === 'detailAddress'} aria-describedby={validationError?.field === 'detailAddress' ? 'detail-address-error' : undefined} placeholder="건물명, 층, 호수 등을 입력해주세요" onChange={(event) => { setDetailAddress(event.target.value); clearFieldError('detailAddress') }} />{validationError?.field === 'detailAddress' && <small id="detail-address-error" className="property-field-error" role="alert">{validationError.message}</small>}</label></div>
            {isMapVisible ? <div ref={mapContainerRef} className="property-kakao-map" aria-label="검색한 숙소 위치" /> : <div className="property-map-placeholder"><span>⌖</span><strong>주소를 검색하면 지도에서 위치를 확인할 수 있어요</strong><small>정확한 위치는 예약이 확정된 게스트에게만 안내됩니다.</small></div>}
          </div>
        )}
        {step === 2 && (
          <div className="property-form-content">
            <div className="host-section-title"><span>3 / 5</span><h2>시설과 이용 정보를 설정해주세요</h2><p>제공하는 편의시설과 기본 운영 시간을 선택합니다.</p></div>
            <div className="property-amenities-group">
              <fieldset className={`property-amenities${validationError?.field === 'amenities' ? ' is-invalid' : ''}`} aria-invalid={validationError?.field === 'amenities'} aria-describedby={validationError?.field === 'amenities' ? 'amenities-error' : undefined}>
                <legend>편의시설 <em>필수</em></legend>
                {['무료 Wi-Fi', '주차 가능', '수영장', '조식 제공', '반려동물 동반', '바비큐 시설', '엘리베이터', '짐 보관'].map((item, index) => (
                  <label key={item}><input ref={index === 0 ? firstAmenityRef : undefined} type="checkbox" checked={selectedAmenities.includes(item)} onChange={(event) => { setSelectedAmenities((current) => event.target.checked ? [...current, item] : current.filter((value) => value !== item)); clearFieldError('amenities') }} /><span>{item}</span></label>
                ))}
              </fieldset>
              {validationError?.field === 'amenities' && <small id="amenities-error" className="property-field-error" role="alert">{validationError.message}</small>}
            </div>
            <div className="property-time-grid">
              <label><span>체크인 <em>필수</em></span><input ref={checkInRef} type="time" value={checkIn} className={validationError?.field === 'checkIn' ? 'is-invalid' : ''} aria-invalid={validationError?.field === 'checkIn'} aria-describedby={validationError?.field === 'checkIn' ? 'check-in-error' : undefined} onChange={(event) => { setCheckIn(event.target.value); clearFieldError('checkIn') }} />{validationError?.field === 'checkIn' && <small id="check-in-error" className="property-field-error" role="alert">{validationError.message}</small>}</label>
              <label><span>체크아웃 <em>필수</em></span><input ref={checkOutRef} type="time" value={checkOut} className={validationError?.field === 'checkOut' ? 'is-invalid' : ''} aria-invalid={validationError?.field === 'checkOut'} aria-describedby={validationError?.field === 'checkOut' ? 'check-out-error' : undefined} onChange={(event) => { setCheckOut(event.target.value); clearFieldError('checkOut') }} />{validationError?.field === 'checkOut' && <small id="check-out-error" className="property-field-error" role="alert">{validationError.message}</small>}</label>
            </div>
            <label className="property-single-field"><span>이용 안내 <i>선택</i></span><textarea rows={5} value={usageGuide} placeholder="주차, 입실 방법, 주의사항 등을 입력해주세요" onChange={(event) => setUsageGuide(event.target.value)} /></label>
          </div>
        )}
        {step === 3 && (
          <div className="property-form-content">
            <div className="host-section-title"><span>4 / 5</span><h2>숙소 사진을 추가해주세요</h2><p>대표 사진 1장과 숙소의 분위기를 보여주는 사진을 등록합니다.</p></div>
            <input ref={photoInputRef} className="property-photo-input" type="file" accept="image/jpeg,image/png" multiple onChange={(event) => { const addedFiles = Array.from(event.target.files ?? []); setPhotoFiles((current) => [...current, ...addedFiles]); setRepresentativePhoto((current) => current ?? addedFiles[0] ?? null); event.target.value = ''; clearFieldError('photos') }} />
            {photoPreviews.length > 0 && (
              <div className={`property-photo-grid count-${Math.min(photoPreviews.length, 3)}`} aria-label={`선택한 숙소 사진 ${photoPreviews.length}장`}>
                {photoPreviews.map(({ file, url }, index) => (
                  <figure key={`${file.name}-${file.lastModified}-${index}`} className={file === representativePhoto ? 'is-representative' : undefined}>
                    <img src={url} alt={`숙소 사진 미리보기 ${index + 1}`} />
                    <button type="button" className={`property-photo-representative${file === representativePhoto ? ' is-selected' : ''}`} disabled={file === representativePhoto} onClick={() => setRepresentativePhoto(file)}>{file === representativePhoto ? '대표사진' : '대표로 설정'}</button>
                    <button type="button" className="property-photo-delete" aria-label={`${file.name} 사진 삭제`} onClick={() => { const remainingFiles = photoFiles.filter((photo) => photo !== file); setPhotoFiles(remainingFiles); if (representativePhoto === file) setRepresentativePhoto(remainingFiles[0] ?? null) }} />
                  </figure>
                ))}
              </div>
            )}
            <button ref={photoButtonRef} type="button" className={`property-upload${photoFiles.length > 0 ? ' is-compact' : ''}${validationError?.field === 'photos' ? ' is-invalid' : ''}`} aria-invalid={validationError?.field === 'photos'} aria-describedby={validationError?.field === 'photos' ? 'property-photos-error' : undefined} onClick={() => photoInputRef.current?.click()}><span>＋</span><strong>{photoFiles.length > 0 ? '사진 추가하기' : '사진을 끌어놓거나 클릭해서 추가'}</strong><small>{photoFiles.length > 0 ? `현재 ${photoFiles.length}장 선택됨` : 'JPG, PNG · 장당 최대 10MB · 권장 5장 이상'}</small></button>
            {validationError?.field === 'photos' && <small id="property-photos-error" className="property-field-error" role="alert">{validationError.message}</small>}
            <div className="property-photo-tip"><b>사진 등록 팁</b><span>숙소 외관, 공용 공간, 전망 순서로 등록하면 숙소를 이해하기 쉬워요.</span></div>
          </div>
        )}
        {step === 4 && (
          <div className="property-form-content">
            <div className="host-section-title"><span>5 / 5</span><h2>등록 전 마지막으로 확인해주세요</h2><p>필수 정보를 모두 입력하면 숙소를 등록할 수 있습니다.</p></div>
            <div className="property-review-list">
              {[
                `${propertyName} · ${propertyType} · ${representativePhone}`,
                `${roadAddress} ${detailAddress}`,
                `${selectedAmenities.join(', ')} · ${checkIn}~${checkOut}`,
                `선택한 사진 ${photoFiles.length}장`,
              ].map((summary, index) => <button key={propertySteps[index]} type="button" onClick={() => editFromReview(index)}><span><b>{propertySteps[index]}</b><small>{summary}</small></span><em>수정 →</em></button>)}
            </div>
            <div className="property-policy-note"><strong>초기 운영 정책</strong><p>현재 호스트 계정에는 숙소 1개만 등록할 수 있습니다. 숙소를 등록한 뒤 객실을 추가할 수 있어요.</p></div>
          </div>
        )}

        <footer className="property-form-actions">
          <button type="button" className="host-secondary-button" disabled={step === 0 && !editingFromReview} onClick={previous}>이전</button>
          <button type="button" className="host-draft-button">임시 저장</button>
          <button type="button" className="host-primary-button" onClick={step === propertySteps.length - 1 ? () => onNavigate('/host/properties') : next}>{step === propertySteps.length - 1 ? '숙소 등록 완료' : editingFromReview ? '수정 완료' : '다음'}</button>
        </footer>
      </section>

      {isDiscardConfirmOpen && (
        <div className="property-confirm-layer">
          <button type="button" className="property-confirm-backdrop" aria-label="변경사항 폐기 확인창 닫기" onClick={() => setIsDiscardConfirmOpen(false)} />
          <section className="property-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="discard-changes-title" aria-describedby="discard-changes-description">
            <div className="property-confirm-icon" aria-hidden="true">!</div>
            <h2 id="discard-changes-title">수정한 내용을 저장하지 않을까요?</h2>
            <p id="discard-changes-description">이전 버튼을 누르면 이번에 수정한 내용은 반영되지 않고 확인 단계로 돌아갑니다.</p>
            <div className="property-confirm-actions">
              <button type="button" className="host-secondary-button" onClick={() => setIsDiscardConfirmOpen(false)}>계속 수정</button>
              <button type="button" className="property-discard-button" onClick={discardReviewChanges}>수정 내용 버리기</button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

function Rooms() {
  return (
    <>
      <header className="host-page-heading host-page-heading-row"><div><span>ROOMS</span><h1>객실 관리</h1><p>제주 바다 스테이의 객실과 판매 상태를 관리합니다.</p></div><button type="button" className="host-primary-button">+ 객실 등록</button></header>
      <section className="host-room-summary"><div><span>전체 객실</span><strong>10</strong></div><div><span>판매 중</span><strong>9</strong></div><div><span>판매 중지</span><strong>1</strong></div><div><span>오늘 예약 가능</span><strong>3</strong></div></section>
      <div className="host-room-toolbar"><div className="host-filter-tabs"><button type="button" className="is-active">전체 3</button><button type="button">판매 중 2</button><button type="button">판매 중지 1</button></div><select aria-label="정렬"><option>최근 수정순</option><option>가격 낮은순</option><option>객실명순</option></select></div>
      <section className="host-room-list">
        {[['atlas-sea', '디럭스 오션뷰', '기준 2명 · 최대 3명', '₩180,000', '4개 객실', '판매 중'], ['atlas-hanok', '패밀리 스위트', '기준 4명 · 최대 6명', '₩260,000', '2개 객실', '판매 중'], ['atlas-cabin', '스탠다드 더블', '기준 2명 · 최대 2명', '₩140,000', '4개 객실', '판매 중지']].map(([imageClass, name, capacity, price, inventory, status]) => <article key={name}><div className={`host-atlas-image ${imageClass}`} style={{ backgroundImage: `url(${stayAtlas})` }} /><div className="host-room-card-main"><span className={`host-status-badge ${status === '판매 중' ? 'is-active' : 'is-inactive'}`}>{status}</span><h2>{name}</h2><p>{capacity}</p><div><b>{price}</b><span>/ 1박</span></div></div><div className="host-room-card-side"><span>{inventory}</span><small>마지막 수정 2026.08.26</small><div><button type="button" className="host-secondary-button">판매 설정</button><button type="button" className="host-primary-button">객실 수정</button></div></div></article>)}
      </section>
    </>
  )
}

function Reservations() {
  return (
    <>
      <header className="host-page-heading"><span>RESERVATIONS</span><h1>예약 관리</h1><p>예약 현황과 체크인 일정을 확인합니다.</p></header>
      <section className="host-reservation-kpis"><div><span>체크인 예정</span><strong>3</strong><small>오늘</small></div><div><span>숙박 중</span><strong>4</strong><small>현재</small></div><div><span>이번 달 예약</span><strong>18</strong><small>확정 기준</small></div></section>
      <div className="host-reservation-toolbar"><div className="host-filter-tabs"><button type="button" className="is-active">전체 18</button><button type="button">예약 확정 7</button><button type="button">체크인 예정 3</button><button type="button">이용 완료 6</button><button type="button">취소 2</button></div><div className="host-reservation-filters"><input type="search" aria-label="예약 검색" placeholder="예약번호 또는 게스트 검색" /><button type="button" className="host-secondary-button">기간 선택</button></div></div>
      <section className="host-panel host-reservation-panel"><div className="host-data-table host-reservation-table"><div className="host-table-row is-head"><span>예약번호</span><span>게스트</span><span>숙소 / 객실</span><span>숙박 일정</span><span>인원</span><span>결제 금액</span><span>상태</span><span></span></div>{[['TF-260827-1042', '김민수', '디럭스 오션뷰', '8.28 ~ 8.30 · 2박', '성인 2명', '₩360,000', '예약 확정'], ['TF-260826-1038', '이서연', '스탠다드 더블', '8.28 ~ 8.29 · 1박', '성인 2명', '₩140,000', '체크인 예정'], ['TF-260825-1029', '최유진', '패밀리 스위트', '9.02 ~ 9.04 · 2박', '성인 4명', '₩520,000', '예약 확정'], ['TF-260824-1021', '정하늘', '디럭스 오션뷰', '8.25 ~ 8.27 · 2박', '성인 2명', '₩340,000', '이용 완료'], ['TF-260820-0998', '박도윤', '스탠다드 더블', '9.10 ~ 9.12 · 2박', '성인 1명', '₩280,000', '취소']].map((row) => <div className="host-table-row" key={row[0]}>{row.map((value, index) => <span key={`${row[0]}-${index}`} data-label={['예약번호', '게스트', '객실', '숙박 일정', '인원', '결제 금액', '상태'][index]} className={index === 6 ? `host-booking-status status-${value.replace(' ', '-')}` : ''}>{value}</span>)}<span><button type="button" className="host-inline-link">상세보기</button></span></div>)}</div></section>
    </>
  )
}

function HostPage({ user, pathname, onNavigate }: HostPageProps) {
  return (
    <main className="account-page">
      <div className="account-page-inner host-dashboard-layout host-management-layout">
        {pathname === '/host/dashboard' && <Dashboard user={user} onNavigate={onNavigate} />}
        {pathname === '/host/properties' && <Properties onNavigate={onNavigate} />}
        {pathname === '/host/properties/new' && <PropertyForm onNavigate={onNavigate} />}
        {pathname.startsWith('/host/rooms') && <Rooms />}
        {pathname.startsWith('/host/reservations') && <Reservations />}
      </div>
    </main>
  )
}

export default HostPage

import { useEffect, useRef, useState, type FormEvent } from 'react'
import axios from 'axios'
import { verifyBusiness } from '../api/businessVerification'
import {
  createHostApplication,
  type HostApplicationResponse,
} from '../api/hostApplications'
import { useAuthStore, type AuthUser } from '../stores/authStore'
import { lockBodyScroll } from '../utils/bodyScrollLock'
import './AccountPages.css'

type HostRegisterPageProps = {
  user: AuthUser
  onNavigate: (path: string) => void
}

type HostRegistrationForm = {
  businessName: string
  representativeName: string
  businessNumber: string
  openingDate: string
  businessPostCode: string
  businessRoadAddress: string
  businessDetailAddress: string
  introduction: string
}

type AgreementKey = 'hostPolicy' | 'privacy' | 'informationAccuracy'
type BusinessVerificationStatus = 'idle' | 'loading' | 'success' | 'error'
type MapCoordinates = { latitude: number; longitude: number }

type KakaoMapInstance = {
  addControl: (control: unknown, position: unknown) => void
  getCenter: () => unknown
  relayout: () => void
  setCenter: (position: unknown) => void
}

type KakaoMarkerInstance = {
  setPosition: (position: unknown) => void
}

type KakaoMapsApi = {
  LatLng: new (latitude: number, longitude: number) => unknown
  Map: new (
    container: HTMLElement,
    options: { center: unknown; level: number; draggable?: boolean },
  ) => KakaoMapInstance
  Marker: new (options: {
    map: KakaoMapInstance
    position: unknown
  }) => KakaoMarkerInstance
  MapTypeControl: new () => unknown
  ZoomControl: new () => unknown
  ControlPosition: { TOPRIGHT: unknown; RIGHT: unknown }
  services: {
    Status: { OK: string }
    Geocoder: new () => {
      addressSearch: (
        address: string,
        callback: (result: KakaoGeocoderResult[], status: string) => void,
      ) => void
    }
  }
}

type KakaoBrowserWindow = typeof window & {
  kakao?: {
    maps?: KakaoMapsApi
    Postcode?: new (options: {
      oncomplete: (data: KakaoPostcodeResult) => void
      onclose?: () => void
    }) => { open: () => void }
  }
  daum?: {
    Postcode?: new (options: {
      oncomplete: (data: KakaoPostcodeResult) => void
      onclose?: () => void
    }) => { open: () => void }
  }
}

const createInitialForm = (representativeName: string): HostRegistrationForm => ({
  businessName: '',
  representativeName,
  businessNumber: '',
  openingDate: '',
  businessPostCode: '',
  businessRoadAddress: '',
  businessDetailAddress: '',
  introduction: '',
})

const formatBusinessNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
}

const KAKAO_POSTCODE_SCRIPT_ID = 'kakao-postcode-sdk'
const KAKAO_POSTCODE_SCRIPT_URL =
  'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

const loadScript = (id: string, source: string) =>
  new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(id) as HTMLScriptElement | null
    if (existingScript?.dataset.loaded === 'true') {
      resolve()
      return
    }

    const script = existingScript ?? document.createElement('script')
    const handleLoad = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    const handleError = () => reject(new Error(`${id} 스크립트를 불러오지 못했습니다.`))

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })
    if (!existingScript) {
      script.id = id
      script.src = source
      script.async = true
      document.head.appendChild(script)
    }
  })

function HostRegisterPage({ user, onNavigate }: HostRegisterPageProps) {
  const markAsHost = useAuthStore((state) => state.markAsHost)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const kakaoMapRef = useRef<KakaoMapInstance | null>(null)
  const kakaoMarkerRef = useRef<KakaoMarkerInstance | null>(null)

  const [form, setForm] = useState(() => createInitialForm(user.name))
  const [agreements, setAgreements] = useState<Record<AgreementKey, boolean>>({
    hostPolicy: false,
    privacy: false,
    informationAccuracy: false,
  })
  const [addressNotice, setAddressNotice] = useState('')
  const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false)
  const [businessVerificationStatus, setBusinessVerificationStatus] =
    useState<BusinessVerificationStatus>('idle')
  const [businessVerificationMessage, setBusinessVerificationMessage] = useState('')
  const [isMapVisible, setIsMapVisible] = useState(true)
  const [mapCoordinates, setMapCoordinates] = useState<MapCoordinates | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [applicationResponse, setApplicationResponse] =
    useState<HostApplicationResponse | null>(null)
  const detailAddressRef = useRef<HTMLInputElement>(null)
  const verificationAttemptRef = useRef(0)

  const businessNumberDigits = form.businessNumber.replace(/\D/g, '')
  const hasRequiredValues =
    form.businessName.trim().length > 0 &&
    form.representativeName.trim().length > 0 &&
    businessNumberDigits.length === 10 &&
    form.openingDate.length > 0 &&
    form.businessPostCode.trim().length > 0 &&
    form.businessRoadAddress.trim().length > 0
  const hasRequiredAgreements = Object.values(agreements).every(Boolean)
  const canSubmit =
    hasRequiredValues &&
    hasRequiredAgreements &&
    businessVerificationStatus === 'success'
  const canVerifyBusiness =
    form.businessName.trim().length > 0 &&
    form.representativeName.trim().length > 0 &&
    businessNumberDigits.length === 10 &&
    form.openingDate.length > 0 &&
    businessVerificationStatus !== 'loading'

  useEffect(() => {
    if (!applicationResponse) return
    return lockBodyScroll()
  }, [applicationResponse])

  useEffect(() => {
    const maps = (window as KakaoBrowserWindow).kakao?.maps
    const container = mapContainerRef.current

    if (!maps || !container || kakaoMapRef.current) return

    const initialPosition = new maps.LatLng(37.5665, 126.978)
    const map = new maps.Map(container, {
      center: initialPosition,
      level: 5,
      draggable: false,
    })

    map.addControl(
      new maps.MapTypeControl(),
      maps.ControlPosition.TOPRIGHT,
    )
    map.addControl(
      new maps.ZoomControl(),
      maps.ControlPosition.RIGHT,
    )

    kakaoMapRef.current = map
  }, [])

  useEffect(() => {
    const container = mapContainerRef.current
    if (!container) return

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
  }, [])

  const updateField = (field: keyof HostRegistrationForm, value: string) => {
    if (
      field === 'businessName' ||
      field === 'representativeName' ||
      field === 'businessNumber' ||
      field === 'openingDate'
    ) {
      verificationAttemptRef.current += 1
      setBusinessVerificationStatus('idle')
      setBusinessVerificationMessage('')
    }

    setForm((current) => ({ ...current, [field]: value }))
    setApplicationResponse(null)
    setSubmitError('')
  }

  const handleBusinessVerification = async () => {
    if (!canVerifyBusiness) return

    const attempt = verificationAttemptRef.current + 1
    verificationAttemptRef.current = attempt
    const verificationValues = {
      businessName: form.businessName.trim(),
      representativeName: form.representativeName.trim(),
      businessNumber: businessNumberDigits,
      openingDate: form.openingDate,
    }

    setBusinessVerificationStatus('loading')
    setBusinessVerificationMessage('')

    try {
      const response = await verifyBusiness(verificationValues)
      if (verificationAttemptRef.current !== attempt) return

      setBusinessVerificationStatus(response.verified ? 'success' : 'error')
      setBusinessVerificationMessage(
        response.message || (response.verified
          ? '사업자 정보가 확인되었습니다.'
          : '사업자 정보를 확인하지 못했습니다.'),
      )
    } catch (error) {
      if (verificationAttemptRef.current !== attempt) return

      setBusinessVerificationStatus('error')
      const responseMessage = axios.isAxiosError(error)
        && typeof error.response?.data?.message === 'string'
        ? error.response.data.message
        : null

      setBusinessVerificationMessage(responseMessage ?? '사업자 정보를 확인하지 못했습니다.')
    }
  }
  const handleAddressSearch = async () => {
    setAddressNotice('')
    setIsAddressSearchLoading(true)

    try {
      await loadScript(KAKAO_POSTCODE_SCRIPT_ID, KAKAO_POSTCODE_SCRIPT_URL)

          const postcodeWindow = window as KakaoBrowserWindow
      const Postcode = postcodeWindow.kakao?.Postcode ?? postcodeWindow.daum?.Postcode

      if (!Postcode) {
        throw new Error('Kakao 우편번호 서비스를 초기화하지 못했습니다.')
      }

      new Postcode({
        oncomplete: (data) => {
          console.log('Kakao 우편번호 검색 결과:', data)
          const maps = postcodeWindow.kakao?.maps
          const address = data.roadAddress || data.autoRoadAddress || data.address
          setMapCoordinates(null)

          if (maps) {
            const geocoder = new maps.services.Geocoder()
            geocoder.addressSearch(address, (results, status) => {
              if (status === maps.services.Status.OK && results[0]) {
                const latitude = Number(results[0].y)
                const longitude = Number(results[0].x)
                const position = new maps.LatLng(latitude, longitude)
                setMapCoordinates({ latitude, longitude })

                console.log('검색 주소 좌표:', { latitude, longitude })
                setIsMapVisible(true)

                window.requestAnimationFrame(() => {
                  const container = mapContainerRef.current
                  if (!container) return

                  let map = kakaoMapRef.current
                  let marker = kakaoMarkerRef.current

                  if (!map) {
                    map = new maps.Map(container, {
                      center: position,
                      level: 3,
                      draggable: false,
                    })
                    map.addControl(
                      new maps.MapTypeControl(),
                      maps.ControlPosition.TOPRIGHT,
                    )
                    map.addControl(
                      new maps.ZoomControl(),
                      maps.ControlPosition.RIGHT,
                    )
                    kakaoMapRef.current = map
                  }

                  if (!marker) {
                    marker = new maps.Marker({ map, position })
                    kakaoMarkerRef.current = marker
                  } else {
                    marker.setPosition(position)
                  }

                  map.relayout()
                  map.setCenter(position)
                })
              } else {
                console.error('주소 좌표 변환에 실패했습니다:', status)
              }
            })
          }

          setForm((current) => ({
            ...current,
            businessPostCode: data.zonecode,
            businessRoadAddress: address,
          }))
          setApplicationResponse(null)
          setSubmitError('')
          setIsAddressSearchLoading(false)
        },
        onclose: () => setIsAddressSearchLoading(false),
      }).open()
    } catch (error) {
      console.error('Kakao 우편번호 서비스 실행 실패:', error)
      setAddressNotice(
        '주소 검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
      )
      setIsAddressSearchLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || isSubmitting) return

    const requestValues = {
      ...form,
      businessName: form.businessName.trim(),
      representativeName: form.representativeName.trim(),
      businessNumber: businessNumberDigits,
      businessDetailAddress: form.businessDetailAddress.trim(),
      introduction: form.introduction.trim(),
    }

    setIsSubmitting(true)
    setSubmitError('')
    setApplicationResponse(null)

    try {
      const response = await createHostApplication({
        ...requestValues,
        latitude: mapCoordinates?.latitude ?? null,
        longitude: mapCoordinates?.longitude ?? null,
        agreements,
      })

      setApplicationResponse(response)
      if (response.isHost) markAsHost()
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : '호스트 등록 신청 중 오류가 발생했습니다.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="account-page">
      <div className="account-page-inner account-page-inner-narrow host-register-layout">
        <button
          type="button"
          className="account-back-button"
          onClick={() => onNavigate('/mypage')}
        >
          <span aria-hidden="true">←</span> 마이페이지로 돌아가기
        </button>

        <header className="host-register-heading">
          <span>HOST REGISTRATION</span>
          <h1>호스트 등록</h1>
          <p>사업자 정보를 입력하고 TripFlow 호스트 등록을 신청해 주세요.</p>
        </header>

        <form className="host-register-form" onSubmit={handleSubmit}>
          <section className="host-form-section host-form-business" aria-labelledby="business-info-title">
            <div className="host-form-section-heading">
              <span>01</span>
              <div>
                <h2 id="business-info-title">사업자 정보</h2>
                <p>사업자등록증에 기재된 정보와 동일하게 입력해 주세요.</p>
              </div>
            </div>
            <div className="host-form-grid">
              <label className="host-form-field">
                <span>상호명 <em>필수</em></span>
                <input
                  type="text"
                  name="businessName"
                  value={form.businessName}
                  onChange={(event) => updateField('businessName', event.target.value)}
                  placeholder="상호명을 입력해 주세요"
                  required
                />
              </label>
              <label className="host-form-field">
                <span>대표자명 <em>필수</em></span>
                <input
                  type="text"
                  name="representativeName"
                  value={form.representativeName}
                  onChange={(event) => updateField('representativeName', event.target.value)}
                  placeholder="대표자명을 입력해 주세요"
                  required
                />
              </label>
              <div className="host-form-field">
                <span>사업자등록번호 <em>필수</em></span>
                <input
                  type="text"
                  name="businessNumber"
                  value={form.businessNumber}
                  onChange={(event) => updateField('businessNumber', formatBusinessNumber(event.target.value))}
                  placeholder="000-00-00000"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={12}
                  aria-describedby="business-number-help business-verification-message"
                  required
                />
                <small id="business-number-help">
                  {form.businessNumber && businessNumberDigits.length !== 10
                    ? '숫자 10자리를 입력해 주세요.'
                    : '하이픈은 자동으로 입력됩니다.'}
                </small>
              </div>
              <label className="host-form-field">
                <span>개업일자 <em>필수</em></span>
                <input
                  type="date"
                  name="openingDate"
                  value={form.openingDate}
                  onChange={(event) => updateField('openingDate', event.target.value)}
                  required
                />
              </label>
              <div className="host-business-verification-area">
                <button
                  type="button"
                  className="host-address-button host-business-verification-button"
                  onClick={handleBusinessVerification}
                  disabled={!canVerifyBusiness}
                >
                  {businessVerificationStatus === 'loading' ? '인증 중...' : '사업자 정보 인증'}
                </button>
                {businessVerificationMessage && (
                  <small
                    id="business-verification-message"
                    className={`host-business-verification-message is-${businessVerificationStatus}`}
                    role={businessVerificationStatus === 'error' ? 'alert' : 'status'}
                  >
                    {businessVerificationMessage}
                  </small>
                )}
              </div>
            </div>
          </section>

          <section className="host-form-section host-form-address" aria-labelledby="business-address-title">
            <div className="host-form-section-heading">
              <span>02</span>
              <div>
                <h2 id="business-address-title">사업장 주소</h2>
                <p>주소 검색을 통해 사업장 소재지를 입력해 주세요.</p>
              </div>
            </div>
            <div className="host-address-row">
              <label className="host-form-field">
                <span>우편번호 <em>필수</em></span>
                <input
                  type="text"
                  name="businessPostCode"
                  value={form.businessPostCode}
                  placeholder="주소 검색을 이용해 주세요"
                  readOnly
                  required
                />
              </label>
              <button
                type="button"
                className="host-address-button"
                onClick={handleAddressSearch}
                disabled={isAddressSearchLoading}
              >
                {isAddressSearchLoading ? '주소 검색 중...' : '주소 검색'}
              </button>
            </div>
            {addressNotice && <p className="host-address-notice" role="status">{addressNotice}</p>}
            <div className="host-form-grid host-form-grid-address">
              <label className="host-form-field host-form-field-wide">
                <span>도로명 주소 <em>필수</em></span>
                <input
                  ref={detailAddressRef}
                  type="text"
                  name="businessRoadAddress"
                  value={form.businessRoadAddress}
                  placeholder="주소 검색을 이용해 주세요"
                  readOnly
                  required
                />
              </label>
              <label className="host-form-field host-form-field-wide">
                <span>상세 주소 <i>선택</i></span>
                <input
                  type="text"
                  name="businessDetailAddress"
                  value={form.businessDetailAddress}
                  onChange={(event) => updateField('businessDetailAddress', event.target.value)}
                  placeholder="상세 주소를 입력해 주세요"
                />
              </label>
              <div
                ref={mapContainerRef}
                className={`host-business-map${isMapVisible ? ' is-visible' : ''}`}
                aria-label="검색한 사업장 위치"
              />
            </div>
          </section>

          <section className="host-form-section host-form-introduction" aria-labelledby="host-introduction-title">
            <div className="host-form-section-heading">
              <span>03</span>
              <div>
                <h2 id="host-introduction-title">호스트 소개</h2>
                <p>게스트에게 보여줄 호스트 소개를 작성해 주세요.</p>
              </div>
            </div>
            <label className="host-form-field host-introduction-field">
              <span>소개 <i>선택</i></span>
              <textarea
                name="introduction"
                value={form.introduction}
                onChange={(event) => updateField('introduction', event.target.value)}
                placeholder="호스트와 공간에 대해 간단히 소개해 주세요"
                maxLength={500}
                rows={6}
              />
              <small className="host-character-count">{form.introduction.length} / 500</small>
            </label>
          </section>

          <section className="host-agreement-section" aria-labelledby="host-agreement-title">
            <h2 id="host-agreement-title">등록 신청 동의</h2>
            {([
              ['hostPolicy', '호스트 운영 정책 동의'],
              ['privacy', '개인정보 수집 및 이용 동의'],
              ['informationAccuracy', '입력한 정보가 사실임을 확인'],
            ] as const).map(([key, label]) => (
              <label className="host-agreement" key={key}>
                <input
                  type="checkbox"
                  checked={agreements[key]}
                  onChange={(event) => {
                    setAgreements((current) => ({ ...current, [key]: event.target.checked }))
                    setApplicationResponse(null)
                    setSubmitError('')
                  }}
                />
                <span>{label} <em>필수</em></span>
              </label>
            ))}
          </section>

          <button
            type="submit"
            className="host-register-submit"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? '신청 중...' : '호스트 등록 신청'}
          </button>

          {submitError && (
            <p className="host-submit-error" role="alert">{submitError}</p>
          )}

        </form>
      </div>

      {applicationResponse && (
        <div className="host-completion-layer" role="presentation">
          <div className="host-completion-backdrop" aria-hidden="true" />
          <section
            className="host-completion-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="host-completion-title"
          >
            <div className="host-completion-icon" aria-hidden="true">✓</div>
            <h2 id="host-completion-title">호스트 등록이 완료되었습니다.</h2>
            <p>이제 TripFlow에서 숙소를 등록하고 관리할 수 있습니다.</p>
            <div className="host-completion-actions">
              <button
                type="button"
                className="host-completion-primary"
                onClick={() => onNavigate('/host/dashboard')}
              >
                호스트 페이지로 이동
              </button>
              <button
                type="button"
                className="host-completion-secondary"
                onClick={() => onNavigate('/')}
              >
                메인으로 돌아가기
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default HostRegisterPage

import { useRef, useState, type FormEvent } from 'react'
import './AccountPages.css'

type HostRegisterPageProps = {
  onNavigate: (path: string) => void
}

type HostRegistrationForm = {
  businessName: string
  representativeName: string
  businessNumber: string
  businessPostCode: string
  businessRoadAddress: string
  businessDetailAddress: string
  introduction: string
}

type AgreementKey = 'hostPolicy' | 'privacy' | 'informationAccuracy'

type KakaoMapInstance = {
  addControl: (control: unknown, position: unknown) => void
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

const INITIAL_FORM: HostRegistrationForm = {
  businessName: '',
  representativeName: '',
  businessNumber: '',
  businessPostCode: '',
  businessRoadAddress: '',
  businessDetailAddress: '',
  introduction: '',
}

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

function HostRegisterPage({ onNavigate }: HostRegisterPageProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const kakaoMapRef = useRef<KakaoMapInstance | null>(null)
  const kakaoMarkerRef = useRef<KakaoMarkerInstance | null>(null)

  const [form, setForm] = useState(INITIAL_FORM)
  const [agreements, setAgreements] = useState<Record<AgreementKey, boolean>>({
    hostPolicy: false,
    privacy: false,
    informationAccuracy: false,
  })
  const [addressNotice, setAddressNotice] = useState('')
  const [isAddressSearchLoading, setIsAddressSearchLoading] = useState(false)
  const [isMapVisible, setIsMapVisible] = useState(false)
  const [submittedValues, setSubmittedValues] = useState<HostRegistrationForm | null>(null)
  const detailAddressRef = useRef<HTMLInputElement>(null)

  const businessNumberDigits = form.businessNumber.replace(/\D/g, '')
  const hasRequiredValues =
    form.businessName.trim().length > 0 &&
    form.representativeName.trim().length > 0 &&
    businessNumberDigits.length === 10 &&
    form.businessPostCode.trim().length > 0 &&
    form.businessRoadAddress.trim().length > 0
  const hasRequiredAgreements = Object.values(agreements).every(Boolean)
  const canSubmit = hasRequiredValues && hasRequiredAgreements

  const updateField = (field: keyof HostRegistrationForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setSubmittedValues(null)
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

          if (maps) {
            const geocoder = new maps.services.Geocoder()
            geocoder.addressSearch(address, (results, status) => {
              if (status === maps.services.Status.OK && results[0]) {
                const latitude = Number(results[0].y)
                const longitude = Number(results[0].x)
                const position = new maps.LatLng(latitude, longitude)

                console.log('검색 주소 좌표:', { latitude, longitude })
                setIsMapVisible(true)

                window.requestAnimationFrame(() => {
                  const container = mapContainerRef.current
                  if (!container) return

                  let map = kakaoMapRef.current
                  let marker = kakaoMarkerRef.current

                  if (!map || !marker) {
                    map = new maps.Map(container, {
                      center: position,
                      level: 3,
                      draggable: false,
                    })
                    marker = new maps.Marker({ map, position })
                    map.addControl(
                      new maps.MapTypeControl(),
                      maps.ControlPosition.TOPRIGHT,
                    )
                    map.addControl(
                      new maps.ZoomControl(),
                      maps.ControlPosition.RIGHT,
                    )
                    kakaoMapRef.current = map
                    kakaoMarkerRef.current = marker
                  }

                  map.relayout()
                  map.setCenter(position)
                  marker.setPosition(position)
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
          setSubmittedValues(null)
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    const requestValues = {
      ...form,
      businessName: form.businessName.trim(),
      representativeName: form.representativeName.trim(),
      businessNumber: businessNumberDigits,
      businessDetailAddress: form.businessDetailAddress.trim(),
      introduction: form.introduction.trim(),
    }

    setSubmittedValues(requestValues)
    console.info('호스트 등록 임시 제출 값', requestValues)
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
              <label className="host-form-field host-form-field-wide">
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
                  aria-describedby="business-number-help"
                  required
                />
                <small id="business-number-help">
                  {form.businessNumber && businessNumberDigits.length !== 10
                    ? '숫자 10자리를 입력해 주세요.'
                    : '하이픈은 자동으로 입력됩니다.'}
                </small>
              </label>
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
                    setSubmittedValues(null)
                  }}
                />
                <span>{label} <em>필수</em></span>
              </label>
            ))}
          </section>

          <button type="submit" className="host-register-submit" disabled={!canSubmit}>
            호스트 등록 신청
          </button>

          {submittedValues && (
            <section className="host-submit-result" aria-live="polite">
              <h2>임시 제출이 완료되었습니다.</h2>
              <p>API 연동 전 확인용 데이터이며 실제로 저장되지 않습니다.</p>
              <dl>
                <div><dt>상호명</dt><dd>{submittedValues.businessName}</dd></div>
                <div><dt>대표자명</dt><dd>{submittedValues.representativeName}</dd></div>
                <div><dt>사업자등록번호</dt><dd>{submittedValues.businessNumber}</dd></div>
                <div><dt>주소</dt><dd>{`${submittedValues.businessPostCode} ${submittedValues.businessRoadAddress} ${submittedValues.businessDetailAddress}`.trim()}</dd></div>
                <div><dt>호스트 소개</dt><dd>{submittedValues.introduction || '입력하지 않음'}</dd></div>
              </dl>
            </section>
          )}
        </form>
      </div>
    </main>
  )
}

export default HostRegisterPage

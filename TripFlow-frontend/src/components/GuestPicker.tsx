import { useEffect, useRef, useState } from 'react'
import type { Locale } from '../i18n'

type GuestCounts = {
  adults: number
  children: number
  infants: number
  pets: number
}

type GuestType = keyof GuestCounts

const guestMessages = {
  ko: { traveler: '여행자', guest: '게스트', guests: '명', infant: '유아', infants: '명', pet: '반려동물', pets: '마리', select: '인원 선택', decrease: '줄이기', increase: '늘리기', options: { adults: ['성인', '13세 이상'], children: ['어린이', '2~12세'], infants: ['유아', '2세 미만'], pets: ['반려동물', '보조동물을 동반하시나요?'] } },
  en: { traveler: 'Travelers', guest: 'Guests', guests: '', infant: 'Infants', infants: '', pet: 'Pets', pets: '', select: 'Select guests', decrease: 'decrease', increase: 'increase', options: { adults: ['Adults', 'Age 13+'], children: ['Children', 'Ages 2–12'], infants: ['Infants', 'Under 2'], pets: ['Pets', 'Are you bringing a service animal?'] } },
  ja: { traveler: '旅行者', guest: 'ゲスト', guests: '名', infant: '乳幼児', infants: '名', pet: 'ペット', pets: '匹', select: '人数を選択', decrease: '減らす', increase: '増やす', options: { adults: ['大人', '13歳以上'], children: ['子ども', '2～12歳'], infants: ['乳幼児', '2歳未満'], pets: ['ペット', '介助動物を同伴しますか？'] } },
  zh: { traveler: '旅行者', guest: '房客', guests: '位', infant: '婴幼儿', infants: '位', pet: '宠物', pets: '只', select: '选择人数', decrease: '减少', increase: '增加', options: { adults: ['成人', '13岁及以上'], children: ['儿童', '2至12岁'], infants: ['婴幼儿', '2岁以下'], pets: ['宠物', '是否携带服务性动物？'] } },
} satisfies Record<Locale, { traveler: string; guest: string; guests: string; infant: string; infants: string; pet: string; pets: string; select: string; decrease: string; increase: string; options: Record<GuestType, [string, string]> }>

const maximumGuests: Record<GuestType, number> = {
  adults: 15,
  children: 10,
  infants: 5,
  pets: 5,
}

function GuestPicker({ locale }: { locale: Locale }) {
  const [counts, setCounts] = useState<GuestCounts>({
    adults: 2,
    children: 0,
    infants: 0,
    pets: 0,
  })
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !pickerRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('click', handleDocumentClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('click', handleDocumentClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const updateCount = (type: GuestType, amount: number) => {
    setCounts((current) => ({
      ...current,
      [type]: Math.min(
        maximumGuests[type],
        Math.max(type === 'adults' ? 1 : 0, current[type] + amount),
      ),
    }))
  }

  const totalGuests = counts.adults + counts.children
  const t = guestMessages[locale]
  const summary = [
    `${t.guest} ${totalGuests}${t.guests}`,
    counts.infants ? `${t.infant} ${counts.infants}${t.infants}` : '',
    counts.pets ? `${t.pet} ${counts.pets}${t.pets}` : '',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="guest-picker" ref={pickerRef}>
      <button
        type="button"
        className="search-field guest-picker-trigger"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{t.traveler}</span>
        <strong>{summary}</strong>
      </button>

      <input type="hidden" name="guests" value={totalGuests} />
      <input type="hidden" name="adults" value={counts.adults} />
      <input type="hidden" name="children" value={counts.children} />
      <input type="hidden" name="infants" value={counts.infants} />
      <input type="hidden" name="pets" value={counts.pets} />

      {isOpen && (
        <div className="guest-picker-popover" role="dialog" aria-label={t.select}>
          {(Object.keys(t.options) as GuestType[]).map((type) => {
            const [label, description] = t.options[type]
            const minimum = type === 'adults' ? 1 : 0
            return (
              <div className="guest-picker-row" key={type}>
                <div className="guest-picker-copy">
                  <strong>{label}</strong>
                  <span>{description}</span>
                </div>
                <div className="guest-picker-controls">
                  <button
                    type="button"
                    aria-label={`${label} ${t.decrease}`}
                    disabled={counts[type] <= minimum}
                    onClick={() => updateCount(type, -1)}
                  >
                    −
                  </button>
                  <output aria-live="polite">{counts[type]}</output>
                  <button
                    type="button"
                    aria-label={`${label} ${t.increase}`}
                    disabled={counts[type] >= maximumGuests[type]}
                    onClick={() => updateCount(type, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GuestPicker

import { useEffect, useRef, useState } from 'react'

type GuestCounts = {
  adults: number
  children: number
  infants: number
  pets: number
}

type GuestType = keyof GuestCounts

const guestOptions: Array<{
  type: GuestType
  label: string
  description: string
}> = [
  { type: 'adults', label: '성인', description: '13세 이상' },
  { type: 'children', label: '어린이', description: '2~12세' },
  { type: 'infants', label: '유아', description: '2세 미만' },
  { type: 'pets', label: '반려동물', description: '보조동물을 동반하시나요?' },
]

const maximumGuests: Record<GuestType, number> = {
  adults: 15,
  children: 10,
  infants: 5,
  pets: 5,
}

function GuestPicker() {
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
  const summary = [
    `게스트 ${totalGuests}명`,
    counts.infants ? `유아 ${counts.infants}명` : '',
    counts.pets ? `반려동물 ${counts.pets}마리` : '',
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
        <span>여행자</span>
        <strong>{summary}</strong>
      </button>

      <input type="hidden" name="guests" value={totalGuests} />
      <input type="hidden" name="adults" value={counts.adults} />
      <input type="hidden" name="children" value={counts.children} />
      <input type="hidden" name="infants" value={counts.infants} />
      <input type="hidden" name="pets" value={counts.pets} />

      {isOpen && (
        <div className="guest-picker-popover" role="dialog" aria-label="인원 선택">
          {guestOptions.map((option) => {
            const minimum = option.type === 'adults' ? 1 : 0
            return (
              <div className="guest-picker-row" key={option.type}>
                <div className="guest-picker-copy">
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </div>
                <div className="guest-picker-controls">
                  <button
                    type="button"
                    aria-label={`${option.label} 줄이기`}
                    disabled={counts[option.type] <= minimum}
                    onClick={() => updateCount(option.type, -1)}
                  >
                    −
                  </button>
                  <output aria-live="polite">{counts[option.type]}</output>
                  <button
                    type="button"
                    aria-label={`${option.label} 늘리기`}
                    disabled={counts[option.type] >= maximumGuests[option.type]}
                    onClick={() => updateCount(option.type, 1)}
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

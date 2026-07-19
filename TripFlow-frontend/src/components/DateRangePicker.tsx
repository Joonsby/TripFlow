import { useEffect, useRef, useState } from 'react'
import { localeTags, type Locale } from '../i18n'

type DateRange = {
  start: Date | null
  end: Date | null
}

const dateMessages = {
  ko: { date: '날짜', selectDate: '날짜 선택', selectEnd: '종료일 선택', selectRange: '날짜 범위 선택', previous: '이전 달', next: '다음 달' },
  en: { date: 'Dates', selectDate: 'Select dates', selectEnd: 'Select checkout', selectRange: 'Select date range', previous: 'Previous month', next: 'Next month' },
  ja: { date: '日付', selectDate: '日付を選択', selectEnd: '終了日を選択', selectRange: '日付範囲を選択', previous: '前の月', next: '次の月' },
  zh: { date: '日期', selectDate: '选择日期', selectEnd: '选择结束日期', selectRange: '选择日期范围', previous: '上个月', next: '下个月' },
} satisfies Record<Locale, Record<string, string>>

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1)

const toInputValue = (date: Date | null) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDisplayDate = (date: Date | null, locale: Locale, fallback: string) =>
  date
    ? new Intl.DateTimeFormat(localeTags[locale], {
        year: 'numeric', month: 'short', day: 'numeric',
      }).format(date)
    : fallback

const isSameDay = (left: Date | null, right: Date | null) =>
  Boolean(left && right && left.getTime() === right.getTime())

type CalendarMonthProps = {
  month: Date
  range: DateRange
  minimumDate: Date
  locale: Locale
  onSelect: (date: Date) => void
}

function CalendarMonth({
  month,
  range,
  minimumDate,
  locale,
  onSelect,
}: CalendarMonthProps) {
  const weekDays = Array.from({ length: 7 }, (_, day) =>
    new Intl.DateTimeFormat(localeTags[locale], { weekday: 'narrow' }).format(
      new Date(2024, 0, 7 + day),
    ),
  )
  const firstWeekDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate()
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekDay + 1
    return day >= 1 && day <= daysInMonth
      ? new Date(month.getFullYear(), month.getMonth(), day)
      : null
  })

  return (
    <section className="date-range-month">
      <h3>{new Intl.DateTimeFormat(localeTags[locale], { year: 'numeric', month: 'long' }).format(month)}</h3>
      <div className="date-range-weekdays" aria-hidden="true">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="date-range-days">
        {cells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} />

          const disabled = date < minimumDate
          const isStart = isSameDay(date, range.start)
          const isEnd = isSameDay(date, range.end)
          const isInRange = Boolean(
            range.start && range.end && date > range.start && date < range.end,
          )

          return (
            <button
              type="button"
              key={toInputValue(date)}
              className={[
                isInRange ? 'is-in-range' : '',
                isStart ? 'is-range-start' : '',
                isEnd ? 'is-range-end' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={disabled}
              aria-pressed={isStart || isEnd}
              onClick={() => onSelect(date)}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function DateRangePicker({ locale }: { locale: Locale }) {
  const minimumDate = startOfDay(new Date())
  const initialEnd = new Date(minimumDate)
  initialEnd.setDate(initialEnd.getDate() + 1)

  const [range, setRange] = useState<DateRange>({
    start: minimumDate,
    end: initialEnd,
  })
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(minimumDate.getFullYear(), minimumDate.getMonth(), 1),
  )
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

  const handleSelect = (date: Date) => {
    if (!range.start || range.end || date < range.start) {
      setRange({ start: date, end: null })
      return
    }

    setRange({ start: range.start, end: date })
  }

  const t = dateMessages[locale]
  const rangeLabel = range.end
    ? `${formatDisplayDate(range.start, locale, t.selectDate)} - ${formatDisplayDate(range.end, locale, t.selectDate)}`
    : `${formatDisplayDate(range.start, locale, t.selectDate)} - ${t.selectEnd}`

  return (
    <div className="date-range-picker" ref={pickerRef}>
      <button
        type="button"
        className="search-field date-range-field"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="date-range-label-desktop">{t.date}</span>
        <span className="date-range-label-mobile">{t.selectDate}</span>
        <strong>{rangeLabel}</strong>
      </button>

      <input type="hidden" name="checkIn" value={toInputValue(range.start)} />
      <input type="hidden" name="checkOut" value={toInputValue(range.end)} />

      {isOpen && (
        <div className="date-range-popover" role="dialog" aria-label={t.selectRange}>
          <button
            type="button"
            className="date-range-nav date-range-nav-previous"
            aria-label={t.previous}
            disabled={visibleMonth <= new Date(minimumDate.getFullYear(), minimumDate.getMonth(), 1)}
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
          >
            ‹
          </button>
          <div className="date-range-calendars">
            <CalendarMonth
              month={visibleMonth}
              range={range}
              minimumDate={minimumDate}
              locale={locale}
              onSelect={handleSelect}
            />
            <CalendarMonth
              month={addMonths(visibleMonth, 1)}
              range={range}
              minimumDate={minimumDate}
              locale={locale}
              onSelect={handleSelect}
            />
          </div>
          <button
            type="button"
            className="date-range-nav date-range-nav-next"
            aria-label={t.next}
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

export default DateRangePicker

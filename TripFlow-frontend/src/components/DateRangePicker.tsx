import { useEffect, useRef, useState } from 'react'

type DateRange = {
  start: Date | null
  end: Date | null
}

const weekDays = ['일', '월', '화', '수', '목', '금', '토']

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

const formatDisplayDate = (date: Date | null) =>
  date
    ? `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`
    : '날짜 선택'

const isSameDay = (left: Date | null, right: Date | null) =>
  Boolean(left && right && left.getTime() === right.getTime())

type CalendarMonthProps = {
  month: Date
  range: DateRange
  minimumDate: Date
  onSelect: (date: Date) => void
}

function CalendarMonth({
  month,
  range,
  minimumDate,
  onSelect,
}: CalendarMonthProps) {
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
      <h3>{`${month.getFullYear()}년 ${month.getMonth() + 1}월`}</h3>
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

function DateRangePicker() {
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

  const rangeLabel = range.end
    ? `${formatDisplayDate(range.start)} - ${formatDisplayDate(range.end)}`
    : `${formatDisplayDate(range.start)} - 종료일 선택`

  return (
    <div className="date-range-picker" ref={pickerRef}>
      <button
        type="button"
        className="search-field date-range-field"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="date-range-label-desktop">날짜</span>
        <span className="date-range-label-mobile">날짜 선택</span>
        <strong>{rangeLabel}</strong>
      </button>

      <input type="hidden" name="checkIn" value={toInputValue(range.start)} />
      <input type="hidden" name="checkOut" value={toInputValue(range.end)} />

      {isOpen && (
        <div className="date-range-popover" role="dialog" aria-label="날짜 범위 선택">
          <button
            type="button"
            className="date-range-nav date-range-nav-previous"
            aria-label="이전 달"
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
              onSelect={handleSelect}
            />
            <CalendarMonth
              month={addMonths(visibleMonth, 1)}
              range={range}
              minimumDate={minimumDate}
              onSelect={handleSelect}
            />
          </div>
          <button
            type="button"
            className="date-range-nav date-range-nav-next"
            aria-label="다음 달"
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

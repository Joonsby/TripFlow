import { useCallback, useEffect, useState } from 'react'

const CODE_TTL_SECONDS = 180
const RESEND_COOLDOWN_SECONDS = 60

export default function useVerificationTimer() {
  const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(null)
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null)
  const [codeSeconds, setCodeSeconds] = useState(0)
  const [resendSeconds, setResendSeconds] = useState(0)

  useEffect(() => {
    if (codeExpiresAt === null && resendAvailableAt === null) return

    const update = () => {
      const now = Date.now()
      setCodeSeconds(codeExpiresAt === null ? 0 : Math.max(0, Math.ceil((codeExpiresAt - now) / 1000)))
      setResendSeconds(resendAvailableAt === null ? 0 : Math.max(0, Math.ceil((resendAvailableAt - now) / 1000)))
    }
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [codeExpiresAt, resendAvailableAt])

  const start = useCallback(() => {
    const now = Date.now()
    setCodeExpiresAt(now + CODE_TTL_SECONDS * 1000)
    setResendAvailableAt(now + RESEND_COOLDOWN_SECONDS * 1000)
    setCodeSeconds(CODE_TTL_SECONDS)
    setResendSeconds(RESEND_COOLDOWN_SECONDS)
  }, [])

  const stop = useCallback(() => {
    setCodeExpiresAt(null)
    setResendAvailableAt(null)
    setCodeSeconds(0)
    setResendSeconds(0)
  }, [])

  return {
    codeSeconds,
    resendSeconds,
    isExpired: codeExpiresAt !== null && codeSeconds === 0,
    start,
    stop,
  }
}

export const formatVerificationTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

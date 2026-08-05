let lockCount = 0
let originalOverflow = ''

export function lockBodyScroll() {
  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  lockCount += 1
  let isReleased = false

  return () => {
    if (isReleased) return
    isReleased = true
    lockCount = Math.max(0, lockCount - 1)

    if (lockCount === 0) {
      document.body.style.overflow = originalOverflow
      originalOverflow = ''
    }
  }
}

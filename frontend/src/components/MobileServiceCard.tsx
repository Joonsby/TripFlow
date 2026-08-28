import type { ReactNode } from 'react'
import './MobileServiceCard.css'

type MobileServiceCardProps = {
  headerStart: ReactNode
  headerEnd?: ReactNode
  children: ReactNode
  footerLabel?: ReactNode
  footerValue?: ReactNode
  className?: string
}

function MobileServiceCard({
  headerStart,
  headerEnd,
  children,
  footerLabel,
  footerValue,
  className = '',
}: MobileServiceCardProps) {
  const hasFooter = footerLabel !== undefined || footerValue !== undefined

  return (
    <article className={`mobile-service-card ${className}`.trim()}>
      <header className="mobile-service-card-header">
        <div className="mobile-service-card-header-start">{headerStart}</div>
        {headerEnd !== undefined && <div className="mobile-service-card-header-end">{headerEnd}</div>}
      </header>
      <div className="mobile-service-card-content">{children}</div>
      {hasFooter && (
        <footer className="mobile-service-card-footer">
          <div className="mobile-service-card-footer-label">{footerLabel}</div>
          <div className="mobile-service-card-footer-value">{footerValue}</div>
        </footer>
      )}
    </article>
  )
}

export default MobileServiceCard

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './SidebarActionButton.css'

type SidebarActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  isActive?: boolean
  activeBorder?: boolean
}

function SidebarActionButton({ children, className = '', isActive = false, activeBorder = true, ...buttonProps }: SidebarActionButtonProps) {
  return (
    <button
      {...buttonProps}
      className={`sidebar-action-button${isActive ? ' is-active' : ''} ${className}`.trim()}
      data-active-border={activeBorder ? 'true' : 'false'}
    >
      {children}
    </button>
  )
}

export default SidebarActionButton

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const ENTER_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
const LEAVE_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const ENTER_MS = 560
const LEAVE_MS = 380

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function AlertBanner({ onClose }) {
  const shellRef = useRef(null)
  const closedRef = useRef(false)
  const [leaving, setLeaving] = useState(false)

  const finishClose = () => {
    if (closedRef.current) return
    closedRef.current = true
    onClose()
  }

  useLayoutEffect(() => {
    const el = shellRef.current
    if (!el) return undefined

    if (prefersReducedMotion()) {
      el.style.height = 'auto'
      el.style.opacity = '1'
      el.style.transform = 'none'
      el.style.marginBottom = '16px'
      return undefined
    }

    let cancelled = false
    let outerFrame = 0
    let innerFrame = 0

    el.style.height = '0px'
    el.style.opacity = '0'
    el.style.transform = 'translate3d(0, -12px, 0)'
    el.style.marginBottom = '0px'

    outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        if (cancelled) return
        const height = el.scrollHeight
        el.style.transition = [
          `height ${ENTER_MS}ms ${ENTER_EASE}`,
          `opacity ${Math.round(ENTER_MS * 0.85)}ms ${ENTER_EASE}`,
          `transform ${ENTER_MS}ms ${ENTER_EASE}`,
          `margin-bottom ${ENTER_MS}ms ${ENTER_EASE}`,
        ].join(', ')
        el.style.height = `${height}px`
        el.style.opacity = '1'
        el.style.transform = 'translate3d(0, 0, 0)'
        el.style.marginBottom = '16px'
      })
    })

    const onEnterEnd = (event) => {
      if (cancelled || event.target !== el || event.propertyName !== 'height') return
      el.style.height = 'auto'
      el.style.transition = ''
    }

    el.addEventListener('transitionend', onEnterEnd)
    return () => {
      cancelled = true
      cancelAnimationFrame(outerFrame)
      cancelAnimationFrame(innerFrame)
      el.removeEventListener('transitionend', onEnterEnd)
    }
  }, [])

  useEffect(() => {
    if (!leaving) return undefined

    const el = shellRef.current
    if (!el || prefersReducedMotion()) {
      finishClose()
      return undefined
    }

    const height = el.getBoundingClientRect().height
    el.style.height = `${height}px`
    el.style.transition = 'none'
    void el.offsetHeight

    el.style.transition = [
      `height ${LEAVE_MS}ms ${LEAVE_EASE}`,
      `opacity ${Math.round(LEAVE_MS * 0.75)}ms ${LEAVE_EASE}`,
      `transform ${LEAVE_MS}ms ${LEAVE_EASE}`,
      `margin-bottom ${LEAVE_MS}ms ${LEAVE_EASE}`,
    ].join(', ')
    el.style.height = '0px'
    el.style.opacity = '0'
    el.style.transform = 'translate3d(0, -10px, 0)'
    el.style.marginBottom = '0px'

    const onLeaveEnd = (event) => {
      if (event.target !== el) return
      if (event.propertyName !== 'height' && event.propertyName !== 'opacity') return
      finishClose()
    }

    el.addEventListener('transitionend', onLeaveEnd)
    const fallback = window.setTimeout(finishClose, LEAVE_MS + 80)

    return () => {
      el.removeEventListener('transitionend', onLeaveEnd)
      window.clearTimeout(fallback)
    }
  }, [leaving])

  const handleClose = () => {
    if (leaving) return
    setLeaving(true)
  }

  return (
    <div
      ref={shellRef}
      className={`alert-banner-shell${leaving ? ' alert-banner-shell--leave' : ''}`}
    >
      <div className="alert-banner">
        <div className="alert-banner-content">
          <svg className="alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="alert-text">
            <strong>Importante</strong>
            <span>
              Estamos com problemas de conectividade com a AWS. Considere qualquer ação automática como parte desta resolução.
            </span>
          </div>
        </div>
        <button className="alert-close" aria-label="Fechar" onClick={handleClose} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}

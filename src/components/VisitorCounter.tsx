import { useEffect, useRef } from 'react'

export function VisitorCounter() {
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Load the nostalgic script
    const script = document.createElement('script')
    script.src = 'https://nostalgic.llll-ll.com/components/visit.js'
    script.async = true
    document.head.appendChild(script)
    scriptRef.current = script

    // Format counter with commas
    const formatCounter = () => {
      const counter = containerRef.current?.querySelector('nostalgic-counter')
      if (counter?.textContent) {
        const num = counter.textContent.replace(/,/g, '')
        if (/^\d+$/.test(num)) {
          counter.textContent = parseInt(num).toLocaleString()
        }
      }
    }

    // Wait for counter to load and format it
    const timer = setInterval(() => {
      const counter = containerRef.current?.querySelector('nostalgic-counter')
      if (counter?.textContent && counter.textContent !== '0') {
        formatCounter()
        clearInterval(timer)
      }
    }, 100)

    return () => {
      clearInterval(timer)
      // Cleanup script on component unmount
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current)
      }
    }
  }, [])

  return (
    <div ref={containerRef} style={{ fontSize: '0.75rem', fontFamily: 'inherit' }}>
      <nostalgic-counter
        id="3min-ffe7299f"
        type="total"
        style={{ fontFamily: 'inherit' }}
      ></nostalgic-counter>{' '}
      visits
    </div>
  )
}

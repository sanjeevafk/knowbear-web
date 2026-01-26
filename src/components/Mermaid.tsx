import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
})

interface MermaidProps {
    chart: string
}

export default function Mermaid({ chart }: MermaidProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (ref.current && chart) {
            // Unique ID for each diagram
            const id = 'mermaid-' + Math.random().toString(36).substr(2, 9)

            try {
                // Clear existing content
                ref.current.innerHTML = ''

                mermaid.render(id, chart).then(({ svg }) => {
                    if (ref.current) {
                        ref.current.innerHTML = svg
                    }
                }).catch(err => {
                    console.error('Mermaid Render Error:', err)
                    if (ref.current) ref.current.innerHTML = 'Error rendering diagram'
                })
            } catch (err) {
                console.error('Mermaid Initialization Error:', err)
            }
        }
    }, [chart])

    return (
        <div
            ref={ref}
            className="mermaid-container flex justify-center my-6 bg-dark-900/50 p-4 rounded-xl border border-white/5 overflow-x-auto"
        />
    )
}

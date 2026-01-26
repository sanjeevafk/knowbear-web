import type { Level } from '../types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Mermaid from './Mermaid'

interface ExplanationCardProps {
    level: Level
    content: string
}

const LEVEL_COLORS: Record<Level, string> = {
    eli5: 'border-l-green-500',
    eli10: 'border-l-teal-500',
    eli12: 'border-l-cyan-500',
    eli15: 'border-l-blue-500',
    meme: 'border-l-purple-500',
    classic60: 'border-l-yellow-500',
    gentle70: 'border-l-indigo-500',
    warm80: 'border-l-rose-500',
}

const LEVEL_NAMES: Record<Level, string> = {
    eli5: 'Explain Like I\'m 5',
    eli10: 'Explain Like I\'m 10',
    eli12: 'Explain Like I\'m 12',
    eli15: 'Explain Like I\'m 15',
    meme: 'Meme Explanation',
    classic60: 'Classic Mode',
    gentle70: 'Gentle Mode',
    warm80: 'Warm Mode',
}

export default function ExplanationCard({ level, content }: ExplanationCardProps) {
    return (
        <div
            className={`bg-dark-700 border-l-4 ${LEVEL_COLORS[level]} rounded-lg p-6 transition-all`}
        >
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 border-b border-white/5 pb-2">
                {LEVEL_NAMES[level]}
            </h3>

            <div className="prose prose-invert max-w-none text-gray-200 leading-relaxed prose-headings:text-white prose-a:text-cyan-400 prose-code:text-cyan-300">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            const codeStr = String(children).replace(/\n$/, '')

                            if (!inline && match && match[1] === 'mermaid') {
                                return <Mermaid chart={codeStr} />
                            }

                            return (
                                <code className={`${className} bg-dark-900 rounded px-1.5 py-0.5 text-xs font-mono`} {...props}>
                                    {children}
                                </code>
                            )
                        },
                        pre({ children }) {
                            return <pre className="bg-dark-900 p-4 rounded-xl border border-white/5 overflow-x-auto my-4">{children}</pre>
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    )
}

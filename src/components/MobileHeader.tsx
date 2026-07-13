import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

interface MobileHeaderProps {
    isOpen: boolean
    onToggle: () => void
}

export default function MobileHeader({ isOpen, onToggle }: MobileHeaderProps) {
    return (
        <div className="md:hidden sticky top-0 z-40">
            <div className="bg-dark-900/80 backdrop-blur-xl border-b border-white/10">
                <div className="px-3 py-3 flex items-center justify-between">
                    <button
                        onClick={onToggle}
                        className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-dark-600 bg-dark-800 text-gray-200 hover:text-white hover:bg-dark-700 transition-colors"
                        aria-label={isOpen ? 'Close menu' : 'Open menu'}
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <div className="flex items-center gap-2">
                        <img
                            src="/favicon.svg"
                            alt="KnowBear"
                            className="w-6 h-6"
                        />
                        <span className="text-sm font-semibold tracking-wide text-white">
                            Know<span className="text-amber-500">Bear</span>
                        </span>
                    </div>

                    <ThemeToggle />
                </div>
            </div>
        </div>
    )
}

import { motion } from 'framer-motion'
import { ArrowRight, Layers, Zap, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
            <div className="fixed inset-0 z-0">
                <div className="stars" />
                <div className="stars stars-2" />
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-black to-black" />
            </div>

            <header className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/favicon.svg" alt="KnowBear" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                    <span className="text-2xl font-black tracking-tight">Know<span className="text-cyan-500">Bear</span></span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm text-gray-300">
                    <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How it works</a>
                    <a href="#workflow" className="hover:text-cyan-400 transition-colors">Workflow</a>
                </nav>

                <Link
                    to="/app"
                    className="px-5 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
                >
                    Try the App
                </Link>
            </header>

            <main className="relative z-10">
                <section className="px-6 pt-16 pb-24">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]"
                        >
                            Search Any Topic,
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Get Clear Explanations Fast</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="mt-8 text-gray-300 text-lg md:text-xl max-w-3xl mx-auto"
                        >
                            Ask a question, pull live retrieval context, and read structured explanations in either fast mode or ensemble mode.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mt-10"
                        >
                            <Link
                                to="/app"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg transition-colors"
                            >
                                Start Searching
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>
                </section>

                <section id="how-it-works" className="px-6 py-20 bg-white/[0.03] border-y border-white/10">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Layers className="w-6 h-6 text-cyan-400" />}
                            title="Search-driven answers"
                            description="Each request enriches model output with live retrieval context from web search providers."
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-blue-400" />}
                            title="Fast and ensemble"
                            description="Use fast mode for low-latency responses or ensemble mode for stronger synthesis quality."
                        />
                        <FeatureCard
                            icon={<Download className="w-6 h-6 text-indigo-400" />}
                            title="Export results"
                            description="Copy markdown or export explanations as text/markdown files."
                        />
                    </div>
                </section>

                <section id="workflow" className="px-6 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">How It Flows</h2>
                        <p className="mt-4 text-gray-300">
                            Enter a topic, pick a mode, stream the response, then export the final explanation as markdown or text.
                            Use fast mode when speed matters and ensemble mode when depth and consistency matter most.
                        </p>
                        <div className="mt-8">
                            <Link to="/app" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                                Try the app →
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="relative z-10 border-t border-white/10 py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
                    <span>© 2026 KnowBear Demo</span>
                    <span>Stateless demo.</span>
                    <div className="flex items-center gap-6">
                        <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                        <Link to="/app" className="hover:text-cyan-400 transition-colors">Try the App</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
    return (
        <div className="p-6 rounded-2xl border border-white/10 bg-black/40">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="mt-2 text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
    )
}

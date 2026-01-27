import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    ArrowRight,
    Search,
    Cpu,
    Layers,
    CheckCircle2,
    Globe,
    ShieldCheck
} from 'lucide-react'
import { LoginButton } from '../components/LoginButton'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

export default function LandingPage() {
    const navigate = useNavigate()
    const { user } = useAuth()

    useEffect(() => {
        if (user) {
            navigate('/app')
        }
    }, [user, navigate])


    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
            {/* Starry Background */}
            <div className="fixed inset-0 z-0">
                <div className="stars"></div>
                <div className="stars stars-2"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-black to-black"></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <img src="/favicon.svg" alt="Logo" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    <span className="text-2xl font-black tracking-tighter">Know<span className="text-cyan-500">Bear</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
                    <a href="#models" className="hover:text-cyan-400 transition-colors">Intelligence</a>
                    <a href="#export" className="hover:text-cyan-400 transition-colors">Tools</a>
                </div>
                <div className="flex items-center gap-4 scale-90 md:scale-100 origin-right transition-transform">
                    <LoginButton className="!px-4 !py-1.5 !text-xs md:!px-5 md:!py-2 md:!text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all" />
                </div>
            </nav>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="pt-20 pb-32 px-6 overflow-hidden">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, type: "spring" }}
                            className="inline-flex flex-wrap justify-center sm:flex-nowrap items-center gap-x-2 gap-y-1 p-2 px-3 sm:p-3 sm:px-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[0.65rem] sm:text-xs font-bold uppercase tracking-widest sm:tracking-[0.2em] mb-8 max-w-[95vw] text-center"
                        >
                            The Next-Gen Knowledge Engine
                            <span className="py-0.5 px-2 bg-cyan-500/20 rounded-md text-[10px] lowercase tracking-normal font-medium border border-cyan-500/30 whitespace-nowrap">v2-beta</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-8"
                        >
                            Know Everything. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">Simpler.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
                        >
                            From razor-sharp technical breakdowns to clever, instantly relatable insights, <br className="hidden md:block" />
                            KnowBear turns the world’s knowledge into exactly the explanation you’re craving right now. <br className="hidden md:block" />
                            Every answer is crystal-clear, perfectly paced, and comes with that little extra spark of perspective that makes it stick.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex flex-col items-center justify-center gap-4"
                        >
                            <button
                                onClick={() => navigate('/app')}
                                className="w-full sm:w-auto px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-black text-lg shadow-[0_20px_50px_rgba(8,145,178,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 group"
                            >
                                Start Researching
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="mt-8 text-cyan-500/50 text-sm font-medium tracking-wide italic max-w-sm mx-auto">
                                "Finally, a research engine that handles academic rigor or a sharp, clever breakdown with equal brilliance. Knowledge with a human spark."
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Multimodal Feature Grid */}
                <section id="features" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Search className="w-8 h-8 text-cyan-400" />}
                                title="Real-time Web Synthesis"
                                description="Deeply integrated browsing technology to fetch the most current facts from the live internet, ensuring accuracy and detail."
                            />
                            <FeatureCard
                                icon={<Layers className="w-8 h-8 text-purple-400" />}
                                title="Dynamic Logic"
                                description="Shift seamlessly between meticulous academic rigor and witty, relatable analogies. We don’t just fetch facts; we translate them into insights that actually resonate."
                            />
                            <FeatureCard
                                icon={<Cpu className="w-8 h-8 text-blue-400" />}
                                title="Intelligent Routing"
                                description="Automatically selects the most capable models for your task to provide the highest quality technical and creative output."
                            />
                        </div>
                    </div>
                </section>

                {/* Intelligence Section */}
                <section id="models" className="py-32 px-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">
                                Built for <span className="text-cyan-500">Unrivaled</span> Clarity and Clever Insight.
                            </h2>
                            <div className="space-y-6">
                                <CheckItem title="Technical Depth Mode" description="Graduate-level research reports with full academic structure and automated technical diagrams." />
                                <CheckItem title="Relatable Reasoning" description="Clever analogies and a touch of wit that turn daunting concepts into lighthearted, sensory revelations." />
                                <CheckItem title="Wisdom-Infused Streaming" description="Hyper-fast responses delivered with a final drop of timeless perspective to keep your mind buzzing." />
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative bg-dark-800 border border-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden aspect-video flex flex-col justify-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center"><Cpu className="text-cyan-400" /></div>
                                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: "0%" }} whileInView={{ width: "100%" }} transition={{ duration: 2 }} className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></motion.div>
                                    </div>
                                    <span className="text-cyan-400 font-mono text-sm leading-none">1,200 t/s</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center"><Globe className="text-blue-400" /></div>
                                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: "0%" }} whileInView={{ width: "85%" }} transition={{ duration: 2, delay: 0.5 }} className="h-full bg-blue-500"></motion.div>
                                    </div>
                                    <span className="text-blue-400 font-mono text-sm leading-none">Global Sync</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center"><ShieldCheck className="text-indigo-400" /></div>
                                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: "0%" }} whileInView={{ width: "100%" }} transition={{ duration: 2, delay: 1 }} className="h-full bg-indigo-500"></motion.div>
                                    </div>
                                    <span className="text-indigo-400 font-mono text-sm leading-none">Secured</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tools & Export */}
                <section id="export" className="py-24 px-6 bg-white/[0.02] overflow-hidden">
                    <div className="max-w-7xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Work with your results.</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Seamlessly copy, share, or document your findings with perfectly formatted exports.</p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-20 px-6 border-t border-white/5">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
                            <div className="flex items-center gap-2">
                                <img src="/favicon.svg" alt="Logo" className="w-8 h-8 opacity-50 grayscale" />
                                <span className="text-xl font-black tracking-tighter opacity-50">Know<span className="text-white">Bear</span></span>
                            </div>
                            <p className="text-gray-600 text-sm max-w-xs">AI Research Engine for the Modern World. Building the future of tailored knowledge.</p>
                        </div>
                        <div className="flex items-center gap-8 text-gray-400 text-sm font-medium">
                            <span>© 2026 KnowBear</span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-8 bg-dark-800/50 border border-white/5 rounded-3xl hover:border-white/10 transition-all flex flex-col items-start gap-6"
        >
            <div className="p-4 bg-white/5 rounded-2xl">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
        </motion.div>
    )
}

function CheckItem({ title, description }: { title: string, description: string }) {
    return (
        <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-cyan-500 shrink-0" />
            <div>
                <h4 className="font-bold text-white mb-1">{title}</h4>
                <p className="text-gray-500 text-sm">{description}</p>
            </div>
        </div>
    )
}



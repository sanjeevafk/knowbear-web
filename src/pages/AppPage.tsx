import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCcw, RotateCcw, AlertTriangle } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import type { Level, Mode, PinnedTopic } from '../types'
import SearchBar from '../components/SearchBar'
import LevelDropdown from '../components/LevelDropdown'
import ExplanationCard from '../components/ExplanationCard'
import { LoadingState } from '../components/LoadingState'
import PinnedTopics from '../components/PinnedTopics'
import { useKnowBearStore } from '../store/useKnowBearStore'

const FALLBACK_PINNED_TOPICS: PinnedTopic[] = [
    { id: 'tcp-ip', title: 'TCP/IP Layers', description: 'Protocols and responsibilities by layer.' },
    { id: 'osi', title: 'OSI Model', description: 'A clean reference for network fundamentals.' },
    { id: 'climate-change', title: 'Climate Change', description: 'Causes, impacts, and practical responses.' },
    { id: 'rag', title: 'How LLM RAG Works', description: 'Retrieval + generation in practice.' },
]

export default function AppPage() {
    const {
        loading,
        result,
        selectedLevel,
        error,
        mode,
        fetchingLevels,
        failedLevels,
        activeTopic,
        loadingMeta,
        modeSwitching,
        streamStatus,
        lastFailedRequest,
        pinnedTopics,
    } = useKnowBearStore(useShallow((state) => ({
        loading: state.loading,
        result: state.result,
        selectedLevel: state.selectedLevel,
        error: state.error,
        mode: state.mode,
        fetchingLevels: state.fetchingLevels,
        failedLevels: state.failedLevels,
        activeTopic: state.activeTopic,
        loadingMeta: state.loadingMeta,
        modeSwitching: state.modeSwitching,
        streamStatus: state.streamStatus,
        lastFailedRequest: state.lastFailedRequest,
        pinnedTopics: state.pinnedTopics,
    })))

    const {
        setSelectedLevel,
        setMode,
        setModeSwitching,
        setResult,
        setFetchingLevels,
        startSearch,
        fetchLevel,
        abortCurrentStream,
        retryLastFailed,
        fetchPinnedTopics,
    } = useKnowBearStore(useShallow((state) => ({
        setSelectedLevel: state.setSelectedLevel,
        setMode: state.setMode,
        setModeSwitching: state.setModeSwitching,
        setResult: state.setResult,
        setFetchingLevels: state.setFetchingLevels,
        startSearch: state.startSearch,
        fetchLevel: state.fetchLevel,
        abortCurrentStream: state.abortCurrentStream,
        retryLastFailed: state.retryLastFailed,
        fetchPinnedTopics: state.fetchPinnedTopics,
    })))

    useEffect(() => {
        fetchPinnedTopics()
    }, [fetchPinnedTopics])

    const handleSearch = useCallback(
        async (topic: string, forceRefresh = false, requestedMode?: Mode, requestedLevel?: Level) => {
            await startSearch(topic, forceRefresh, requestedMode, requestedLevel)
        },
        [startSearch]
    )

    useEffect(() => {
        if (activeTopic && !loading && result && result.mode !== mode && !loadingMeta) {
            setModeSwitching(true)
            abortCurrentStream()
            setResult(null)
            setFetchingLevels(new Set())
            handleSearch(activeTopic, false, mode).finally(() => setModeSwitching(false))
        }
    }, [
        mode,
        activeTopic,
        loading,
        result,
        loadingMeta,
        abortCurrentStream,
        handleSearch,
        setFetchingLevels,
        setModeSwitching,
        setResult,
    ])

    const handleLevelClick = async (level: Level) => {
        if (!result) return

        const currentExplanation = result.explanations[level]
        if (currentExplanation && !fetchingLevels.has(level) && !failedLevels.has(level)) {
            setSelectedLevel(level)
            return
        }

        setSelectedLevel(level)

        if (!currentExplanation && !fetchingLevels.has(level)) {
            await fetchLevel(result.topic, level, mode)
        }
    }

    const handleRegenerateSelectedLevel = async () => {
        if (!result || !activeTopic) return
        const randomTemp = Math.random() * (1.1 - 0.95) + 0.95
        await fetchLevel(activeTopic, selectedLevel, mode, { regenerate: true, temperature: randomTemp })
    }

    const streamBadge =
        streamStatus === 'live'
            ? { label: 'Live stream', className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' }
            : streamStatus === 'fallback'
                ? { label: 'Fallback mode', className: 'bg-amber-500/10 text-amber-300 border-amber-500/30' }
                : streamStatus === 'degraded'
                    ? { label: 'Degraded stream', className: 'bg-red-500/10 text-red-300 border-red-500/30' }
                    : null

    const sourceChips = (() => {
        const content = result?.explanations?.[selectedLevel] || ''
        const urlRegex = /https?:\/\/[^\s)]+/g
        const urls = Array.from(new Set((content.match(urlRegex) || []).map((url: string) => {
            try {
                const parsed = new URL(url)
                return parsed.hostname.replace(/^www\./, '')
            } catch {
                return null
            }
        }).filter((host: string | null): host is string => Boolean(host))))
        return urls.slice(0, 5)
    })()

    const visiblePinnedTopics = pinnedTopics.length > 0 ? pinnedTopics : FALLBACK_PINNED_TOPICS

    return (
        <div className="flex h-screen bg-dark-900 text-white overflow-hidden">
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 pb-6 sm:pt-8 sm:pb-8 space-y-4 sm:space-y-6">
                        <div className="space-y-3 pt-1 sm:pt-2">
                            <SearchBar onSearch={(topic) => handleSearch(topic, false)} loading={loading} mode={mode} onModeChange={setMode} />

                            {modeSwitching && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-sm text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2"
                                >
                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                    <span>Switching mode...</span>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 space-y-3"
                                >
                                    <p>{error}</p>
                                    {lastFailedRequest && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                onClick={() => retryLastFailed()}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-100 text-sm"
                                            >
                                                <AlertTriangle className="w-4 h-4" />
                                                Retry Last Failed
                                            </button>
                                            <span className="text-xs text-red-200/70">
                                                {lastFailedRequest.topic} - {lastFailedRequest.mode} - {lastFailedRequest.level}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {!activeTopic && !loading && !result && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="pt-4 sm:pt-6"
                            >
                                <PinnedTopics topics={visiblePinnedTopics} onSelect={(topic) => handleSearch(topic, false)} />
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {loading && loadingMeta ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <LoadingState mode={loadingMeta.mode} level={loadingMeta.level} topic={loadingMeta.topic} />
                                </motion.div>
                            ) : result ? (
                                <motion.section
                                    key={`result-${result.topic}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className="space-y-6"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight break-words">{result.topic}</h2>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <p className="text-sm text-gray-500">
                                                    Mode: <span className="text-cyan-400 font-medium">{mode}</span>
                                                </p>
                                                {streamBadge && (
                                                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${streamBadge.className}`}>
                                                        {streamBadge.label}
                                                    </span>
                                                )}
                                            </div>
                                            {sourceChips.length > 0 && (
                                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                    {sourceChips.map((source) => (
                                                        <span
                                                            key={source}
                                                            className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30 text-cyan-200 bg-cyan-500/10"
                                                        >
                                                            {source}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                                            <LevelDropdown selected={selectedLevel} onChange={handleLevelClick} />
                                            <button
                                                onClick={handleRegenerateSelectedLevel}
                                                disabled={fetchingLevels.has(selectedLevel) || loading}
                                                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Regenerate Level
                                            </button>
                                        </div>
                                    </div>

                                    <ExplanationCard
                                        level={selectedLevel}
                                        content={result.explanations[selectedLevel] || ''}
                                        streaming={fetchingLevels.has(selectedLevel)}
                                    />
                                </motion.section>
                            ) : (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-4 pb-6 sm:pt-6 sm:pb-8">
                                    <p className="text-gray-400 text-base sm:text-lg mb-2">Search for a topic to get started</p>
                                    <p className="text-gray-500 text-sm">Type a topic above to begin.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    )
}


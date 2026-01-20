import { useState, useEffect, useCallback, useRef } from 'react'
import { getPinnedTopics, queryTopic } from './api'
import type { PinnedTopic, QueryResponse, Level } from './types'
import { FREE_LEVELS } from './types'
import SearchBar from './components/SearchBar'
import PinnedTopics from './components/PinnedTopics'
import LevelDropdown from './components/LevelDropdown'
import ExplanationCard from './components/ExplanationCard'
import ExportButtons from './components/ExportButtons'
import Spinner from './components/Spinner'

export default function App() {
    const [pinned, setPinned] = useState<PinnedTopic[]>([])
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<QueryResponse | null>(null)
    const [selectedLevel, setSelectedLevel] = useState<Level>('eli5')
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<'fast' | 'ensemble'>('fast')
    const [fetchingLevels, setFetchingLevels] = useState<Set<Level>>(new Set())

    // Use a ref to track current search topic to avoid race conditions
    const currentTopicRef = useRef<string | null>(null)

    useEffect(() => {
        getPinnedTopics()
            .then(setPinned)
            .catch(() => { })
    }, [])

    const fetchLevel = useCallback(async (topic: string, level: Level) => {
        if (!topic) return
        setFetchingLevels(prev => new Set(prev).add(level))
        try {
            const res = await queryTopic({
                topic,
                levels: [level],
                mode
            })

            // Only update if it's still the current topic
            if (currentTopicRef.current === topic) {
                setResult(prev => {
                    if (!prev || prev.topic !== topic) {
                        return { ...res, explanations: { ...res.explanations } }
                    }
                    return {
                        ...prev,
                        explanations: { ...prev.explanations, ...res.explanations }
                    }
                })
            }
        } catch (err) {
            console.error(`Failed to fetch ${level}:`, err)
        } finally {
            setFetchingLevels(prev => {
                const next = new Set(prev)
                next.delete(level)
                return next
            })
        }
    }, [mode])

    const handleSearch = useCallback(async (topic: string) => {
        setLoading(true)
        setError(null)
        setResult(null)
        setFetchingLevels(new Set())
        currentTopicRef.current = topic

        try {
            // Initial fetch for the selected level only for speed
            const res = await queryTopic({
                topic,
                levels: [selectedLevel],
                mode
            })

            if (currentTopicRef.current === topic) {
                setResult(res)

                // Background fetch others if in fast mode to pre-cache
                if (mode === 'fast') {
                    FREE_LEVELS.forEach(lvl => {
                        if (lvl !== selectedLevel) {
                            fetchLevel(topic, lvl)
                        }
                    })
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate')
        } finally {
            setLoading(false)
        }
    }, [mode, selectedLevel, fetchLevel])

    // Fetch level when user switches and it's missing
    useEffect(() => {
        if (result && !result.explanations[selectedLevel] && !fetchingLevels.has(selectedLevel)) {
            fetchLevel(result.topic, selectedLevel)
        }
    }, [selectedLevel, result, fetchingLevels, fetchLevel])

    return (
        <div className="min-h-screen bg-dark-900 px-4 py-8">
            <header className="text-center mb-12 flex flex-col items-center">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <img src="/favicon.svg" alt="KnowBear Logo" className="w-12 h-12" />
                    <span>Know<span className="text-accent-primary">Bear</span></span>
                </h1>
                <p className="text-gray-400">AI-powered explanations for any topic</p>
            </header>

            <main className="max-w-4xl mx-auto space-y-8">
                <SearchBar
                    onSearch={handleSearch}
                    loading={loading}
                    mode={mode}
                    onModeChange={setMode}
                />

                {loading && (
                    <div className="py-12">
                        <Spinner size="lg" />
                        <p className="text-center text-gray-400 mt-4">Generating explanation for {selectedLevel}...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/30 border border-red-500 text-red-300 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                {result && (
                    <section className="space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h2 className="text-xl font-semibold text-white">{result.topic}</h2>
                            <ExportButtons topic={result.topic} explanations={result.explanations} />
                        </div>

                        <LevelDropdown selected={selectedLevel} onChange={setSelectedLevel} />

                        {fetchingLevels.has(selectedLevel) ? (
                            <div className="bg-dark-700 rounded-lg p-12 flex flex-col items-center">
                                <Spinner size="md" />
                                <p className="text-gray-400 mt-4">Brewing {selectedLevel} explanation...</p>
                            </div>
                        ) : result.explanations[selectedLevel] ? (
                            <ExplanationCard level={selectedLevel} content={result.explanations[selectedLevel]} />
                        ) : (
                            <div className="bg-dark-700/50 rounded-lg p-12 text-center text-gray-500 italic">
                                No explanation available for this level.
                            </div>
                        )}

                        {result.cached && (
                            <p className="text-sm text-gray-500">⚡ Served from cache</p>
                        )}
                    </section>
                )}

                {!result && !loading && <PinnedTopics topics={pinned} onSelect={handleSearch} />}
            </main>

            <footer className="mt-16 text-center text-gray-600 text-sm">
                © 2026 KnowBear • Powered by Groq AI
            </footer>
        </div>
    )
}

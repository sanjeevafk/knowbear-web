import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useKnowBearStore } from './useKnowBearStore'

vi.mock('../api', () => ({
    queryTopicStream: vi.fn((_req, onChunk, onDone) => {
        setTimeout(() => {
            onChunk('Test content')
            onDone({})
        }, 20)
        return Promise.resolve()
    }),
}))

describe('useKnowBearStore', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useKnowBearStore())
        act(() => {
            result.current.reset()
        })
        vi.clearAllMocks()
    })

    it('has expected initial state', () => {
        const { result } = renderHook(() => useKnowBearStore())
        expect(result.current.loading).toBe(false)
        expect(result.current.result).toBeNull()
        expect(result.current.mode).toBe('fast')
    })

    it('loads fresh result in startSearch', async () => {
        const { result } = renderHook(() => useKnowBearStore())
        await act(async () => {
            await result.current.startSearch('blockchain')
        })

        await waitFor(() => {
            expect(result.current.result?.explanations.eli5).toBe('Test content')
        })
    })
})

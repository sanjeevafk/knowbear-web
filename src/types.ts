export interface PinnedTopic {
    id: string
    title: string
    description: string
}

export interface QueryRequest {
    topic: string
    levels?: string[]
    mode?: 'fast' | 'ensemble'
    retrieval?: 'auto' | 'required' | 'on' | 'off'
    temperature?: number
    regenerate?: boolean
}

export type Mode = 'fast' | 'ensemble'

export interface QueryResponse {
    topic: string
    explanations: Record<string, string>
    mode?: Mode
}

export interface ExportRequest {
    topic: string
    explanations: Record<string, string>
    format: 'txt' | 'md'
    mode?: Mode
}

export const FREE_LEVELS = ['eli5', 'eli10', 'eli12', 'eli15', 'meme'] as const
export const PREMIUM_LEVELS = ['classic60', 'gentle70', 'warm80'] as const
export const ALL_LEVELS = [...FREE_LEVELS, ...PREMIUM_LEVELS] as const
export type Level = (typeof ALL_LEVELS)[number]

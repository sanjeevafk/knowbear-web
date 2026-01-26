# Technical Depth Mode Implementation Plan

## 1. Overview
Implement a robust "Technical Depth Mode" to provide academic/technical answers grounded in real-time web data. This involves a new search infrastructure with weighted routing, enhanced prompt engineering for academic rigor, and integration of visual aids (Mermaid diagrams, Unsplash images) and engagement elements (Quotable).

## 2. Search Infrastructure (`api/services/search.py`)
Create a new service `SearchManager` to handle external context gathering.

### 2.1 Weighted Search Routing
Balances quality (Exa), coverage (Serper), and cost/speed (Tavily).

*   **Providers**:
    *   **Tavily (50%)**: Primary for summaries.
    *   **Serper (30%)**: Fallback and image-heavy queries.
    *   **Exa (20%)**: Deep semantic/academic queries.
*   **Logic**:
    *   Use weighted random selection.
    *   **Override**: If query contains visual keywords ("diagram", "flowchart", "image", "photo"), force **Serper** (70% bias).
    *   **Fallback**: Attempt selected provider. If failure/empty, try one backup provider (e.g., Tavily -> Serper).

### 2.2 Image & Quote Handlers
*   **Images (Unsplash)**:
    *   **Condition**: Only search if visual keywords exist or LLM flags "needs_image".
    *   **API**: Unsplash Public API (Demo: 50 req/hr).
    *   **Fallback**: Serper Images if Unsplash fails/returns 0 or query is highly specific/real-time.
*   **Quotes (Quotable)**:
    *   **Condition**: ~40% random chance or specific "education/science" tag relevance.
    *   **API**: `api.quotable.io`.
    *   **Format**: `> {content} — {author}`.

### 2.3 Caching & Persistence
*   **Mechanism**: Redis/available cache (using `services.cache`).
*   **Key**: `f"search:{sha256(query).hexdigest()}"`.
*   **TTL**: 24h for stable academic topics; shorter for news.

### 2.4 Monitoring
*   Log provider usage, credit consumption (estimated), and query hashes.
*   Use `httpxLimits` or `aiolimiter` to respect rate limits (Unsplash 50/hr).

## 3. Prompt Engineering (`api/prompts.py`)
Update prompt templates to strictly enforce academic standards.

### 3.1 New `TECHNICAL_DEPTH_PROMPT`
```python
TECHNICAL_DEPTH_PROMPT = """
You are an expert academic researcher and tutor.

Provided Search Context (real-time web results):
{search_context}

Optional Quote (use if relevant for engagement):
{quote_text}

Topic: {topic}

Guidelines:
- Synthesize ONLY from the provided context + your knowledge. NEVER fabricate facts or sources.
- Cite every claim inline: [1], [2] ... List full references at end with URLs.
- Structure strictly:
  1. **Executive Summary** (2–4 sentences)
  2. **Technical Deep Dive** (detailed explanation)
  3. **Key Mechanics / Architecture / Process** (use Mermaid if applicable)
  4. **References** (numbered list)
- If explaining ANY process, system, workflow, hierarchy, sequence → MUST output valid Mermaid code in:
  ```mermaid
  graph TD
  ...
  ```
- Use college/grad-level language but explain jargon.
- Keep total response focused and under ~1500 words.
- If a quote fits naturally (e.g., inspirational or historical), weave it in as a blockquote.

CRITICAL: Base everything on context. Flag if context is insufficient.
"""
```

## 4. Integration Logic (`api/services/inference.py`)
Modify `generate_explanation` and `generate_stream_explanation`.

### 4.1 Orchestration
*   **Check Mode**: If `mode != "technical_depth"`, use existing fast path.
*   **Async Parallel Execution**:
    ```python
    search_task = search_service.get_search_context(topic)
    image_task = search_service.get_images(topic) # Conditional
    quote_task = search_service.get_quote()       # Conditional
    
    context, images, quote = await asyncio.gather(search_task, image_task, quote_task)
    ```

### 4.2 Response Assembly
*   Inject `context` and `quote` into the System Prompt.
*   **Images**: Append Unsplash images to the *end* of the Markdown response (or strict section) to reference visual aids.
    *   Format: `\n\n### Visual References\n![Alt text](url)`
*   **Streaming**: Stream the LLM text first. If images/quotes are fetched, append them as the final chunk of the stream.

## 5. Frontend (`src/components/ExplanationCard.tsx`)
*   **Mermaid**: Ensure `react-markdown` custom renderer correctly identifies `language-mermaid`.
*   **Images**: Standard markdown `![alt](url)` rendering should be enabled.
*   **UX**: No major changes needed if markdown output is standard.

## 6. Security & Stability
*   **Sanitization**: Ensure image URLs are valid (basic regex check).
*   **HTML**: Prevent LLM from generating raw HTML; strictly Markdown/Mermaid.
*   **Error Handling**: All external API calls must be wrapped in `try/except` to prevent blocking the main response. Fallback to "no external context" if search fails.

## 7. Required Credentials (.env)
*   `TAVILY_API_KEY`
*   `SERPER_API_KEY`
*   `EXA_API_KEY`
*   `UNSPLASH_ACCESS_KEY`

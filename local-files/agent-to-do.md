# Agent To-Do List

This file tracks high-level tasks for the agent to execute.

## 1. Implement Google Authentication and Guest Mode
**Task:** Configure Google OAuth integration for user sign-in using Supabase or NextAuth (depending on current stack). Implement a "Guest Mode" that tracks usage limits (e.g., via cookies or local storage) to impose a paywall after a specific usage threshold is met.
**Required Credentials:**
- `GOOGLE_CLIENT_ID`: Google Cloud Console Client ID
- `GOOGLE_CLIENT_SECRET`: Google Cloud Console Client Secret
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (if using Supabase Auth)

## 2. Paywall Export Features (Razorpay Integration)
**Task:** Identify export functionalities (PDF, Markdown, etc.). Wrap these action handlers with a subscription check. If the user is on a free tier/guest mode, block the export and trigger an upgrade modal. Implement payment flow using **Razorpay**.
**Required Credentials:**
- `RAZORPAY_KEY_ID`: Razorpay Public Key
- `RAZORPAY_KEY_SECRET`: Razorpay Secret Key

## 3. Create Beautiful and Outstanding Landing Page
**Task:** Create a premium landing page compatible with the existing frontend stack (React, Tailwind).
- **Placement:** Add as the root page (`/`), moving the main app to a sub-route or rendering conditionally.
- **Design:** Mobile-first, optimized for all screens. Maintain existing logo and color scheme.
- **Features:** High-end aesthetics (framer-motion animations, glassmorphism).
- **Auth:** Prominently display Google Signup and Guest Mode buttons.
**Required Credentials:**
- None

## 4. Add Senior Modes (Classic, Gentle, Warm)
**Task:** Expand ELI options with distinct personas:
- **Classic Mode (60+):** Slower pace, everyday metaphors (checkbook, newspaper, TV Guide).
- **Gentle Mode (70+):** Extra patience, very familiar examples (rotary phone, drive-in movies, party line).
- **Warm & Simple (80+):** Largest effective text, warmest tone, ultra-basic analogies (like explaining to a beloved grandparent).
**Required Credentials:**
- None

## 5. Integrate High-Quality Open-Source Models (Free Tier)
**Task:** Extend the backend model router to support **only open-source free tier models** that offer high quality and low latency.
- **Primary Providers:**
    - **Groq:** Llama 3 70B, Mixtral 8x7B (Ultra-fast latency).
    - **Google AI Studio:** Gemini 1.5 Flash (Free tier: 15 RPM, 1M TPM).
    - **Hugging Face Inference API:** Mistral, Phi-3, Gemma (Free tier for models <10GB).
    - **Together AI:** Llama 3, Qwen (Free credits/tier).
    - **GitHub Models:** Llama 3, Phi-3 (Free tier with PAT).
- **Strategy:** Build a fallback router. If Groq is rate-limited, failover to Gemini or Hugging Face.
**Required Credentials:**
- `GROQ_API_KEY`
- `GOOGLE_API_KEY` (for Gemini)
- `HUGGINGFACE_API_TOKEN`
- `TOGETHER_API_KEY`

## 6. Add "Recreate Response" Button
**Task:** Add a button to the response interface allowing users to generate a new answer to the same prompt. Ensure this triggers a re-fetch to the backend, potentially with a varied seed or temperature to ensure a unique result.
**Required Credentials:**
- None

## 7. Upgrade Prompts for Quality (Chain of Thought & Libraries)
**Task:** Refactor system prompts using proven methodologies.
- **Sources:** Adapt prompts from **Anthropic's Prompt Library**, **LangChain Hub**, and **OpenAI Cookbook**.
- **Techniques:**
    - **Chain of Thought (CoT):** Force the model to "think step-by-step" before answering.
    - **Meta-Prompting:** Use a high-IQ model (e.g., via temporary free access or local) to write optimized prompts for the production models.
    - **Few-Shot Prompting:** Inject 3-5 high-quality QA examples into the system prompt to guide style and tone.
- **Mode Specifics:**
    - *Research:* "Synthesize X sources, prioritize consensus."
    - *Fast:* "Answer directly, no preamble."
    - *Boomer:* "Use analogies, avoid jargon, explain likely you're talking to a 70-year-old."
**Required Credentials:**
- None

## 8. Differentiate Fast Mode vs. Brief Dive
**Task:** Rework modes with distinct architectures:
- **Fast Mode:** Immediate individual answer for each ELI mode. Add specific prompts to ensure speed and relevance.
- **Brief Dive (formerly Deep Research):** Rename to "Brief Dive". Implementation: **Model ensemble and voting approach**. The system should query multiple models/perspectives and synthesize the best components into a final answer.
**Required Credentials:**
- None

## 9. Enhanced Caching & User History
**Task:**
- **Smart Caching (FAQs):** Improvise the "Popular Topics" section on the homepage to serve as a pre-cached FAQ system. If a user queries a popular topic, serve the cached answer immediately to eliminate latency.
- **User History (Paywalled):** Implement a database-backed history feature for logged-in users. Restrict access to this history (viewing past chats) to paid subscribers or specific tiers.
**Required Credentials:**
- `SUPABASE_URL` / `SUPABASE_KEY`: For storing history and cached topics.

## 10. Technical Deep Dive Mode (Paywalled)
**Task:** Implement a new "Technical Deep Dive" mode locked behind a paywall.
- **Content:** Output must be highly technical, elaborate, and structured for engineering/academic contexts.
- **Visuals:** Integrate `mermaid.js` for dynamic diagrams (flowcharts, sequence diagrams) generated by the LLM.
- **Images:** Fetch and display relevant images from the web (ensure they are catalogued and organized).
- **Access:** Only available to premium subscribers.
**Required Credentials:**
- None (Uses existing Search/LLM keys)

## 11. SEO & Monetization Strategy
**Task (Agent):**
- **Sitemap & Robots.txt:** Generate dynamic sitemap and robots.txt.
- **Meta Tags:** Implement dynamic Open Graph and Twitter card meta tags for every shared search result.
- **Structured Data:** Add JSON-LD schemas for key pages (FAQs, Article, Product).
- **Performance:** Optimize Core Web Vitals (LCP, CLS, FID) - aim for 100 on PageSpeed Insights.
- **Ad Placeholders:** Create non-intrusive slots for future ad integration (if applicable).

**Task (Project Owner):**
- **Google Search Console:** Verify domain ownership and submit sitemap.
- **Analytics:** Set up Google Analytics / PostHog to track conversion funnels.
- **Keyword Research:** Identify high-volume keywords to target with "Popular Topics".
- **Backlinks:** Start outreach for backlinks to domain.
- **Pricing Strategy:** Define tiers for Razorpay integration (Free vs. Pro).
**Required Credentials:**
- `NEXT_PUBLIC_GA_ID` (Google Analytics implementation)

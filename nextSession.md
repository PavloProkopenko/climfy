Climfy Refactor — Handoff (session: refactor-part1)

Project

Climfy weather app — React 19 + Vite SPA in weather-app/climfy/, Hono backend in weather-app/climfy-server/, Supabase
(Postgres + Auth), Anthropic Claude (claude-haiku-4-5-20251001) for recommendations.

What shipped this session

Phase 1 — feature sync & structural cleanup

- Fixed the recommendation flow for anonymous users: backend already served rule-based content; frontend hook was disabled
  when !user. Now enabled only skips the known-403 case (logged-in-but-onboarding-incomplete).
- Standardized feature module shape api/ hooks/ ui/. Extracted favorites/api/favorites.ts and search/api/search-history.ts
  from inline-fetch hooks.
- Added shared src/shared/lib/api-client.ts with apiFetch<T>() — handles base URL, Bearer token, JSON parsing, throws
  ApiError on non-2xx. Replaced four duplicated getToken + fetch blocks (favorites, search, recommendations, auth-context).
- Dropped dead SearchHistoryItem.query field (was just a duplicate of name).
- Fixed inverted favorite-button toasts — now toast.success in onSuccess and toast.error(common.error) in onError.

Phase 2 — richer AI personalization

- New columns on user_preferences: bio, gender, cold_sensitivity.
- New Gender + ColdSensitivity enums shared between FE/BE; backend validates them.
- New shared PersonalizationFields component used by both Onboarding (optional section) and Profile dialog (full edit).
- Claude prompt weaves in gender (skipped on prefer_not_to_say), cold_sensitivity, and bio as an "About them" block.
- Backend nukes user's cached recommendations on any AI-relevant preference change. Frontend also invalidates React Query
  ['recommendation'] after Profile save.

Phase 3 — card UX

- Iteration A (gradient hero) was rejected by user.
- Final card: plain <Card> with border-primary/20 bg-primary/10 tint, text-base leading-relaxed text-foreground
  text-justify. Sparkles + AI pill in primary green.
- "Show more / Show less" ghost button (only for authenticated AI users). Short = 1–2 sentences ≤200 chars; long = the
  original detailed prompt. Per-detail caching: new detail column on recommendations table; index reindexed to (user_id,
  language, detail, expires_at DESC).
- Safety-net capShort() in the route truncates short responses at the last word boundary + … if Claude overshoots.
- Loading skeleton uses bg-primary/20 so it's visible on the tinted card.
- placeholderData: (prev) => prev on the recommendations query so toggling detail doesn't flash a skeleton.

Phase 4 — language sync bug

- Profile dialog now pre-fills the language field from i18n.language (with preferences.language fallback) — fixes the case
  where the header LanguagePicker had changed i18n but not the DB.
- LanguagePicker now also calls updatePreferences({ language }) for authenticated users so the backend stays in sync.
  Silently no-ops for anonymous.

Pending — user must run in Supabase Studio (SQL Editor)

-- Personalization columns (Phase 2)
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS cold_sensitivity TEXT;

-- Per-detail caching (Phase 3)
ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS detail TEXT NOT NULL DEFAULT 'short';
DROP INDEX IF EXISTS recommendations_lookup;
CREATE INDEX recommendations_lookup
ON recommendations(user_id, language, detail, expires_at DESC);

Both blocks are appended to climfy-server/supabase/migrations.sql.

Not verified in this session

- Playwright E2E suite end-to-end — tests were updated (RecommendationLoginPrompt → RecommendationSignInHint) and lint/build
  pass, but a full run was interrupted. Run: cd climfy && npx playwright test --project=chromium.
- Dark mode of the new card — bg-primary/10 should look fine but eyeball it.
- Backend npm run dev — only npm run lint (tsc) was run. Worth booting and hitting /recommendations?detail=short and
  ?detail=long once to confirm the cache split works end-to-end.
- All three locales rendered live — keys are present but visual verification at de/ua not done.

Conventions to keep using

- Use apiFetch from @/shared/lib/api-client for any new backend call — never raw fetch + manual token plumbing.
- Feature modules follow api/ hooks/ ui/; backend types travel inside api/<thing>.ts files alongside the request functions.
- i18n.language is the source of truth for the active UI language; preferences.language is its persistent shadow (kept in
  sync by LanguagePicker for auth users).
- Recommendation prompt has two branches keyed by detail (short ≤200 chars, long = detailed). Cache key includes detail. Any
  preference change that feeds the prompt deletes both rows.
- capShort() lives in recommendations route — keep it close to where Claude could overshoot, not in the lib.

Quick file map

┌───────────────────────────┬─────────────────────────────────────────────────────────────────────────────────┐
│ Area │ Path │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Shared HTTP │ climfy/src/shared/lib/api-client.ts │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Recommendations API │ climfy/src/features/recommendations/api/recommendations.ts │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Recommendations hook │ climfy/src/features/recommendations/hooks/use-recommendations.ts │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Recommendation card │ climfy/src/features/recommendations/ui/recommendation-card.tsx │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Personalization fields │ climfy/src/features/auth/ui/personalization-fields.tsx │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Onboarding dialog │ climfy/src/features/auth/ui/onboarding-dialog.tsx │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Profile dialog │ climfy/src/features/auth/ui/profile-dialog.tsx │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Language picker │ climfy/src/shared/layout/ui/language-picker.tsx │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Auth context │ climfy/src/features/auth/context/auth-context.tsx │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Favorites API + hook │ climfy/src/features/favorites/api/favorites.ts, …/hooks/use-favorite.ts │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Favorite button │ climfy/src/features/favorites/ui/favorite-button.tsx │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Search history API + hook │ climfy/src/features/search/api/search-history.ts, …/hooks/use-search-history.ts │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Locales │ climfy/src/shared/locales/languages/{en,de,ua}.ts │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Tests │ climfy/tests/resources/enums.ts, climfy/tests/e2e/weather.spec.ts │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Backend types │ climfy-server/src/types/index.ts │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Preferences route │ climfy-server/src/routes/preferences.ts │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Recommendations route │ climfy-server/src/routes/recommendations.ts │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Claude prompt │ climfy-server/src/lib/claude.ts │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Rule-based │ climfy-server/src/lib/recommendations.ts │
├───────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┤
│ Migrations │ climfy-server/supabase/migrations.sql │
└───────────────────────────┴─────────────────────────────────────────────────────────────────────────────────┘

Likely next-session targets

- Run + fix Playwright suite against the new UI (test the Show more flow, the sign-in hint, the personalization save flow).
- Visual polish pass at all three breakpoints + dark mode.
- Consider an i18n round-trip test (LanguagePicker → backend → next AI generation uses the new language).
- The recommendations.unavailable empty-state isn't covered by tests; consider a small test that mocks an empty content
  response.

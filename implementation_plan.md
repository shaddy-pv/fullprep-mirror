# Repository Architectural Analysis Report

I have conducted a full static and structural analysis of your `fullprep-main` repository using a combination of dead code detection, copy-paste duplicate detection, and linting.

## User Review Required

> [!WARNING]
> Please review the issues listed below. I will **not** modify any files or delete any code until you explicitly approve these findings. Let me know which ones you'd like me to address first.

---

## 1. Dead Code: Unused Files

These files are completely unreferenced in the codebase.

### Frontend
| File Path | Issue Type | Why it's a problem | Recommended Fix | Safe to delete? |
| --- | --- | --- | --- | --- |
| `frontend/components/landing/ThemeProvider.tsx` | Unused Component | Adds clutter | Remove file | ✅ Yes |
| `frontend/components/layout/ResponsiveGrid.tsx` | Unused Component | Unused UI logic | Remove file | ✅ Yes |
| `frontend/components/ui/Card.tsx` | Unused Component | Adds clutter | Remove file | ✅ Yes |
| `frontend/components/ui/Loader.tsx` | Unused Component | Adds clutter | Remove file | ✅ Yes |
| `frontend/components/ui/Skeleton.tsx` | Unused Component | Adds clutter | Remove file | ✅ Yes |
| `frontend/hooks/useAuth.ts` | Unused Hook | Obsolete logic | Remove file | ✅ Yes |
| `frontend/hooks/useDebounce.ts` | Unused Hook | Dead code | Remove file | ✅ Yes |
| `frontend/hooks/useLocalStorage.ts` | Unused Hook | Dead code | Remove file | ✅ Yes |
| `frontend/hooks/useSidebar.ts` | Unused Hook | Dead code | Remove file | ✅ Yes |
| `frontend/hooks/useTheme.ts` | Unused Hook | Dead code | Remove file | ✅ Yes |
| `frontend/providers/QueryProvider.tsx` | Unused Component | Obsolete provider | Remove file | ✅ Yes |
| `frontend/schemas/*.schema.ts` (auth, problems, profile, settings) | Unused Schemas | Dead code | Remove files | ⚠️ Verify if needed for future |
| `frontend/services/leaderboard.service.ts` | Unused Service | Dead code | Remove file | ✅ Yes |
| `frontend/services/profile.service.ts` | Unused Service | Dead code | Remove file | ✅ Yes |
| `frontend/store/contestStore.ts` | Unused Store | Dead code | Remove file | ✅ Yes |
| `frontend/store/themeStore.ts` | Unused Store | Dead code | Remove file | ✅ Yes |

### Backend
| File Path | Issue Type | Why it's a problem | Recommended Fix | Safe to delete? |
| --- | --- | --- | --- | --- |
| `backend/check_submission.js` | Unused Script | Clutters root | Move to `scripts/` or remove | ✅ Yes |
| `backend/fix-duplicates.js` | Unused Script | Clutters root | Move to `scripts/` or remove | ✅ Yes |
| `backend/makeAdmin.js` | Unused Script | Clutters root | Move to `scripts/` or remove | ✅ Yes |
| `backend/seedLearningPaths.js` | Unused Script | Clutters root | Consolidate into `seed.js` | ✅ Yes |
| `backend/seedNotes.js` | Unused Script | Clutters root | Consolidate into `seed.js` | ✅ Yes |
| `backend/src/config/queue.js` | Unused Config | Dead code | Remove file | ✅ Yes |
| `backend/src/utils/sandboxExecutor.js` | Unused Utility | Dead code | Remove file | ✅ Yes |
| `backend/src/utils/submissionQueue.js` | Unused Utility | Dead code | Remove file | ✅ Yes |

---

## 2. Duplicate Logic & Code Smells

These sections contain heavily copy-pasted logic, which makes the code harder to maintain and prone to bugs when changes are made to one copy but not the other.

### Frontend
| File Path | Issue Type | Why it's a problem | Recommended Fix |
| --- | --- | --- | --- |
| `e2e/dashboard.spec.ts` | Duplicate Logic | Duplicates E2E tests in `problems.spec.ts` and `profile-settings.spec.ts` | Extract common auth/setup flows into a shared E2E helper. |
| `schemas/auth.schema.ts` | Duplicate Schema | Duplicates `schemas/profile.schema.ts` | Merge or extend common Zod schemas. |
| `services/auth.service.ts` | Duplicate Methods | Internal duplication of API calls (lines 106-117 vs 123-134) | Refactor into a single reusable internal API fetcher. |
| `services/bookmarks.service.ts` | Duplicate Logic | Heavily duplicates `services/problems.service.ts` | Extract base CRUD logic into a generic API service class. |

### Backend
| File Path | Issue Type | Why it's a problem | Recommended Fix |
| --- | --- | --- | --- |
| `src/controllers/authController.js` | Duplicate Controller Logic | Duplicates logic in `problemController.js` and `statsController.js` | Extract standard response formatting or validation logic into shared middleware. |
| `src/controllers/contestController.js` | Internal Duplication | Repeated logic across endpoints (lines 67-72 vs 149-154, and 280-294 vs 375-389) | Extract reusable contest validation helper. |
| `src/controllers/problemController.js` | Duplicate Logic | Duplicates chunks in `submissionController.js` (lines 867-885 vs 359-378) | Extract submission handling helper. |
| `src/middleware/authMiddleware.js` | Internal Duplication | Repeated auth token extraction logic | Create a single token extractor function. |
| `src/models/Problem.js` | Duplicate Schema | Schema definitions are copied internally (lines 19-28 vs 28-37) | Use nested Mongoose schemas or arrays. |

---

## 3. Dependency & Export Issues

| Location | Issue Type | Why it's a problem | Recommended Fix | Safe to delete? |
| --- | --- | --- | --- | --- |
| `backend/package.json` | Unused Dependency | `bullmq` is installed but never imported. | `npm uninstall bullmq` | ✅ Yes |
| `backend/test-ai.js` | Unlisted Dependency | `node-fetch` is imported but not in `package.json` | Add to package.json or use native `fetch`. | N/A |
| `frontend/auth.ts` | Unused Exports | `auth`, `signIn`, `signOut` are exported but unused. | Remove exports if not needed in the app router. | ⚠️ Verify |
| `backend/src/config/firebase.js` | Duplicate Exports | Exporting both `firebaseAdmin` and `default`. | Standardize to named or default export. | ⚠️ Verify |

---

## Proposed Action Plan

If you approve, we can tackle this in phases:
1. **Phase 1 (Cleanup):** Delete all 40 unused files across frontend and backend. Remove unused dependencies.
2. **Phase 2 (Refactor):** Consolidate duplicate services and controller logic.

How would you like to proceed? You can approve all, or tell me to execute specific phases/files.

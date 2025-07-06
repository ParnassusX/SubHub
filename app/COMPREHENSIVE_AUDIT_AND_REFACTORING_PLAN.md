# Comprehensive Codebase Audit and Refactoring Plan

This document outlines a detailed plan to address critical issues related to authentication, performance, and data integrity in the SubHub application. The plan is based on a thorough analysis of the codebase and existing documentation.

## 1. Unify Authentication and Session Management

**Problem:** The application has conflicting session management logic in `app/src/contexts/AuthContext.tsx` and `app/src/hooks/usePerformanceOptimization.ts`. The `AuthContext`'s initialization is overly complex, relying on multiple timeouts and manual state flags, which makes it fragile and prone to race conditions.

**Solution:**

1.  **Single Source of Truth:** Remove the session management and caching logic from `usePerformanceOptimization.ts`. The `AuthContext` will become the *only* component responsible for the user's session state.
2.  **Simplify `AuthContext`:** Refactor the `AuthContext` to remove the manual timeout promises and loading flags. Delegate the handling of loading, error, and success states for data fetching (like user profiles) to a dedicated data-fetching library.

## 2. Implement a Centralized Data Caching Strategy

**Problem:** The application currently uses several caching methods: a manual cache in `usePerformanceOptimization.ts` and component-level state in hooks like `useCategories.ts`. This leads to stale data and unnecessary complexity.

**Solution:**

1.  **Introduce React Query:** Integrate React Query to manage all application data, replacing all existing manual caching implementations.
2.  **Refactor Data Hooks:** Refactor all data-fetching logic (in `useCategories.ts`, `useSubscriptions`, `Dashboard.tsx`, `Settings.tsx`, etc.) to use React Query's `useQuery` hook.
3.  **Enable Real-Time Updates:** Configure React Query to use Supabase's real-time capabilities to listen for database changes and automatically refetch data.

## 3. Ensure Dashboard Data Integrity

**Problem:** The dashboard's metrics are unreliable due to a fallback to client-side calculations, which may use stale data, and the presence of hardcoded values.

**Solution:**

1.  **Backend-Driven Calculations:** Create and/or verify the Supabase RPC function `get_user_dashboard_stats` to ensure it is robust and performs all necessary calculations on the server.
2.  **Remove Client Fallback:** Remove the `calculateStatsFromSubscriptions` fallback logic from `Dashboard.tsx`. The dashboard will rely exclusively on the server-calculated data provided by the RPC function, fetched via React Query.
3.  **Eliminate Hardcoded Values:** Remove hardcoded values (like the budget) and replace them with data fetched from the user's settings, managed by the new centralized cache.

## Proposed Architecture

This diagram illustrates the simplified and more robust architecture:

```mermaid
graph TD
    subgraph Client Application
        subgraph Components
            A[Login Page]
            B[Dashboard]
            C[Categories Page]
            D[Settings Page]
        end
        subgraph Hooks & State
            E[useAuth]
            F[React Query Hooks (useSubscriptions, useCategories, etc.)]
        end
        subgraph Core Providers
            I[React Query Provider]
            J[AuthContext Provider]
        end
    end

    subgraph Backend
        K[Supabase Auth]
        L[Supabase Database]
        M[Supabase RPC Functions]
    end

    A --> E
    E --> J
    J --> K

    B --> F
    C --> F
    D --> F

    F --> I

    I --> L
    I --> M

    L -- Real-time updates --> I
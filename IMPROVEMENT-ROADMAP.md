# Project Improvement Roadmap: Online Learning Platform

This document outlines the strategic technical improvements recommended to transform the current prototype into a production-grade, scalable Learning Management System (LMS).

## 🔴 Phase 0: Critical Security & Reliability (P0 - Immediate)

### 0.1 JWT Refresh Token & Revocation
Replace the single 7-day token with a **Dual-Token System** (Access + Refresh).
- **Why:** 7-day access tokens are a high risk if intercepted. Refresh tokens allow for short-lived access tokens (e.g., 15m) and the ability to revoke sessions remotely.
- **Action:** 
  - Issue a short-lived Access Token and a long-lived Refresh Token.
  - Store Refresh Tokens in the DB to allow for global logout/revocation.

### 0.2 Secure Cookie-Based Authentication
Transition from LocalStorage to **HTTP-Only, Secure, SameSite=Strict Cookies**.
- **Why:** Completely eliminates the risk of XSS-based token theft.
- **Action:** Update `authController.js` and `auth.js` middleware to manage tokens via cookies.

### 0.3 Structured Logging (Winston/Pino)
Replace `console.error` and `console.log` with a structured logging library.
- **Why:** Console logs are insufficient for debugging production issues on Hostinger. Structured logs (JSON) allow for easier filtering and external log management.
- **Action:** Implement **Winston** with daily-rotate-file for production-grade logging.

### 0.4 Database Backup & Recovery Plan
Implement automated MySQL backups.
- **Why:** Currently, there is no automated way to recover from data loss or accidental deletion.
- **Action:** Create a CRON-based script to run `mysqldump` and store backups in a secure, off-site location (e.g., S3 or a separate cloud disk).

---

## 🟢 Phase 1: Stability & Database (P1 - High Priority)

### 1.1 Formalize Database Migrations (Knex.js)
- **Why:** Replace the 400-line `initDatabase` function with versioned migration files for safe deployments across environments.

### 1.2 Automated Testing Safety Net
Implement **Jest** (Unit/Integration) and **Playwright** (E2E).
- **Why:** Prevents regressions in critical flows like payments and course enrollment.
- **Action:** 
  - Backend: Integration tests for `auth` and `payment` routes.
  - Frontend: E2E tests for the "Enroll to Course" happy path.

### 1.3 Refactor Rate Limiting to Route-Level
Move `rateLimit` middleware from `server.js` into the individual route files (e.g., `routes/auth.js`).
- **Why:** While the current order in `server.js` is correct, moving it to the route-level improves modularity and makes it easier to manage as the API surface grows.

---

## 🟡 Phase 2: Scalability & Performance (P2)

### 2.1 Decouple Media Storage (S3/Cloudinary)
- **Why:** Move away from local `/uploads` to allow for horizontal scaling and stateless containers.

### 2.2 Global Error Handler Refactoring
- **Why:** Create a centralized `middleware/errorMiddleware.js` that provides consistent JSON responses and prevents stack-trace leaking in production.

### 2.3 Server-State Management (TanStack Query)
- **Why:** Optimize frontend performance and reduce unnecessary re-renders.

---

## ⚪ Phase 3: Developer Experience (P3)
- **Swagger API Docs:** Standardize the API contract via OpenAPI.
- **Dockerization:** Ensure environment parity for the Node/MySQL stack.
- **CI/CD Integration:** Automate the Hostinger deployment pipeline via GitHub Actions.

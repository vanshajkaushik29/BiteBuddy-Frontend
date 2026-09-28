# BiteBuddy — Frontend & Backend Integration Guide 🚀

Welcome to the **BiteBuddy Frontend Integration & Educational Guide**! This comprehensive document is written specifically for backend and full-stack developers to learn how Next.js/React communicates seamlessly with an Express.js + MongoDB backend using environment variables and HTTP-Only JWT cookies.

---

## 📚 Table of Contents
1. [How Frontend Connects to Backend (Base URL & CORS)](#1-how-frontend-connects-to-backend)
2. [Why `.env.local` Exists in Next.js (`NEXT_PUBLIC_` Prefix)](#2-why-envlocal-exists-in-nextjs)
3. [Authentication Flow (HTTP-Only Cookies vs LocalStorage)](#3-authentication-flow)
4. [React State & Context Management (`AuthContext`)](#4-react-state--context-management)
5. [Modular API Client Layer Architecture (`lib/api/`)](#5-modular-api-client-layer-architecture)
6. [Two-Step Delivery Verification & Reward System Workflow](#6-two-step-delivery-verification--reward-system-workflow)
7. [Common Pitfalls & Best Practices for Backend Developers](#7-common-pitfalls--best-practices)

---

## 1. How Frontend Connects to Backend

During local development, your application runs on two separate ports:
- **Frontend (Next.js App)**: `http://localhost:3000`
- **Backend (Express API)**: `http://localhost:5000`

### CORS (Cross-Origin Resource Sharing)
Because ports `3000` and `5000` differ, browsers block cross-origin HTTP requests by default for security.

To allow the Next.js app to send requests and attach session cookies, the Express backend must be configured with `cors()`:

```typescript
// Express Backend Setup (server.ts)
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:3000', // Must match exact frontend URL (not wildcard '*')
  credentials: true,               // Allows browser to send and receive HTTP cookies
}));
```

---

## 2. Why `.env.local` Exists in Next.js

In Next.js, environment variables are loaded from `.env.local` in the project root:

```env
# c:\Users\vansh\Desktop\BiteBuddyFrontend\.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### The `NEXT_PUBLIC_` Prefix Rule:
- **Variables WITHOUT `NEXT_PUBLIC_`** (e.g. `DATABASE_SECRET`): Only available in Node.js server-side code (Server Components, API routes). Next.js keeps them secret from the browser.
- **Variables WITH `NEXT_PUBLIC_`** (e.g. `NEXT_PUBLIC_API_URL`): Injected into client-side JavaScript bundles so code running inside browser components can access `process.env.NEXT_PUBLIC_API_URL`.

In `lib/api/client.ts`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
```

---

## 3. Dual-Token Authentication Flow (RTR + In-Memory Access Token)

### Why Dual-Token Architecture?
- **Short-Lived Access Token (15 min)**: Kept strictly in JavaScript memory (`lib/api/client.ts`). Even if an XSS vulnerability occurs, the token is not stored in `localStorage` or `sessionStorage`.
- **Long-Lived Refresh Token (30 days)**: Stored in a hardened `HttpOnly`, `Secure`, `SameSite=Lax` cookie. JavaScript cannot read or alter it.
- **Refresh Token Rotation (RTR)**: Every time the access token is refreshed via `POST /api/auth/refresh`, the server invalidates the previous refresh token and issues a brand-new token pair.

```
+---------------------------------------+                    +------------------------------------+
|            Next.js Frontend           |                    |         Express.js Backend         |
+---------------------------------------+                    +------------------------------------+
                   |                                                          |
                   |  1. POST /api/auth/login                                 |
                   |--------------------------------------------------------->|
                   |                                                          | 2. Validates credentials
                   |  3. 200 OK: { accessToken } + Set-Cookie: refreshToken  |
                   |<---------------------------------------------------------|
  (Saves accessToken in memory)                                               |
                   |                                                          |
                   |  4. Request + Header: 'Authorization: Bearer <token>'     |
                   |--------------------------------------------------------->|
                   |                                                          | 5. Verifies JWT Access Token
                   |  6. 200 OK: Protected Data                               |
                   |<---------------------------------------------------------|
                   |                                                          |
         [ Access Token expires after 15m ]                                   |
                   |                                                          |
                   |  7. Request sent with expired token                      |
                   |--------------------------------------------------------->|
                   |  8. 401 Unauthorized                                     |
                   |<---------------------------------------------------------|
                   |                                                          |
                   |  9. POST /api/auth/refresh (HttpOnly cookie sent auto)   |
                   |--------------------------------------------------------->|
                   |                                                          | 10. Validates & Rotates Token
                   | 11. 200 OK: { accessToken } + Set-Cookie: new refreshToken
                   |<---------------------------------------------------------|
                   |                                                          |
                   | 12. Retries original request with new Access Token       |
                   |--------------------------------------------------------->|
                   | 13. 200 OK: Success!                                     |
                   |<---------------------------------------------------------|
```

---

## 4. React State & Context Management

React components re-render automatically when their internal **State** (`useState`) changes.

### `AuthContext` Architecture (`context/AuthContext.tsx`)
Instead of manually passing user information down through every page component ("prop drilling"), `AuthContext` maintains global user state and orchestrates silent refreshes:

```tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-restore session silently using HttpOnly refresh cookie on mount
  const refreshUser = useCallback(async () => {
    try {
      await api.auth.refresh();
      const res = await api.auth.me();
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    // Auto-logout on session expiration
    const unsubscribe = onAuthFailure(() => setUser(null));
    return () => unsubscribe();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Any component can access user profile and auth actions in 1 line:
```tsx
const { user, logout } = useAuth();
```

---

## 5. Modular API Client Layer Architecture

Instead of writing scattered raw `fetch()` calls across pages, BiteBuddy uses a modular API layer located in `lib/api/`:

```
lib/api/
├── client.ts    # Core fetch wrapper handling NEXT_PUBLIC_API_URL & credentials: 'include'
├── auth.ts      # register, login, me, logout, updateProfile
├── trips.ts     # create, getAll, getById, update, cancel, complete
├── orders.ts    # create, getMyOrders, getTripOrders, getById, cancel, deliver, confirm
├── pgs.ts       # getAll, getById
├── rewards.ts   # getSummary
├── users.ts     # getProfile
├── messages.ts  # chat conversations & messages
└── index.ts     # Unified export object
```

### Usage Example:
```typescript
import { api } from '@/lib/api';

// Fetch active trips
const trips = await api.trips.getAll({ status: 'PLANNED' });

// Confirm order receipt (Step 2)
await api.orders.confirm(orderId);
```

---

## 6. Two-Step Delivery Verification & Reward System Workflow

To prevent fake reward point farming, BiteBuddy enforces a two-sided verification process:

```
Step 1: Carrier Action                     Step 2: Requester Action
[Trip Status: STARTED]                     [Order Status: DELIVERED]
         │                                          │
         ▼                                          ▼
Carrier clicks:                            Requester sees banner & clicks:
"Mark Order Delivered"                     "Confirm Received (+10 Points to Carrier)"
         │                                          │
         ▼                                          ▼
PATCH /api/orders/:id/deliver              PATCH /api/orders/:id/confirm
         │                                          │
         ▼                                          ▼
Order status -> DELIVERED                  Order status -> COMPLETED
                                           Carrier awarded +10 Reward Points
```

---

## 7. Common Pitfalls & Best Practices

| Pitfall | Cause | Solution / Best Practice |
|---|---|---|
| **Cookies not attached** | Omitted `credentials` option in `fetch` | Pass `credentials: 'include'` on all API calls. |
| **CORS blocked** | Backend wildcard `origin: '*'` with credentials | Use explicit `origin: 'http://localhost:3000'` in Express `cors()`. |
| **`.env` variable `undefined` in browser** | Missing `NEXT_PUBLIC_` prefix | Prefix client environment variables with `NEXT_PUBLIC_`. |
| **Direct state mutation** | Writing `user.rewardPoints += 10` directly | Always use setter functions: `setUser({ ...user, rewardPoints: newPoints })`. |
| **Blank screen on initial load** | Missing loading fallback during `/auth/me` check | Check `if (loading) return <Skeleton />` before rendering protected content. |

---

*BiteBuddy Frontend built with Next.js App Router, TypeScript, Tailwind CSS (#FFF9F3 / #FF6B35 / #06D6A0), and Lucide React Icons.*

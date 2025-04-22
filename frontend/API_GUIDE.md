---

# 🛠️ DEX API Structure

This document describes the REST API structure for managing tokens, presales, pools, liquidity, swaps, and fees.

---

## 📂 `/api/tokens`

**Manage and fetch token metadata.**

| Method | Route                 | Description                        |
|------- | --------------------- | ---------------------------------- |
| `GET`  | `/api/tokens`          | List all tokens                   |
| `GET`  | `/api/tokens/[id]`     | Get token details by ID            |
| `POST` | `/api/tokens`          | Create a new token                 |
| `PATCH`| `/api/tokens/[id]`     | Update a token                     |
| `DELETE`| `/api/tokens/[id]`    | Delete a token (admin only)         |

---

## 📂 `/api/presales`

**Manage and track presales.**

| Method | Route                        | Description                        |
|------- | ---------------------------- | ---------------------------------- |
| `GET`  | `/api/presales`               | List all presales                  |
| `GET`  | `/api/presales/[id]`          | Get presale details by ID          |
| `POST` | `/api/presales`               | Create a new presale               |
| `PATCH`| `/api/presales/[id]`          | Update presale (status, raise etc.)|
| `GET`  | `/api/presales/[id]/contributions` | List all contributions for a presale |
| `POST` | `/api/presales/[id]/contribute` | Contribute to a presale           |

---

## 📂 `/api/pools`

**Manage and fetch liquidity pools.**

| Method | Route                        | Description                        |
|------- | ---------------------------- | ---------------------------------- |
| `GET`  | `/api/pools`                  | List all pools                     |
| `GET`  | `/api/pools/[id]`             | Get pool details by ID             |
| `POST` | `/api/pools`                  | Create a new pool                  |
| `PATCH`| `/api/pools/[id]`             | Update pool settings (admin only)  |

---

## 📂 `/api/liquidity`

**Manage liquidity positions.**

| Method | Route                               | Description                       |
|------- | ----------------------------------- | --------------------------------- |
| `GET`  | `/api/liquidity`                    | List all liquidity positions     |
| `GET`  | `/api/liquidity/user/[wallet]`       | List positions for a specific user |
| `POST` | `/api/liquidity/add`                 | Add liquidity to a pool          |
| `POST` | `/api/liquidity/remove`              | Remove liquidity from a pool     |

---

## 📂 `/api/swaps`

**Track and fetch swap transactions.**

| Method | Route                           | Description                       |
|------- | ------------------------------- | --------------------------------- |
| `GET`  | `/api/swaps`                    | List all swaps                    |
| `GET`  | `/api/swaps/pool/[pool_id]`      | List all swaps for a specific pool |
| `GET`  | `/api/swaps/user/[wallet]`       | List all swaps for a user          |
| `POST` | `/api/swaps/execute`             | Execute a swap (optional, if backend signs tx) |

---

## 📂 `/api/fees`

**Manage LP rewards (claimable trading fees).**

| Method | Route                              | Description                        |
|------- | ---------------------------------- | ---------------------------------- |
| `GET`  | `/api/fees/user/[wallet]`           | Fetch unclaimed fees for a user   |
| `POST` | `/api/fees/claim`                  | Claim trading fees (trigger smart contract tx) |

---

# 📋 Directory Structure (suggested)

```
src/
└── app/
    └── api/
        ├── tokens/
        │   ├── route.ts (GET, POST)
        │   └── [id]/route.ts (GET, PATCH, DELETE)
        ├── presales/
        │   ├── route.ts (GET, POST)
        │   ├── [id]/route.ts (GET, PATCH)
        │   ├── [id]/contributions/route.ts (GET)
        │   └── [id]/contribute/route.ts (POST)
        ├── pools/
        │   ├── route.ts (GET, POST)
        │   └── [id]/route.ts (GET, PATCH)
        ├── liquidity/
        │   ├── route.ts (GET)
        │   ├── add/route.ts (POST)
        │   └── remove/route.ts (POST)
        ├── swaps/
        │   ├── route.ts (GET)
        │   ├── pool/
        │   │   └── [pool_id]/route.ts (GET)
        │   ├── user/
        │   │   └── [wallet]/route.ts (GET)
        │   └── execute/route.ts (POST)
        └── fees/
            ├── user/
            │   └── [wallet]/route.ts (GET)
            └── claim/route.ts (POST)
```

---

# 🌟 Features You Can Build Easily With This API

| Feature              | API Needed                                       |
| -------------------- | ------------------------------------------------ |
| Show Presales        | `GET /api/presales`                               |
| Show Pools           | `GET /api/pools`                                  |
| User Liquidity Page  | `GET /api/liquidity/user/[wallet]`                |
| Swap History Page    | `GET /api/swaps/user/[wallet]`                    |
| Presale Contributions| `GET /api/presales/[id]/contributions`            |
| Claim LP Rewards     | `GET /api/fees/user/[wallet]`, `POST /api/fees/claim` |
| Admin Launchpad      | `POST /api/tokens`, `POST /api/presales`, `POST /api/pools` |

---
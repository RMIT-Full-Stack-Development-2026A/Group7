# Deployment

Deployed via Render (`render.yaml`) with MongoDB Atlas.

## 1. MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. Add a database user (save the password).
3. In **Network Access**, allow `0.0.0.0/0`.
4. Copy the connection string from **Connect → Drivers** and replace `<password>`.

## 2. Backend env vars

```env
PORT=4000
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=Tictactoang
JWT_SECRET=<long-random-string>
CORS_ORIGIN=https://your-frontend.onrender.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=<gmail-app-password>
MAIL_FROM="Team7 <you@gmail.com>"

PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=<paypal-client-id>
PAYPAL_CLIENT_SECRET=<paypal-secret>
PAYPAL_RETURN_URL=https://your-frontend.onrender.com/subscription?paypal=success
PAYPAL_CANCEL_URL=https://your-frontend.onrender.com/subscription?paypal=cancel
```

`CORS_ORIGIN` accepts comma-separated values for multiple origins.
Use `PAYPAL_ENV=live` only with live credentials.

## 3. Frontend env vars

```env
VITE_BACKEND_ORIGIN=https://tictactoang-backend.onrender.com
```

`render.yaml` sets this automatically. `VITE_API_BASE_URL` and `VITE_SOCKET_BASE_URL` are derived from it.

## 4. Local dev

```bash
npm --workspace backend run dev
npm --workspace frontend run dev
```

The frontend dev server proxies `/api` and `/socket.io` to `http://localhost:4000`.

## 5. Temporary public link (Cloudflare Quick Tunnel)

Share the local dev server with anyone on the internet — no account, no DNS, no Cloudflare config required.

Install `cloudflared` once:

- Windows: `winget install --id Cloudflare.cloudflared`
- macOS: `brew install cloudflared`
- Linux: see https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

Then in three terminals from the repo root:

```bash
npm --workspace backend run dev
npm --workspace frontend run dev
npm run tunnel
```

Cloudflared prints a `https://<random>.trycloudflare.com` URL. Share that link — it's online only while all three commands are running. The backend's CORS and Vite's `allowedHosts` already accept `.trycloudflare.com`, so no further config is needed.

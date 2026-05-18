# Cloud Setup

This project is now ready to use one shared backend and MongoDB Atlas so players on different computers can see the same rooms and play together.

## Fastest Handoff

I can finish the project configuration for you after you create one Atlas database and send me only the connection string.

The connection string looks like this:

```env
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Do not post your real MongoDB password anywhere public. It is okay to paste it here only if you understand I will put it into your local ignored `backend/.env` file.

## MongoDB Atlas

1. Go to https://cloud.mongodb.com and sign in.
2. Create a new project if Atlas asks.
3. Click `Build a Database`.
4. Choose the free/shared option.
5. Keep the default provider/region unless you have a reason to change it.
6. Create a database user. Save the username and password somewhere private.
7. In `Network Access`, add `0.0.0.0/0` for testing. This lets deployed servers connect from anywhere.
8. Go back to `Database`, click `Connect`.
9. Choose `Drivers`.
10. Copy the connection string.
11. Replace `<password>` in that string with the database user's password.
12. Send that full string to Codex and I will put it in `backend/.env`.

## Backend Environment

Set these variables wherever the backend is hosted:

```env
PORT=4000
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=Tictactoang
JWT_SECRET=change-this-to-a-long-random-secret
CORS_ORIGIN=https://your-frontend-domain.example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM="Team7-TicTacToangProject <your-gmail-address@gmail.com>"
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=your-paypal-rest-app-client-id
PAYPAL_CLIENT_SECRET=your-paypal-rest-app-secret
PAYPAL_RETURN_URL=http://localhost:3000/subscription?paypal=success
PAYPAL_CANCEL_URL=http://localhost:3000/subscription?paypal=cancel
```

Use `PAYPAL_ENV=live` only when you are ready to charge real money with live PayPal REST app credentials.

`CORS_ORIGIN` accepts comma-separated origins, so preview deployments can be added like:

```env
CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.example
```

## Frontend Environment

Set these in the frontend host:

```env
VITE_API_BASE_URL=https://your-backend-domain.example/api
VITE_SOCKET_BASE_URL=https://your-backend-domain.example
```

## Local Cloud Test

Run the backend and frontend locally against Atlas:

```bash
npm --workspace backend run dev
npm --workspace frontend run dev
```

Open the frontend from two browsers or two computers on the same public frontend URL. Create a room on one computer, join by code on the other, and start the match. Both clients should enter the same room and receive the same turn order.

## Temporary Public Link

For testing from another Wi-Fi without deploying yet, run the backend, frontend, and a Cloudflare quick tunnel:

```bash
npm --workspace backend run start
npm --workspace frontend run dev -- --host 0.0.0.0 --port 3000
cloudflared tunnel --url http://localhost:3000
```

Share the `https://...trycloudflare.com` URL printed by cloudflared. The link stays online only while your computer, backend, frontend, and tunnel command are running.

The current frontend dev server proxies `/api` and `/socket.io` to `http://localhost:4000`, so users only need the one public frontend URL.

Cloud Setup
This project is now ready to use one shared backend and MongoDB Atlas so players on different computers can see the same rooms and play together.

Fastest Handoff
I can finish the project configuration for you after you create one Atlas database and send me only the connection string.

The connection string looks like this:

mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
Do not post your real MongoDB password anywhere public. It is okay to paste it here only if you understand I will put it into your local ignored backend/.env file.

MongoDB Atlas
Go to https://cloud.mongodb.com and sign in.
Create a new project if Atlas asks.
Click Build a Database.
Choose the free/shared option.
Keep the default provider/region unless you have a reason to change it.
Create a database user. Save the username and password somewhere private.
In Network Access, add 0.0.0.0/0 for testing. This lets deployed servers connect from anywhere.
Go back to Database, click Connect.
Choose Drivers.
Copy the connection string.
Replace <password> in that string with the database user's password.
Send that full string to Codex and I will put it in backend/.env.
Backend Environment
Set these variables wherever the backend is hosted:

PORT=4000
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=Tictactoang
JWT_SECRET=change-this-to-a-long-random-secret
CORS_ORIGIN=https://your-frontend-domain.example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_TIMEOUT_MS=20000
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-gmail-app-password
MAIL_FROM="Team7-TicTacToangProject <your-gmail-address@gmail.com>"
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=your-paypal-rest-app-client-id
PAYPAL_CLIENT_SECRET=your-paypal-rest-app-secret
PAYPAL_RETURN_URL=https://your-frontend-domain.example/subscription?paypal=success
PAYPAL_CANCEL_URL=https://your-frontend-domain.example/subscription?paypal=cancel
Use PAYPAL_ENV=live only when you are ready to charge real money with live PayPal REST app credentials.

CORS_ORIGIN accepts comma-separated origins, so preview deployments can be added like:

CORS_ORIGIN=http://localhost:5173,https://your-frontend-domain.example
Frontend Environment
Set these in the frontend host:

VITE_API_BASE_URL=https://your-backend-domain.example/api
VITE_SOCKET_BASE_URL=https://your-backend-domain.example
VITE_BACKEND_ORIGIN=https://your-backend-domain.example
On Render, render.yaml sets VITE_BACKEND_ORIGIN automatically from the backend service URL. If VITE_API_BASE_URL and VITE_SOCKET_BASE_URL are not set, the frontend derives them from VITE_BACKEND_ORIGIN.

Local Cloud Test
Run the backend and frontend locally against Atlas:

npm --workspace backend run dev
npm --workspace frontend run dev
Open the frontend from two browsers or two computers on the same public frontend URL. Create a room on one computer, join by code on the other, and start the match. Both clients should enter the same room and receive the same turn order.

The current frontend dev server proxies /api and /socket.io to http://localhost:4000, so users only need the one public frontend URL.

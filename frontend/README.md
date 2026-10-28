# SOKO NEXT
1. Run `npm install` in `backend`.
2. Copy `backend/.env.example` to `backend/.env` and set a unique `JWT_SECRET`, `SUPER_ADMIN_EMAIL`, and `SUPER_ADMIN_PASSWORD`.
3. Run `mysql -u root -p < backend/schema.sql`.
4. Run `npm start` in `backend` to start the API at http://localhost:3000.

Do not use the example environment values in production. Promo code: SOKO10. Without MySQL the catalog shows demo products.

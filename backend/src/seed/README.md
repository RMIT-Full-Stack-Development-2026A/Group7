# Seed Data

This folder stores local development seed data.

## Users

### `admin`

- `_id`: `69e3435ceff30e9ad1367f2b`
- `name`: `The One Who Asked`
- `username`: `admin`
- `email`: `theonewhoasked@example.com`
- `loginPassword`: `WhoAsked123@`
- `password`: `$2a$12$WyWIUcLWcLb3.OAASl4NaOuqFGiD55.FRsHa0xW3iZFuyQnZQy8Bq`
- `country`: `XYZ`
- `role`: `admin`
- `accountStatus`: `active`
- `isPremium`: `true`
- `subscriptionEndDate`: `null`
- `failedLoginAttempts`: `0`
- `lockUntil`: `null`
- `lastLoginAt`: `null`
- `avatar`: `Mambo.png`
- `createdAt`: `2026-04-18T08:39:56.482Z`
- `updatedAt`: `2026-04-18T09:24:26.146Z`
- `__v`: `0`

## Usage

```js
const { users } = require('../../seed')
```

# Todo List

A small multi-account Todo app made with Next.js, Django REST Framework, Auth0, and PostgreSQL. Users can only see and manage their own Todos.

## What is included

- Login, signup, and logout through Auth0
- Create, edit, complete, and delete Todos
- Search and active/completed filters
- Loading, empty, and error states
- Django checks the Auth0 token before allowing Todo API requests

## What you need

- Docker Desktop
- An Auth0 account

## Environment file

Copy the example file:

```powershell
Copy-Item .env.example .env
notepad .env
```

Set the Auth0 values for your own Auth0 application:

```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://todo-api
```

`POSTGRES_PASSWORD`, `DJANGO_SECRET_KEY`, and `AUTH0_SECRET` should be random values. Keep `APP_BASE_URL` as `http://localhost:3000` locally.

## Run locally

Start Docker Desktop, then run this from the project folder:

```powershell
.\start-dev.cmd
```

This one command starts the frontend, Django backend, and local PostgreSQL database. Keep the terminal open while using the app.

Open http://localhost:3000. Use the Auth0 page to sign up or log in.

To stop it:

```powershell
.\stop-dev.cmd
```

## API

All Todo routes require login:

```text
GET    /api/todos/
POST   /api/todos/
GET    /api/todos/:id/
PATCH  /api/todos/:id/
DELETE /api/todos/:id/
```

The backend gets the current account from the verified Auth0 token. The frontend does not send an account ID.

## Tests

The backend tests cover Todo creation, authentication, account isolation, and attempts to access another user's Todo.

```powershell
cd backend
.\.venv\Scripts\python.exe manage.py test

cd ..\frontend
npm run lint
npm run build
npm audit
```

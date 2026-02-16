# ROOMLY


Built with **FastAPI**, **SQLModel**, **PostgreSQL**, **WebSockets**, and **Docker**.

[◎ DEV](README_DEV.md) 

## 🚀 Key Features

### Core Functionality
- ✅ **Authentication**: JWT-based auth via FastAPI Users + Role-based access (Student/Landlord).
- ✅ **Property Feed**: Advanced filtering, search, and pagination.
- ✅ **Smart Matching**: Tinder-style swipe system for properties.
- ✅ **Real-Time Chat**: WebSocket communication for instant messaging between matched users.
- ✅ **Profile Management**: Custom profiles for students (preferences, budget) and landlords (company info).
- ✅ **Notifications**: Async event system for matches and messages.
- ✅ **Media Uploads**: Cloudinary integration for images.

### Technical Excellence
- ✅ **95% Test Coverage**: High-confidence codebase with `pytest`.
- ✅ **Type Safety**: Fully typed with SQLModel and Pydantic.
- ✅ **Containerized**: Ready-to-deploy Docker environment.
- ✅ **Migrations**: Automated schema management with Alembic.

## 📊 Architecture

### Stack
- **FastAPI**: High-performance async web framework.
- **SQLModel/PostgreSQL**: Robust data layer.
- **WebSockets**: Bi-directional real-time communication.
- **Alembic**: Database migrations.
- **Docker**: Consistent dev/prod environments.

### Domain Models
- **Users**: Admin, Student, Landlord roles.
- **Profiles**: Extended user data.
- **Properties**: Listings with amenities & location.
- **Interactions**: Swipes, Matches, Messages, Notifications.

## 📁 Project Structure

```
app/
├── api/v1/                  # API Endpoints
│   ├── endpoints/
│   │   ├── auth.py          # Auth logic
│   │   ├── websocket.py     # Real-time chat
│   │   ├── interactions.py  # Swipes/Matches
│   │   └── ...
├── core/                    # Config & Security
├── models/                  # Database Models
├── schemas/                 # Pydantic Schemas
├── services/                # Business Logic (e.g., Media)
└── main.py                  # Entry Point
```

## 🏁 Getting Started

### Prerequisites
- Docker & Docker Compose
- Or: Python 3.9+ and PostgreSQL

### fast-track (Docker)

1.  **Clone & Configure**:
    ```bash
    cp .env.example .env
    # Add your credentials to .env
    ```

2.  **Launch**:
    ```bash
    docker-compose up -d --build
    ```

3.  **Explore**:
    - API Docs: `http://localhost:8000/docs`
    - App: `http://localhost:8000`

### Local Development

1.  **Install**: `uv sync`
2.  **DB Setup**: `createdb roomly`
3.  **Migrate**: `uv run alembic upgrade head`
4.  **Run**: `uv run uvicorn app.main:app --reload`
5.  **Test**: `uv run pytest tests/api/v1/ -v`

## 📖 Usage Workflow

1.  **Auth**: Register (`POST /auth/register`) and Login (`POST /auth/jwt/login`).
2.  **Profile**: Create your specific profile (`POST /profiles/student` or `/landlord`).
3.  **Properties**:
    - **Landlord**: Create listing (`POST /properties/`).
    - **Student**: Browse & Filter (`GET /properties/`).
4.  **Connect**:
    - **Student**: Swipe Right (`POST /interactions/swipe`).
    - **Landlord**: Accept Swipe (`POST /interactions/landlord/accept-swipe/{id}`).
5.  **Chat**:
    - **Real-time**: Connect via WebSocket (`ws://localhost:8000/api/v1/ws/{match_id}`).
    - **History**: Fetch logs (`GET /messages/{match_id}`).

## 🧪 Testing

We maintain a high standard of quality.

- **Run All Tests**: `uv run pytest tests/api/v1/`
- **Coverage Report**: `uv run pytest --cov=app`

See [TESTING.md](/TESTING.md) for strategy and details.

## 📦 Deployment

Production build via Docker:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

**Checklist**:
- [ ] Set `SECRET_KEY`
- [ ] Configure Production DB
- [ ] Setup Cloudinary
- [ ] Enable HTTPS

## 🤝 Contributing

Fork, branching, commit, push, PR. Simple as that!

## 📄 License

MIT License. Built for students, by developers.

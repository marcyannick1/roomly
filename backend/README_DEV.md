# Roomly App Documentation

Welcome to the `app` directory! This is the core of the Roomly backend. This guide is designed to help new collaborators understand the structure, architecture, and development workflows.

## 1. Architecture Overview

We follow a **Three-Layer Architecture** to keep the code organized and scalable:

1.  **Presentation Layer (`api/`)**:
    *   Handles HTTP requests, input validation, and serialization.
    *   **Keep it thin**: Controllers should call services or CRUD operations, not contain complex business logic.
2.  **Service Layer (`services/`)**:
    *   Contains business logic (e.g., matching algorithms, complex validations, email sending).
    *   Orchestrates operations between different models.
3.  **Data Access Layer (`models/` & `core/db.py`)**:
    *   Defines database schemas using **SQLModel**.
    *   Handles direct database interactions.

## 2. Directory Structure

```
app/
├── api/             # API Endpoints & Routes
│   ├── v1/          # Versioning
│   │   ├── endpoints/  # Actual route handlers (e.g., auth, properties)
│   │   └── api.py      # Router aggregation
│   └── deps.py      # Dependencies (DB session, Current User)
├── core/            # Core Configuration
│   ├── config.py    # Environment variables (Pydantic Settings)
│   ├── db.py        # Database connection & session factory
│   └── security.py  # Auth configuration
├── models/          # Database Models (SQLModel)
│   ├── user.py      # User & Auth tables
│   ├── profile.py   # Student & Landlord profiles
│   ├── property.py  # Housing listings
│   └── interaction.py # Swipes, Matches, Messages
├── schemas/         # Pydantic Schemas (Data Transfer Objects)
│   ├── user.py
│   ├── profile.py
│   └── property.py
├── services/        # Business Logic
│   └── user_manager.py # Custom user logic
└── main.py          # App Entry Point (FastAPI app init)
```

## 3. Key Concepts & Patterns

### Database Access
We use **SQLModel** with **Async SQLAlchemy** (`asyncpg`).
*   **Session Injection**: Always inject the session in your routes:
    ```python
    session: AsyncSession = Depends(get_async_session)
    ```
*   **Queries**: Use `await session.execute(select(Model))` and `result.scalars()`.

### Authentication
We use **FastAPI Users**.
*   **Protecting Routes**:
    ```python
    user: User = Depends(current_active_user)
    ```
*   **Superuser**: `Depends(current_superuser)`

### Models vs. Schemas
*   **Models (`app/models/`)**: Define the **Database Table** structure. Used for ORM operations.
*   **Schemas (`app/schemas/`)**: Define the **API Input/Output**. Used for validation and serialization.
    *   *Example*: `PropertyCreate` (Schema) -> `Property` (Model) -> `PropertyRead` (Schema).

## 4. How to Add a New Feature

Follow this workflow to add a new entity (e.g., "Reviews"):

1.  **Define the Model**:
    Create `app/models/review.py`. Inherit from `SQLModel` and `table=True`.
    *   *Don't forget to import it in `app/models/__init__.py`!*

2.  **Create Schemas**:
    Create `app/schemas/review.py`. Define `ReviewBase`, `ReviewCreate`, and `ReviewRead`.

3.  **Create Endpoints**:
    Create `app/api/v1/endpoints/reviews.py`. Implement CRUD operations.

4.  **Register Router**:
    Add the new router to `app/api/v1/api.py`:
    ```python
    from app.api.v1.endpoints import reviews
    api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
    ```

5.  **Database Migration**:
    Generate and apply the migration:
    ```bash
    uv run alembic revision --autogenerate -m "Add reviews"
    uv run alembic upgrade head
    ```

## 5. Development Tips

*   **Prefixes**: All API routes are prefixed with `/api/v1`.
*   **Async/Await**: This is an async application. Don't block the event loop! Use `await` for DB calls and I/O.
*   **Auto-Reload**: When running via `docker-compose` or `uvicorn --reload`, changes in this folder will auto-restart the server.
*   **Seeding Data**: You can populate the database with dummy data for testing purposes using the seed script:
    ```bash
    uv run python run_seed.py
    ```

## 6. Testing

We use **Pytest** for testing.

1.  **Prerequisites**:
    Ensure you have a test database created. The default configuration uses `roomly_test`.
    ```bash
    # If running locally using the docker db
    docker exec roomly_sandbox-db-1 psql -U postgres -c "CREATE DATABASE roomly_test;"
    ```

2.  **Running Tests**:
    ```bash
    # Run all tests
    export PYTHONPATH=$PYTHONPATH:. && uv run pytest tests/api/v1 -v
    
    # Run unit tests
    export PYTHONPATH=$PYTHONPATH:. && uv run pytest tests/unit -v
    ```

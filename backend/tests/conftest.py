import asyncio
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlmodel import SQLModel
from app.main import app
from app.core.config import settings
from app.core.db import get_async_session
from app.core.config import settings

# Use settings from app config but override database name for testing
TEST_DATABASE_URL = f"postgresql+asyncpg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/roomly_test"

# IMPORTANT: poolclass=NullPool is crucial for tests if we are reusing engine or want to avoid statement overlap
from sqlalchemy.pool import NullPool

engine = create_async_engine(TEST_DATABASE_URL, echo=False, poolclass=NullPool)
TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test session."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session", autouse=True)
async def init_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()

@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    # We must NOT share the same session instance across multiple parallel requests if they overlap,
    # but `AsyncClient` executes requests sequentially unless gathered.
    # However, `fastapi-users` or extensive logic might do background stuff or something.
    # The safest way is to let the dependency injection create a NEW session for every request, 
    # instead of overriding it with a single sesssion object for the whole test client.
    
    # We will override `get_async_session` to return a fresh session from OUR test engine.
    async def override_get_async_session():
        async with TestingSessionLocal() as session:
            yield session

    app.dependency_overrides[get_async_session] = override_get_async_session
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    
    app.dependency_overrides.clear()

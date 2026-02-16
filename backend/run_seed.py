from app.seed import seed_db
import asyncio

if __name__ == "__main__":
    asyncio.run(seed_db())

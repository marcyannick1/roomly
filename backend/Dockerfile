FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (e.g. for psycopg2 if used, but we use asyncpg)
# RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency files
COPY pyproject.toml uv.lock* ./

# Install dependencies
RUN uv sync --frozen --no-install-project

# Copy application code
COPY . .

# Install project
RUN uv sync --frozen

# Expose port
EXPOSE 8000

# Run command
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

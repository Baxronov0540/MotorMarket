FROM python:3.12-slim

# Install uv package manager
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Copy dependency lock files first to leverage Docker cache
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
# --frozen ensures uv.lock is not modified and dependencies are strictly installed from it
RUN uv sync --frozen

# Copy the rest of the backend files
COPY . .

# Expose backend port
EXPOSE 8000

# Start FastAPI server using uv to automatically use the virtual environment
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

@echo off
echo 🚀 Starting Epitychia MVP Deployment...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.production .env
    echo ⚠️  Please edit .env file with your actual values before continuing!
    echo    Required: POSTGRES_PASSWORD, JWT_SECRET, ENCRYPTION_KEY, Firebase keys
    pause
)

REM Build and start services
echo 🏗️  Building and starting services...
docker-compose -f docker-compose.prod.yml up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...
curl -f http://localhost/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Services are not responding. Check logs with: docker-compose -f docker-compose.prod.yml logs
    pause
    exit /b 1
)

echo ✅ Services are healthy!
echo.
echo 🎉 Deployment complete!
echo.
echo 📱 Your Epitychia MVP is now running:
echo    🌐 Web App: http://localhost
echo    🔧 API: http://localhost/api
echo    📊 Desktop App: http://localhost:1420
echo.
echo 📋 Next steps:
echo    1. Install the Chrome extension from chrome-extension/ folder
echo    2. Create a user account at http://localhost
echo    3. Login in the Chrome extension popup
echo    4. Start copying text - it will be automatically captured!
echo.
echo 🛠️  Useful commands:
echo    View logs: docker-compose -f docker-compose.prod.yml logs -f
echo    Stop services: docker-compose -f docker-compose.prod.yml down
echo    Restart: docker-compose -f docker-compose.prod.yml restart
echo.
pause
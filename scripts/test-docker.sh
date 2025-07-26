#!/bin/bash

# DopaForge Docker Test Runner
# This script sets up and runs all tests in Docker containers

set -e

echo "🚀 Starting DopaForge Docker Test Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Parse command line arguments
TEST_TYPE=${1:-all}
WATCH_MODE=${2:-false}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to cleanup containers
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up test containers...${NC}"
    docker-compose -f docker-compose.test.yml down -v
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Build test images
echo -e "${GREEN}🔨 Building test images...${NC}"
docker-compose -f docker-compose.test.yml build

# Start test infrastructure
echo -e "${GREEN}🏗️  Starting test infrastructure...${NC}"
docker-compose -f docker-compose.test.yml up -d test-db test-redis

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 5

# Run database migrations
echo -e "${GREEN}📊 Running database migrations...${NC}"
docker-compose -f docker-compose.test.yml run --rm test-runner pnpm db:migrate:test

# Run tests based on type
case $TEST_TYPE in
    unit)
        echo -e "${GREEN}🧪 Running unit tests...${NC}"
        docker-compose -f docker-compose.test.yml run --rm test-runner pnpm test:unit
        ;;
    integration)
        echo -e "${GREEN}🔗 Running integration tests...${NC}"
        docker-compose -f docker-compose.test.yml run --rm test-runner pnpm test:integration
        ;;
    e2e)
        echo -e "${GREEN}🌐 Running E2E tests...${NC}"
        docker-compose -f docker-compose.test.yml run --rm test-runner pnpm test:e2e
        ;;
    all)
        echo -e "${GREEN}🎯 Running all tests...${NC}"
        docker-compose -f docker-compose.test.yml run --rm test-runner pnpm test:all
        ;;
    watch)
        echo -e "${GREEN}👀 Running tests in watch mode...${NC}"
        docker-compose -f docker-compose.test.yml run --rm test-runner pnpm test:watch
        ;;
    *)
        echo -e "${RED}❌ Unknown test type: $TEST_TYPE${NC}"
        echo "Usage: ./scripts/test-docker.sh [unit|integration|e2e|all|watch]"
        exit 1
        ;;
esac

# Show test results
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi
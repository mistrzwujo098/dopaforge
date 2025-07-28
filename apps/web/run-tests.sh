#!/bin/bash

echo "🚀 Uruchamiam serwer deweloperski..."
npm run dev &
SERVER_PID=$!

echo "⏳ Czekam aż serwer się uruchomi..."
sleep 10

# Sprawdź czy serwer działa
until curl -s http://localhost:3000 > /dev/null; do
  echo "Czekam na serwer..."
  sleep 2
done

echo "✅ Serwer uruchomiony!"

echo "🧪 Uruchamiam testy..."
npm run test:auto

TEST_EXIT_CODE=$?

echo "🛑 Zatrzymuję serwer..."
kill $SERVER_PID

exit $TEST_EXIT_CODE
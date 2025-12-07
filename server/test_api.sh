#!/bin/bash

# FastAPI Backend Test Script
# Tests all API endpoints

BASE_URL="http://localhost:8000"
TOKEN=""

echo "🧪 Testing FastAPI Backend..."
echo "================================"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s "$BASE_URL/api/health" | python3 -m json.tool
echo ""

# Test 2: Register User
echo "2️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123","name":"Demo User"}')
echo "$REGISTER_RESPONSE" | python3 -m json.tool
TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo ""

# Test 3: Login
echo "3️⃣  Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}')
echo "$LOGIN_RESPONSE" | python3 -m json.tool
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo ""

# Test 4: Get Current User
echo "4️⃣  Testing Get Current User..."
curl -s "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Test 5: Create Task
echo "5️⃣  Testing Create Task..."
TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"This is a test task","priority":"high","deadline":"2025-12-31"}')
echo "$TASK_RESPONSE" | python3 -m json.tool
TASK_ID=$(echo "$TASK_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['_id'])" 2>/dev/null)
echo ""

# Test 6: Get All Tasks
echo "6️⃣  Testing Get All Tasks..."
curl -s "$BASE_URL/api/tasks" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Test 7: Update Task
echo "7️⃣  Testing Update Task..."
curl -s -X PUT "$BASE_URL/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}' | python3 -m json.tool
echo ""

# Test 8: Create Note
echo "8️⃣  Testing Create Note..."
curl -s -X POST "$BASE_URL/api/notes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Note","content":"# Hello World\nThis is a test note","tags":["test","demo"]}' | python3 -m json.tool
echo ""

# Test 9: Get All Notes
echo "9️⃣  Testing Get All Notes..."
curl -s "$BASE_URL/api/notes" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Test 10: Create Goal
echo "🔟 Testing Create Goal..."
curl -s -X POST "$BASE_URL/api/goals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Goal","description":"Complete FastAPI migration","period":"monthly","progress":50}' | python3 -m json.tool
echo ""

# Test 11: Get All Goals
echo "1️⃣1️⃣  Testing Get All Goals..."
curl -s "$BASE_URL/api/goals" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Test 12: Create Routine
echo "1️⃣2️⃣  Testing Create Routine..."
curl -s -X POST "$BASE_URL/api/routines" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Morning Exercise","description":"30 min workout","startTime":"06:00","endTime":"06:30","category":"fitness"}' | python3 -m json.tool
echo ""

# Test 13: Get All Routines
echo "1️⃣3️⃣  Testing Get All Routines..."
curl -s "$BASE_URL/api/routines" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Test 14: Delete Task
echo "1️⃣4️⃣  Testing Delete Task..."
curl -s -X DELETE "$BASE_URL/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "================================"
echo "✅ All tests completed!"
echo ""
echo "📊 API Documentation: http://localhost:8000/docs"
echo "📚 ReDoc: http://localhost:8000/redoc"

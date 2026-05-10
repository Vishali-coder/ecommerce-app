import requests
import json

# Test login endpoint
url = "http://localhost:9092/api/auth/login"
data = {
    "email": "test@example.com",
    "password": "testpassword"
}

headers = {
    "Content-Type": "application/json"
}

try:
    print("🔄 Testing login endpoint...")
    response = requests.post(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
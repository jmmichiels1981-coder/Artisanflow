#!/usr/bin/env python3
"""
Backend API Testing for ArtisanFlow Application
Tests the complete application flow as requested in review
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://layout-restore-1.preview.emergentagent.com/api"

# Test account credentials
TEST_CREDENTIALS = {
    "email": "artisan@test.fr",
    "password": "test123",
    "pin": "1234",
    "username": "artisan_test"
}

def test_login_endpoint():
    """Test POST /api/auth/login with test credentials"""
    print("\n=== Testing Login Endpoint ===")
    
    payload = {
        "email": TEST_CREDENTIALS["email"],
        "password": TEST_CREDENTIALS["password"],
        "pin": TEST_CREDENTIALS["pin"]
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["username", "access_token", "refresh_token"]
            
            for field in required_fields:
                if field in data:
                    print(f"✅ {field}: {data[field][:20]}..." if field.endswith("_token") else f"✅ {field}: {data[field]}")
                else:
                    print(f"❌ Missing field: {field}")
                    return False, None
            
            # Verify username matches expected
            if data["username"] == TEST_CREDENTIALS["username"]:
                print(f"✅ Username matches expected: {TEST_CREDENTIALS['username']}")
            else:
                print(f"❌ Username mismatch. Expected: {TEST_CREDENTIALS['username']}, Got: {data['username']}")
                return False, None
                
            return True, data["access_token"]
        else:
            print(f"❌ Login failed with status {response.status_code}")
            if response.status_code == 401:
                print("❌ Authentication failed - check credentials")
            return False, None
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False, None

def test_dashboard_stats_endpoint(access_token):
    """Test GET /api/dashboard/stats with username"""
    print("\n=== Testing Dashboard Stats Endpoint ===")
    
    if not access_token:
        print("❌ No access token available for dashboard test")
        return False
    
    # Try different possible endpoints for dashboard stats
    possible_endpoints = [
        f"/dashboard/stats?username={TEST_CREDENTIALS['username']}",
        f"/dashboard/stats/{TEST_CREDENTIALS['username']}",
        f"/stats?username={TEST_CREDENTIALS['username']}",
        f"/user/stats?username={TEST_CREDENTIALS['username']}"
    ]
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    for endpoint in possible_endpoints:
        try:
            print(f"\nTrying endpoint: {endpoint}")
            response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers, timeout=30)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Dashboard stats endpoint found: {endpoint}")
                print(f"✅ Stats data returned: {json.dumps(data, indent=2)}")
                return True
            elif response.status_code == 404:
                print(f"❌ Endpoint not found: {endpoint}")
                continue
            else:
                print(f"❌ Request failed with status {response.status_code}")
                continue
                
        except Exception as e:
            print(f"❌ Exception occurred for {endpoint}: {str(e)}")
            continue
    
    print("❌ No working dashboard stats endpoint found")
    return False

def test_backend_health():
    """Test basic backend connectivity and health"""
    print("\n=== Testing Backend Health ===")
    
    try:
        # Test basic connectivity
        response = requests.get(f"{BACKEND_URL.replace('/api', '')}/", timeout=10)
        print(f"Root endpoint status: {response.status_code}")
        
        # Test if API is responding
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        print(f"API endpoint status: {response.status_code}")
        
        if response.status_code in [200, 404, 405]:  # 404/405 are acceptable for root API
            print("✅ Backend is responding")
            return True
        else:
            print(f"❌ Backend not responding properly: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Backend connectivity failed: {str(e)}")
        return False

def test_navigation_endpoints(access_token):
    """Test key navigation endpoints to ensure no backend crashes"""
    print("\n=== Testing Navigation Endpoints ===")
    
    if not access_token:
        print("❌ No access token available for navigation tests")
        return False
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Test key endpoints that the dashboard might call
    endpoints_to_test = [
        "/quotes",
        "/invoices", 
        "/inventory",
        "/clients",
        f"/subscription/status?username={TEST_CREDENTIALS['username']}"
    ]
    
    results = {}
    
    for endpoint in endpoints_to_test:
        try:
            print(f"\nTesting endpoint: {endpoint}")
            response = requests.get(f"{BACKEND_URL}{endpoint}", headers=headers, timeout=15)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code in [200, 401, 403]:  # 401/403 acceptable if auth is required differently
                print(f"✅ Endpoint responding: {endpoint}")
                results[endpoint] = True
            else:
                print(f"❌ Endpoint error: {endpoint} - Status: {response.status_code}")
                results[endpoint] = False
                
        except Exception as e:
            print(f"❌ Exception for {endpoint}: {str(e)}")
            results[endpoint] = False
    
    successful = sum(1 for result in results.values() if result)
    total = len(results)
    
    print(f"\nNavigation endpoints: {successful}/{total} responding properly")
    
    return successful > 0  # At least one endpoint should work

def test_auth_refresh_token(access_token, refresh_token):
    """Test POST /api/auth/refresh to verify token system works"""
    print("\n=== Testing Auth Refresh Token ===")
    
    if not refresh_token:
        print("❌ No refresh token available for test")
        return False
    
    payload = {
        "refresh_token": refresh_token
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/refresh", json=payload, timeout=15)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["username", "access_token", "refresh_token"]
            
            for field in required_fields:
                if field in data:
                    print(f"✅ {field}: Present")
                else:
                    print(f"❌ Missing field: {field}")
                    return False
            
            print("✅ Token refresh working properly")
            return True
        else:
            print(f"❌ Token refresh failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False

def test_register_endpoint_simulation():
    """Test POST /api/auth/register endpoint (simulation only)"""
    print("\n=== Testing Register Endpoint (Simulation) ===")
    
    import time
    unique_id = str(int(time.time()))
    payload = {
        "companyName": "Test Co",
        "firstName": "Test",
        "lastName": "User",
        "email": f"test{unique_id}@test.com",
        "username": f"testuser{unique_id}",
        "password": "testpass123",
        "pin": "1111",
        "countryCode": "FR",
        "paymentMethod": "sepa_debit",
        "stripePaymentMethodId": "pm_invalid_test"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/register", json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # We expect this to fail with invalid payment method
        if response.status_code == 400:
            if "Stripe" in response.text or "payment" in response.text.lower():
                print("✅ Endpoint exists and returns appropriate Stripe error")
                return True
            else:
                print("❌ Unexpected error message")
                return False
        elif response.status_code == 404:
            print("❌ Endpoint not found")
            return False
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False

def check_backend_logs():
    """Check backend logs for expected messages"""
    print("\n=== Checking Backend Logs ===")
    
    try:
        import subprocess
        result = subprocess.run(
            ["tail", "-n", "50", "/var/log/supervisor/backend.err.log"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            logs = result.stdout
            print("Recent backend logs:")
            print(logs)
            
            # Look for expected log messages
            expected_messages = [
                "Creating SetupIntent",
                "Created Stripe Customer",
                "Created SetupIntent"
            ]
            
            found_messages = []
            for msg in expected_messages:
                if msg in logs:
                    found_messages.append(msg)
                    print(f"✅ Found log message: {msg}")
                else:
                    print(f"❌ Missing log message: {msg}")
            
            return len(found_messages) > 0
        else:
            print(f"❌ Failed to read logs: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Exception checking logs: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("=== ArtisanFlow Backend API Testing ===")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().isoformat()}")
    
    results = {}
    
    # Test profession fields in register endpoint
    print("\n🎯 TESTING PROFESSION FIELDS IN REGISTER ENDPOINT")
    results['register_standard_profession'] = test_register_with_standard_profession()
    results['register_profession_autre'] = test_register_with_profession_autre()
    results['register_without_profession'] = test_register_without_profession()
    
    # Test SEPA SetupIntent
    results['sepa_setup_intent'] = test_setup_intent_sepa()
    
    # Test PAD SetupIntent  
    results['pad_setup_intent'] = test_setup_intent_pad()
    
    # Test Register endpoint (simulation)
    results['register_simulation'] = test_register_endpoint_simulation()
    
    # Check logs
    results['backend_logs'] = check_backend_logs()
    
    # Summary
    print("\n=== TEST SUMMARY ===")
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    # Focus on profession field tests
    profession_tests = ['register_standard_profession', 'register_profession_autre', 'register_without_profession']
    profession_passed = sum(1 for test in profession_tests if results.get(test, False))
    
    print(f"\n🎯 PROFESSION FIELDS TESTS: {profession_passed}/{len(profession_tests)} passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
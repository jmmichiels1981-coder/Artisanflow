#!/usr/bin/env python3
"""
Backend API Testing for ArtisanFlow Stripe Integration
Tests the refactored Stripe payment flow endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://craftadmin.preview.emergentagent.com/api"

def test_setup_intent_sepa():
    """Test POST /api/payment/setup-intent with SEPA (Europe)"""
    print("\n=== Testing SEPA SetupIntent Creation ===")
    
    payload = {
        "email": "test-sepa@artisan.fr",
        "firstName": "Jean",
        "lastName": "Dupont", 
        "companyName": "Artisan SARL",
        "countryCode": "FR",
        "payment_method_type": "sepa_debit"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/payment/setup-intent", json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["client_secret", "setup_intent_id", "customer_id"]
            
            for field in required_fields:
                if field in data:
                    print(f"✅ {field}: {data[field]}")
                else:
                    print(f"❌ Missing field: {field}")
                    return False
            
            # Verify client_secret format
            if data["client_secret"].startswith("seti_"):
                print("✅ client_secret has correct format")
            else:
                print("❌ client_secret format incorrect")
                return False
                
            return True
        else:
            print(f"❌ Request failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False

def test_setup_intent_pad():
    """Test POST /api/payment/setup-intent with PAD (Canada)"""
    print("\n=== Testing PAD SetupIntent Creation ===")
    
    payload = {
        "email": "test-pad@artisan.ca",
        "firstName": "Pierre",
        "lastName": "Martin",
        "companyName": "Artisan Inc",
        "countryCode": "CA", 
        "payment_method_type": "acss_debit"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/payment/setup-intent", json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["client_secret", "setup_intent_id", "customer_id"]
            
            for field in required_fields:
                if field in data:
                    print(f"✅ {field}: {data[field]}")
                else:
                    print(f"❌ Missing field: {field}")
                    return False
            
            # Verify client_secret format
            if data["client_secret"].startswith("seti_"):
                print("✅ client_secret has correct format")
            else:
                print("❌ client_secret format incorrect")
                return False
                
            return True
        else:
            print(f"❌ Request failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")
        return False

def test_register_endpoint_simulation():
    """Test POST /api/auth/register endpoint (simulation only)"""
    print("\n=== Testing Register Endpoint (Simulation) ===")
    
    payload = {
        "companyName": "Test Co",
        "firstName": "Test",
        "lastName": "User",
        "email": "test@test.com",
        "username": "testuser",
        "password": "testpass123",
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
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
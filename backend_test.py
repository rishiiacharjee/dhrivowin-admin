import requests
import sys
import json
from datetime import datetime

class TournamentAPITester:
    def __init__(self, base_url="https://tournament-central-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.admin_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_public_endpoints(self):
        """Test public endpoints that don't require authentication"""
        print("\n" + "="*50)
        print("TESTING PUBLIC ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        self.run_test("Root API", "GET", "", 200)
        
        # Test public stats
        success, stats = self.run_test("Public Stats", "GET", "public/stats", 200)
        if success:
            print(f"   Stats: {stats}")
        
        # Test tournaments list
        self.run_test("Get Tournaments", "GET", "tournaments", 200)
        
        # Test news
        self.run_test("Get News", "GET", "news", 200)
        
        # Test giveaways
        self.run_test("Get Giveaways", "GET", "giveaways", 200)
        
        # Test lucky draws
        self.run_test("Get Lucky Draws", "GET", "lucky-draws", 200)
        
        # Test results
        self.run_test("Get Results", "GET", "results", 200)
        
        # Test leaderboard
        self.run_test("Get Leaderboard", "GET", "leaderboard", 200)

    def test_user_registration_login(self):
        """Test user registration and login"""
        print("\n" + "="*50)
        print("TESTING USER REGISTRATION & LOGIN")
        print("="*50)
        
        # Test user registration
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "mobile": f"9876543{timestamp[-3:]}",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}",
            "referral_code": None
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   User ID: {self.user_id}")
            print(f"   Token: {self.token[:20]}...")
        
        # Test user login
        login_data = {
            "mobile": user_data["mobile"],
            "password": user_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Login successful")

    def test_admin_login(self):
        """Test admin login"""
        print("\n" + "="*50)
        print("TESTING ADMIN LOGIN")
        print("="*50)
        
        admin_data = {
            "mobile": "9999999999",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=admin_data
        )
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            self.admin_id = response['user']['id']
            print(f"   Admin ID: {self.admin_id}")
            print(f"   Admin Token: {self.admin_token[:20]}...")
            return True
        return False

    def test_authenticated_endpoints(self):
        """Test endpoints that require user authentication"""
        if not self.token:
            print("❌ Skipping authenticated tests - no user token")
            return
            
        print("\n" + "="*50)
        print("TESTING AUTHENTICATED USER ENDPOINTS")
        print("="*50)
        
        headers = {'Authorization': f'Bearer {self.token}'}
        
        # Test get current user
        self.run_test("Get Current User", "GET", "auth/me", 200, headers=headers)
        
        # Test get my matches
        self.run_test("Get My Matches", "GET", "my-matches", 200, headers=headers)
        
        # Test wallet transactions
        self.run_test("Get Wallet Transactions", "GET", "wallet/transactions", 200, headers=headers)
        
        # Test profile update
        profile_data = {"name": "Updated Test User"}
        self.run_test("Update Profile", "PUT", "auth/profile", 200, data=profile_data, headers=headers)

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        if not self.admin_token:
            print("❌ Skipping admin tests - no admin token")
            return
            
        print("\n" + "="*50)
        print("TESTING ADMIN ENDPOINTS")
        print("="*50)
        
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test admin stats
        self.run_test("Get Admin Stats", "GET", "admin/stats", 200, headers=headers)
        
        # Test get all users
        self.run_test("Get All Users", "GET", "admin/users", 200, headers=headers)
        
        # Test get pending withdrawals
        self.run_test("Get Pending Withdrawals", "GET", "admin/withdrawals", 200, headers=headers)
        
        # Test create tournament
        tournament_data = {
            "title": "Test Tournament",
            "game_type": "FREE_FIRE",
            "mode": "BR",
            "team_type": "SOLO",
            "entry_fee": 10,
            "prize_pool": 100,
            "max_participants": 50,
            "match_time": "18:00",
            "match_date": "2024-12-31",
            "description": "Test tournament for API testing"
        }
        
        success, tournament = self.run_test(
            "Create Tournament",
            "POST",
            "tournaments",
            200,
            data=tournament_data,
            headers=headers
        )
        
        if success and 'id' in tournament:
            tournament_id = tournament['id']
            print(f"   Created tournament ID: {tournament_id}")
            
            # Test update tournament
            update_data = {"description": "Updated test tournament"}
            self.run_test(
                "Update Tournament",
                "PUT",
                f"tournaments/{tournament_id}",
                200,
                data=update_data,
                headers=headers
            )
            
            # Test get tournament details
            self.run_test("Get Tournament Details", "GET", f"tournaments/{tournament_id}", 200)
            
            # Test get tournament participants
            self.run_test("Get Tournament Participants", "GET", f"tournaments/{tournament_id}/participants", 200)
        
        # Test create news
        news_data = {
            "title": "Test News",
            "content": "This is a test news article"
        }
        self.run_test("Create News", "POST", "news", 200, data=news_data, headers=headers)
        
        # Test create giveaway
        giveaway_data = {
            "title": "Test Giveaway",
            "description": "Test giveaway description",
            "prize": "Test Prize",
            "end_date": "2024-12-31T23:59:59Z"
        }
        self.run_test("Create Giveaway", "POST", "giveaways", 200, data=giveaway_data, headers=headers)

    def test_wallet_operations(self):
        """Test wallet-related operations"""
        if not self.token:
            print("❌ Skipping wallet tests - no user token")
            return
            
        print("\n" + "="*50)
        print("TESTING WALLET OPERATIONS")
        print("="*50)
        
        headers = {'Authorization': f'Bearer {self.token}'}
        
        # Test create recharge order
        recharge_data = {"amount": 100}
        success, order = self.run_test(
            "Create Recharge Order",
            "POST",
            "wallet/create-order",
            200,
            data=recharge_data,
            headers=headers
        )
        
        if success:
            print(f"   Order created: {order.get('order_id', 'N/A')}")

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"{i}. {test['test']}")
                if 'expected' in test:
                    print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                if 'error' in test:
                    print(f"   Error: {test['error']}")
                if 'response' in test:
                    print(f"   Response: {test['response']}")
        
        return len(self.failed_tests) == 0

def main():
    print("🚀 Starting DHRIVO WON Tournament API Tests")
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = TournamentAPITester()
    
    # Run all tests
    tester.test_public_endpoints()
    tester.test_user_registration_login()
    admin_success = tester.test_admin_login()
    tester.test_authenticated_endpoints()
    if admin_success:
        tester.test_admin_endpoints()
    tester.test_wallet_operations()
    
    # Print summary
    all_passed = tester.print_summary()
    
    print(f"\n⏰ Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
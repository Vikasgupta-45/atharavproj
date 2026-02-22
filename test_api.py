#!/usr/bin/env python
"""Automated test suite for AI Text Analysis Engine API."""

import requests
import json
import time
from typing import Dict, List, Tuple
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
API_ENDPOINT = f"{BASE_URL}/analyze"

# Test cases: (description, text, target_tone)
TEST_CASES: List[Tuple[str, str, str]] = [
    (
        "Casual Chat → Formal",
        "hey guys, this project is absolutely awesome and I'm super stoked!",
        "formal"
    ),
    (
        "Technical → Informal",
        "The implementation of the algorithm demonstrates exceptional performance metrics.",
        "informal"
    ),
    (
        "Emotional → Neutral",
        "I absolutely LOVE this amazing product! It's fantastic and wonderful!",
        "neutral"
    ),
    (
        "Neutral Default",
        "The quick brown fox jumps over the lazy dog.",
        "neutral"
    ),
    (
        "Long Formal Text",
        (
            "When we examine the technological advancement of recent decades, we observe "
            "that innovation has consistently catalyzed societal transformation. "
            "The proliferation of digital systems has fundamentally altered communication paradigms."
        ),
        "informal"
    ),
    (
        "Short Casual Text",
        "yo what's up",
        "formal"
    ),
    (
        "Business Email",
        "Thanks so much for your help buddy, really appreciate it!",
        "formal"
    ),
    (
        "Academic Paper",
        "The empirical results substantiate our hypothesis regarding the efficacy of this methodology.",
        "informal"
    ),
    (
        "Marketing Copy",
        "Our amazing product is the BEST thing ever created in the history of mankind!",
        "neutral"
    ),
    (
        "Mixed Tone Text",
        "Well, you see, the thing is, this is actually quite sophisticated and complex, innit?",
        "neutral"
    ),
]

class APITester:
    """Test suite for API endpoints."""
    
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.results = []
        self.errors = []
    
    def check_server(self) -> bool:
        """Check if server is running."""
        try:
            response = requests.get(f"{self.base_url}/docs", timeout=5)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False
    
    def test_analyze_endpoint(
        self, 
        text: str, 
        target_tone: str = "neutral"
    ) -> Dict:
        """Test the /analyze endpoint."""
        payload = {
            "text": text,
            "target_tone": target_tone
        }
        
        try:
            start_time = time.time()
            response = requests.post(
                f"{self.base_url}/analyze",
                json=payload,
                timeout=30
            )
            elapsed_time = time.time() - start_time
            
            response.raise_for_status()
            result = response.json()
            result["response_time"] = f"{elapsed_time:.2f}s"
            return result
            
        except requests.exceptions.Timeout:
            return {"error": "Request timeout"}
        except requests.exceptions.ConnectionError:
            return {"error": "Connection failed"}
        except requests.exceptions.HTTPError as e:
            return {"error": f"HTTP Error: {response.status_code}", "details": response.text}
        except Exception as e:
            return {"error": str(e)}
    
    def run_test(self, description: str, text: str, target_tone: str):
        """Run a single test case."""
        print(f"\n{'='*70}")
        print(f"TEST: {description}")
        print(f"{'='*70}")
        print(f"Input Text: {text[:100]}{'...' if len(text) > 100 else ''}")
        print(f"Target Tone: {target_tone}")
        print(f"{'-'*70}")
        
        result = self.test_analyze_endpoint(text, target_tone)
        
        if "error" in result:
            print(f"❌ ERROR: {result['error']}")
            self.errors.append({
                "description": description,
                "error": result.get("error"),
                "details": result.get("details")
            })
        else:
            print(f"✅ SUCCESS (Response Time: {result.get('response_time', 'N/A')})")
            print(f"\nRESULTS:")
            print(f"  • Consistency Score: {result.get('consistency_score', 'N/A'):.2f}")
            print(f"  • Readability Score: {result.get('readability_score', 'N/A'):.2f}")
            print(f"  • Detected Tone: {result.get('detected_tone', 'N/A')}")
            print(f"  • Number of Changes: {len(result.get('changes', []))}")
            
            if result.get('changes'):
                print(f"\n  CHANGES DETECTED:")
                for i, change in enumerate(result['changes'][:3], 1):
                    print(f"    {i}. [{change.get('type')}] '{change.get('before')}' → '{change.get('after')}'")
                if len(result['changes']) > 3:
                    print(f"    ... and {len(result['changes']) - 3} more changes")
            
            if result.get('explanation'):
                print(f"\n  EXPLANATION:")
                for i, line in enumerate(result['explanation'][:2], 1):
                    print(f"    {i}. {line[:80]}{'...' if len(line) > 80 else ''}")
                if len(result['explanation']) > 2:
                    print(f"    ... and {len(result['explanation']) - 2} more points")
            
            print(f"\n  MODIFIED TEXT PREVIEW:")
            modified = result.get('modified_text', '')
            preview = modified[:150] + ('...' if len(modified) > 150 else '')
            print(f"    \"{preview}\"")
            
            self.results.append({
                "description": description,
                "success": True,
                "response_time": result.get('response_time'),
                "consistency_score": result.get('consistency_score'),
                "readability_score": result.get('readability_score'),
            })
    
    def run_all_tests(self):
        """Run all test cases."""
        print("\n" + "="*70)
        print("API TESTING SUITE - AI Text Analysis Engine")
        print("="*70)
        
        # Check server
        print(f"\n🔍 Checking server connection at {self.base_url}...")
        if not self.check_server():
            print(f"❌ FAILED: Server is not responding at {self.base_url}")
            print(f"   Make sure to start the server with:")
            print(f"   python -m uvicorn ai_engine.main:app --reload --port 8000")
            return False
        
        print(f"✅ Server is running and responding")
        
        # Run tests
        for description, text, tone in TEST_CASES:
            self.run_test(description, text, tone)
        
        # Summary
        self.print_summary()
        return True
    
    def print_summary(self):
        """Print test summary."""
        print(f"\n\n{'='*70}")
        print("TEST SUMMARY")
        print(f"{'='*70}")
        
        total_tests = len(TEST_CASES)
        successful = len(self.results)
        failed = len(self.errors)
        
        print(f"\nTotal Tests: {total_tests}")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(successful/total_tests)*100:.1f}%")
        
        if self.results:
            print(f"\n--- Response Times ---")
            times = [r["response_time"] for r in self.results if r["response_time"]]
            if times:
                print(f"Fastest: {min(times)}")
                print(f"Slowest: {max(times)}")
            
            print(f"\n--- Average Scores ---")
            consistency_scores = [r["consistency_score"] for r in self.results if r["consistency_score"]]
            readability_scores = [r["readability_score"] for r in self.results if r["readability_score"]]
            
            if consistency_scores:
                avg_consistency = sum(consistency_scores) / len(consistency_scores)
                print(f"Avg Consistency Score: {avg_consistency:.2f}")
            
            if readability_scores:
                avg_readability = sum(readability_scores) / len(readability_scores)
                print(f"Avg Readability Score: {avg_readability:.2f}")
        
        if self.errors:
            print(f"\n--- Failed Tests ---")
            for error in self.errors:
                print(f"• {error['description']}: {error['error']}")
        
        print(f"\n{'='*70}")
        print("For interactive testing, visit: http://localhost:8000/docs")
        print(f"{'='*70}\n")


def test_error_cases():
    """Test error handling."""
    print("\n\n" + "="*70)
    print("ERROR HANDLING TESTS")
    print("="*70)
    
    error_cases = [
        ("Empty Text", {"text": "", "target_tone": "neutral"}),
        ("Missing Text Field", {"target_tone": "neutral"}),
        ("Invalid Tone", {"text": "Sample text", "target_tone": "sarcastic"}),
        ("Null Text", {"text": None, "target_tone": "neutral"}),
    ]
    
    for description, payload in error_cases:
        print(f"\nTesting: {description}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/analyze",
                json=payload,
                timeout=10
            )
            
            if response.status_code != 200:
                print(f"✅ Correctly returned error: {response.status_code}")
                error_detail = response.json()
                print(f"   Error Detail: {error_detail}")
            else:
                print(f"❌ Expected error but got success")
                
        except Exception as e:
            print(f"❌ Unexpected error: {e}")


if __name__ == "__main__":
    tester = APITester()
    
    # Run main tests
    if tester.run_all_tests():
        # Run error handling tests
        test_error_cases()
        
        # Save results
        results_file = Path(__file__).parent / "test_results.json"
        with open(results_file, "w") as f:
            json.dump({
                "successful_tests": tester.results,
                "failed_tests": tester.errors,
                "summary": {
                    "total": len(TEST_CASES),
                    "successful": len(tester.results),
                    "failed": len(tester.errors),
                }
            }, f, indent=2)
        print(f"\n📊 Results saved to: {results_file}")

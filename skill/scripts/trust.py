#!/usr/bin/env python3
"""
Agent Trust Python Client

Simple wrapper for checking trust scores via the EAS GraphQL API.
No dependencies required beyond standard library.

Usage:
    from trust import get_trust_score, get_trust_summary
    
    score = get_trust_score("0x1234...")
    print(f"Trust score: {score}")
"""

import json
import urllib.request
from typing import Dict, List, Optional, Any

# Base Sepolia configuration
GRAPHQL_ENDPOINT = "https://base-sepolia.easscan.org/graphql"
VOUCH_SCHEMA = "0x974ebae65dc7f066a2734b8a966f6bec08454426b401267460dcf6c949275e6c"
FLAG_SCHEMA = "0x07b4542b80819e67b4310d8a5a01ee81d8b23137287983b0d5ecacfe34364a47"
VERIFICATION_SCHEMA = "0xee0eab330a75940a9d73eaec95d71b12fd5d0a0b4fe0a5c46304052db0ef2849"


def _query_graphql(query: str, variables: Dict) -> Dict:
    """Execute GraphQL query against EAS."""
    data = json.dumps({"query": query, "variables": variables}).encode()
    req = urllib.request.Request(
        GRAPHQL_ENDPOINT,
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def fetch_attestations(address: str) -> Dict[str, List[Dict]]:
    """Fetch all attestations for an address."""
    # EAS is case-sensitive, query with checksum case
    query = """
    query GetAttestations($address: String!) {
      attestations(
        where: { recipient: { equals: $address } }
        orderBy: { time: desc }
        take: 100
      ) {
        id
        attester
        recipient
        time
        revoked
        decodedDataJson
        schemaId
      }
    }
    """
    
    result = _query_graphql(query, {"address": address})
    attestations = result.get("data", {}).get("attestations", [])
    
    vouches = []
    flags = []
    verifications = []
    
    for att in attestations:
        if att.get("revoked"):
            continue
            
        try:
            decoded = json.loads(att.get("decodedDataJson", "[]"))
            data_map = {d["name"]: d["value"]["value"] for d in decoded}
        except:
            continue
        
        schema = att.get("schemaId", "").lower()
        base = {
            "attester": att["attester"],
            "time": att["time"],
        }
        
        if schema == VOUCH_SCHEMA.lower():
            vouches.append({
                **base,
                "trustLevel": data_map.get("trustLevel", 0),
                "context": data_map.get("context", ""),
            })
        elif schema == FLAG_SCHEMA.lower():
            flags.append({
                **base,
                "severity": data_map.get("severity", 0),
                "reason": data_map.get("reason", ""),
            })
        elif schema == VERIFICATION_SCHEMA.lower():
            verifications.append({
                **base,
                "platform": data_map.get("platform", ""),
                "handle": data_map.get("handle", ""),
            })
    
    return {
        "vouches": vouches,
        "flags": flags,
        "verifications": verifications,
    }


def calculate_trust_score(
    vouches: List[Dict],
    flags: List[Dict],
    verifications: List[Dict]
) -> Dict[str, Any]:
    """Calculate trust score from attestations."""
    import math
    
    # Base score: 50 if verified
    is_verified = len(verifications) > 0
    base_score = 50 if is_verified else 0
    
    # Vouch bonus (max +40)
    vouch_bonus = 0
    if vouches:
        total_weighted = sum(v.get("trustLevel", 0) / 5 * 8 for v in vouches)
        avg = total_weighted / len(vouches)
        multiplier = math.log2(len(vouches) + 1)
        vouch_bonus = min(40, avg * multiplier)
    
    # Flag penalty (max -50)
    flag_penalty = 0
    if flags:
        total_penalty = sum(f.get("severity", 0) / 5 * 10 for f in flags)
        avg = total_penalty / len(flags)
        multiplier = min(len(flags), 5)
        flag_penalty = min(50, avg * multiplier)
    
    # Final score
    score = max(0, min(100, base_score + vouch_bonus - flag_penalty))
    
    # Confidence
    confidence = 0
    if is_verified:
        confidence += 0.4
    confidence += min(0.3, math.log2(len(vouches) + 1) * 0.1)
    confidence += min(0.2, 0.2 if vouches or flags else 0)
    
    return {
        "score": round(score, 1),
        "confidence": round(confidence, 2),
        "verified": is_verified,
        "vouches": len(vouches),
        "flags": len(flags),
        "platforms": [v["platform"] for v in verifications],
    }


def get_trust_score(address: str) -> float:
    """Get trust score for an address (0-100)."""
    attestations = fetch_attestations(address)
    result = calculate_trust_score(
        attestations["vouches"],
        attestations["flags"],
        attestations["verifications"]
    )
    return result["score"]


def get_trust_summary(address: str) -> Dict[str, Any]:
    """Get full trust summary for an address."""
    attestations = fetch_attestations(address)
    score_data = calculate_trust_score(
        attestations["vouches"],
        attestations["flags"],
        attestations["verifications"]
    )
    return {
        "address": address,
        **score_data,
        "vouches_detail": attestations["vouches"],
        "flags_detail": attestations["flags"],
        "verifications_detail": attestations["verifications"],
    }


def is_trustworthy(address: str, min_score: int = 30) -> bool:
    """Quick check if an agent meets minimum trust threshold."""
    return get_trust_score(address) >= min_score


# CLI interface
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python trust.py <address>")
        sys.exit(1)
    
    address = sys.argv[1]
    summary = get_trust_summary(address)
    
    print(f"\n🔍 Trust Score for {address[:10]}...\n")
    print(f"📊 Score: {summary['score']}/100")
    print(f"   Confidence: {int(summary['confidence'] * 100)}%")
    print(f"   Verified: {'✅' if summary['verified'] else '❌'}")
    print(f"   Vouches: {summary['vouches']}")
    print(f"   Flags: {summary['flags']}")
    
    if summary['vouches_detail']:
        print(f"\n👍 Recent vouches:")
        for v in summary['vouches_detail'][:3]:
            print(f"   • Level {v['trustLevel']}/5: {v['context'][:40]}...")
    
    if summary['flags_detail']:
        print(f"\n🚩 Flags:")
        for f in summary['flags_detail'][:3]:
            print(f"   • Severity {f['severity']}/5: {f['reason'][:40]}...")
    
    print()

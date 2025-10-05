#!/usr/bin/env python3
"""Test script to verify password truncation works correctly."""

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt, truncating to 72 bytes if necessary.
    Bcrypt has a 72-byte limit, so we need to truncate longer passwords.
    """
    # Encode to UTF-8 bytes
    password_bytes = password.encode('utf-8')
    
    # If password exceeds 72 bytes, truncate character by character
    # until we're under the limit to avoid cutting multi-byte characters
    while len(password_bytes) > 72:
        password = password[:-1]  # Remove last character
        password_bytes = password.encode('utf-8')
    
    return pwd_context.hash(password)

# Test with a normal password
print("Testing normal password...")
normal_pass = "Test123456"
try:
    hashed = get_password_hash(normal_pass)
    print(f"✓ Normal password hashed successfully")
    print(f"  Length: {len(normal_pass)} chars, {len(normal_pass.encode('utf-8'))} bytes")
except Exception as e:
    print(f"✗ Error: {e}")

# Test with a long password (>72 bytes)
print("\nTesting long password (>72 bytes)...")
long_pass = "a" * 100  # 100 characters, 100 bytes
try:
    hashed = get_password_hash(long_pass)
    print(f"✓ Long password hashed successfully")
    print(f"  Original: {len(long_pass)} chars, {len(long_pass.encode('utf-8'))} bytes")
    truncated_pass = long_pass
    truncated_bytes = truncated_pass.encode('utf-8')
    while len(truncated_bytes) > 72:
        truncated_pass = truncated_pass[:-1]
        truncated_bytes = truncated_pass.encode('utf-8')
    print(f"  Truncated to: {len(truncated_pass)} chars, {len(truncated_bytes)} bytes")
except Exception as e:
    print(f"✗ Error: {e}")

# Test with UTF-8 multi-byte characters
print("\nTesting password with multi-byte UTF-8 characters...")
utf8_pass = "密码" * 20  # Chinese characters, each is 3 bytes in UTF-8
try:
    hashed = get_password_hash(utf8_pass)
    print(f"✓ UTF-8 password hashed successfully")
    print(f"  Original: {len(utf8_pass)} chars, {len(utf8_pass.encode('utf-8'))} bytes")
    truncated_pass = utf8_pass
    truncated_bytes = truncated_pass.encode('utf-8')
    while len(truncated_bytes) > 72:
        truncated_pass = truncated_pass[:-1]
        truncated_bytes = truncated_pass.encode('utf-8')
    print(f"  Truncated to: {len(truncated_pass)} chars, {len(truncated_bytes)} bytes")
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "="*50)
print("All tests completed!")
print("="*50)

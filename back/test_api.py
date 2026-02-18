#!/usr/bin/env python3
"""Test simple de l'API FastAPI"""
import asyncio
from app.controllers import match as match_controller

async def test():
    print("Testing match controller imports...")
    try:
        # Test des imports
        print("✓ Match controller imported successfully")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(test())
    exit(0 if result else 1)

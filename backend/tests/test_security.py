from app.core.security import create_access_token, decode_token, get_password_hash, verify_password


def test_password_hash_roundtrip() -> None:
    hashed = get_password_hash("demo-pass")
    assert verify_password("demo-pass", hashed)
    assert not verify_password("wrong-pass", hashed)


def test_token_encode_decode() -> None:
    token = create_access_token(subject="admin", extra_claims={"role": "admin"})
    payload = decode_token(token)
    assert payload["sub"] == "admin"
    assert payload["role"] == "admin"

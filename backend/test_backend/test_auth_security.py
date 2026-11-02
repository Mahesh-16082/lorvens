import os
import sys
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
import uuid

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sqlalchemy import select, delete

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import create_access_token, decode_access_token
from app.main import app
from app.models.email_otp import EmailOTP
from app.models.revoked_token import RevokedToken
from app.models.user import User
from app.services.admin_service import ensure_admin_account
from app.services.otp_service import hash_otp, verify_otp_hash, generate_otp
from app.services.token_service import is_token_revoked, revoke_token


class TestLorvensAuthenticationSecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        db = SessionLocal()
        try:
            cls.admin = ensure_admin_account(db)
            cls.admin_id = cls.admin.id
            cls.admin_email = cls.admin.email
        finally:
            db.close()

    def setUp(self):
        # Clean up OTP and revoked tokens for this admin before each test
        self.db = SessionLocal()
        self.db.execute(
            delete(EmailOTP).where(EmailOTP.user_id == self.admin_id)
        )
        self.db.execute(
            delete(RevokedToken).where(RevokedToken.user_id == self.admin_id)
        )
        # Ensure admin is active and email verified
        admin = self.db.scalar(select(User).where(User.id == self.admin_id))
        admin.is_active = True
        admin.is_email_verified = True
        admin.role = "admin"
        self.db.commit()

    def tearDown(self):
        self.db.close()

    # ==================== Task 1 & 3: OTP Tests ====================

    def test_otp_crypto_generation_and_hashing(self):
        """Verify secure OTP generation and HMAC-SHA256 hashing."""
        otp = generate_otp()
        self.assertEqual(len(otp), settings.OTP_LENGTH)
        self.assertTrue(otp.isdigit())

        stored_hash = hash_otp(otp)
        self.assertTrue(verify_otp_hash(otp, stored_hash))
        self.assertFalse(verify_otp_hash("000000" if otp != "000000" else "111111", stored_hash))

    @patch("app.routers.auth.send_otp_email")
    def test_send_otp_unauthorized_email(self, mock_send_email):
        """Unauthorized email must be rejected with 403."""
        response = self.client.post(
            "/api/v1/auth/send-otp",
            json={"email": "intruder@malicious.com"},
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("This email is not authorized", response.json()["detail"])
        mock_send_email.assert_not_called()

    @patch("app.routers.auth.send_otp_email")
    def test_send_otp_inactive_admin(self, mock_send_email):
        """Inactive admin email must be rejected with 403."""
        admin = self.db.scalar(select(User).where(User.id == self.admin_id))
        admin.is_active = False
        self.db.commit()

        response = self.client.post(
            "/api/v1/auth/send-otp",
            json={"email": self.admin_email},
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["detail"], "Admin account is inactive.")

    @patch("app.routers.auth.send_otp_email")
    def test_send_otp_cooldown_enforcement(self, mock_send_email):
        """Requesting OTP twice within cooldown must return 429."""
        # 1st request succeeds
        res1 = self.client.post(
            "/api/v1/auth/send-otp",
            json={"email": self.admin_email},
        )
        self.assertEqual(res1.status_code, 200)

        # 2nd immediate request triggers cooldown
        res2 = self.client.post(
            "/api/v1/auth/send-otp",
            json={"email": self.admin_email},
        )
        self.assertEqual(res2.status_code, 429)
        self.assertIn("Please wait", res2.json()["detail"])

    @patch("app.routers.auth.send_otp_email")
    def test_send_otp_hourly_limit(self, mock_send_email):
        """Exceeding max OTP requests per hour returns 429."""
        now = datetime.now(timezone.utc)
        # Create OTP_MAX_REQUESTS_PER_HOUR records in the past 30 mins
        for i in range(settings.OTP_MAX_REQUESTS_PER_HOUR):
            record = EmailOTP(
                user_id=self.admin_id,
                otp_hash=hash_otp(f"12345{i}"),
                expires_at=now + timedelta(minutes=5),
                created_at=now - timedelta(minutes=50 - (i * 8)),
                consumed_at=now - timedelta(minutes=49 - (i * 8)),
            )
            self.db.add(record)
        self.db.commit()

        # The next request exceeds hourly limit
        response = self.client.post(
            "/api/v1/auth/send-otp",
            json={"email": self.admin_email},
        )
        self.assertEqual(response.status_code, 429)
        self.assertIn("OTP request limit reached", response.json()["detail"])

    @patch("app.routers.auth.send_otp_email")
    def test_send_otp_invalidates_previous_otps(self, mock_send_email):
        """Generating a new OTP invalidates all previous unconsumed OTPs."""
        # Insert previous unconsumed OTP
        old_record = EmailOTP(
            user_id=self.admin_id,
            otp_hash=hash_otp("111111"),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
            created_at=datetime.now(timezone.utc) - timedelta(seconds=120),
            attempts=0,
        )
        self.db.add(old_record)
        self.db.commit()

        # Request new OTP
        res = self.client.post(
            "/api/v1/auth/send-otp",
            json={"email": self.admin_email},
        )
        self.assertEqual(res.status_code, 200)

        # Verify old record is now consumed
        self.db.refresh(old_record)
        self.assertIsNotNone(old_record.consumed_at)

    def test_verify_otp_invalid_code(self):
        """Submitting wrong OTP returns 400."""
        # Seed an OTP
        otp_record = EmailOTP(
            user_id=self.admin_id,
            otp_hash=hash_otp("654321"),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
            attempts=0,
        )
        self.db.add(otp_record)
        self.db.commit()

        res = self.client.post(
            "/api/v1/auth/verify-otp",
            json={"email": self.admin_email, "otp": "999999"},
        )
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()["detail"], "Invalid OTP.")

        # Check attempts count was incremented
        self.db.refresh(otp_record)
        self.assertEqual(otp_record.attempts, 1)

    def test_verify_otp_max_attempts_exceeded(self):
        """Submitting wrong OTP settings.OTP_MAX_ATTEMPTS times returns 400."""
        otp_record = EmailOTP(
            user_id=self.admin_id,
            otp_hash=hash_otp("654321"),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
            attempts=settings.OTP_MAX_ATTEMPTS - 1,
        )
        self.db.add(otp_record)
        self.db.commit()

        # Final incorrect attempt
        res = self.client.post(
            "/api/v1/auth/verify-otp",
            json={"email": self.admin_email, "otp": "000000"},
        )
        self.assertEqual(res.status_code, 400)
        self.assertEqual(
            res.json()["detail"],
            "Maximum OTP verification attempts exceeded.",
        )

        self.db.refresh(otp_record)
        self.assertIsNotNone(otp_record.consumed_at)

    def test_verify_otp_expired(self):
        """Submitting expired OTP returns 400."""
        otp_record = EmailOTP(
            user_id=self.admin_id,
            otp_hash=hash_otp("654321"),
            expires_at=datetime.now(timezone.utc) - timedelta(seconds=10),
            attempts=0,
        )
        self.db.add(otp_record)
        self.db.commit()

        res = self.client.post(
            "/api/v1/auth/verify-otp",
            json={"email": self.admin_email, "otp": "654321"},
        )
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json()["detail"], "OTP has expired.")

    def test_verify_otp_success_and_single_use(self):
        """Valid OTP generates JWT and cannot be reused."""
        otp_record = EmailOTP(
            user_id=self.admin_id,
            otp_hash=hash_otp("778899"),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
            attempts=0,
        )
        self.db.add(otp_record)
        self.db.commit()

        # First verification succeeds
        res = self.client.post(
            "/api/v1/auth/verify-otp",
            json={"email": self.admin_email, "otp": "778899"},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")

        # Second verification with same OTP fails (single use)
        res_repeat = self.client.post(
            "/api/v1/auth/verify-otp",
            json={"email": self.admin_email, "otp": "778899"},
        )
        self.assertEqual(res_repeat.status_code, 400)
        self.assertEqual(res_repeat.json()["detail"], "Invalid or expired OTP.")

    # ==================== Task 2 & 4: JWT & Logout Tests ====================

    def test_jwt_claims_structure(self):
        """Verify token contains sub, iat, exp, jti, and type claims."""
        token = create_access_token(subject=str(self.admin_id))
        payload = decode_access_token(token)

        self.assertEqual(payload["sub"], str(self.admin_id))
        self.assertEqual(payload["type"], "access")
        self.assertIn("iat", payload)
        self.assertIn("exp", payload)
        self.assertIn("jti", payload)
        # Verify jti is a valid UUID string
        uuid.UUID(payload["jti"])

    def test_protected_dashboard_requires_authentication(self):
        """Access without token returns 401."""
        res = self.client.get("/api/v1/admin/dashboard")
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.json()["detail"], "Authentication required.")

    def test_protected_dashboard_invalid_token(self):
        """Access with malformed token returns 401."""
        res = self.client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": "Bearer invalid.token.value"},
        )
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.json()["detail"], "Invalid access token.")

    def test_protected_dashboard_expired_token(self):
        """Access with expired token returns 401."""
        token = create_access_token(
            subject=str(self.admin_id),
            expires_delta=timedelta(seconds=-10),
        )
        res = self.client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.json()["detail"], "Access token has expired.")

    def test_secure_logout_and_revocation(self):
        """POST /auth/logout revokes token; subsequent requests are rejected."""
        token = create_access_token(subject=str(self.admin_id))
        payload = decode_access_token(token)
        jti = payload["jti"]

        # Token allows dashboard access initially
        res_before = self.client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res_before.status_code, 200)

        # Call logout
        res_logout = self.client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res_logout.status_code, 200)
        self.assertEqual(res_logout.json()["message"], "Logged out successfully.")

        # Check that token identifier jti is stored as revoked
        self.assertTrue(is_token_revoked(self.db, jti))

        # Subsequent dashboard access is rejected
        res_after = self.client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res_after.status_code, 401)
        self.assertEqual(res_after.json()["detail"], "Token has been revoked.")

        # Subsequent logout with same token is also rejected
        res_logout_again = self.client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res_logout_again.status_code, 401)
        self.assertEqual(res_logout_again.json()["detail"], "Token has been revoked.")

    def test_expired_token_does_not_create_unnecessary_db_record(self):
        """Revoking an already expired token does not write to the database."""
        past_time = datetime.now(timezone.utc) - timedelta(minutes=10)
        result = revoke_token(
            db=self.db,
            jti="test-expired-jti-not-stored",
            user_id=self.admin_id,
            expires_at=past_time,
        )
        self.assertFalse(result)
        self.assertFalse(is_token_revoked(self.db, "test-expired-jti-not-stored"))


if __name__ == "__main__":
    unittest.main()

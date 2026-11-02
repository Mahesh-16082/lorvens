import os
import sys
import threading
import unittest
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import delete, select
from app.core.database import SessionLocal
from app.models.email_otp import EmailOTP
from app.models.user import User
from app.services.admin_service import ensure_admin_account
from app.services.otp_service import create_otp, verify_otp, OTPCooldownError, OTPError


class TestOTPConcurrency(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db = SessionLocal()
        try:
            cls.admin = ensure_admin_account(db)
            cls.admin_id = cls.admin.id
        finally:
            db.close()

    def setUp(self):
        db = SessionLocal()
        try:
            db.execute(delete(EmailOTP).where(EmailOTP.user_id == self.admin_id))
            db.commit()
        finally:
            db.close()

    def test_concurrent_create_otp_prevents_simultaneous_active_otps(self):
        """
        Verify that when 5 threads attempt to create an OTP simultaneously:
        - Only 1 succeeds.
        - The other 4 are blocked by the row lock and rejected by cooldown (429/OTPCooldownError).
        - Exactly 1 unconsumed active OTP exists in the database.
        """
        results = []
        errors = []
        barrier = threading.Barrier(5)

        def worker():
            db = SessionLocal()
            try:
                barrier.wait()  # synchronize all threads to fire simultaneously
                record, otp = create_otp(db, self.admin_id)
                results.append((record.id, otp))
            except OTPCooldownError as exc:
                errors.append(exc)
            except Exception as e:
                errors.append(e)
            finally:
                db.close()

        threads = [threading.Thread(target=worker) for _ in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        # Exactly 1 thread must have succeeded; the others blocked and caught cooldown
        self.assertEqual(len(results), 1, f"Expected exactly 1 success, got {len(results)}")
        self.assertEqual(len(errors), 4, f"Expected 4 cooldown errors, got {len(errors)}")

        # Verify only 1 active unconsumed OTP exists in the database
        db = SessionLocal()
        try:
            active_otps = db.scalars(
                select(EmailOTP).where(
                    EmailOTP.user_id == self.admin_id,
                    EmailOTP.consumed_at.is_(None),
                )
            ).all()
            self.assertEqual(len(active_otps), 1)
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()

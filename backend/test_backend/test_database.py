
import unittest

from sqlalchemy import text
from app.core.database import engine


class TestDatabaseConnection(unittest.TestCase):

    def test_postgresql_connection(self):
        """Verify PostgreSQL database connectivity."""

        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar()

        self.assertEqual(result, 1)


if __name__ == "__main__":
    unittest.main()

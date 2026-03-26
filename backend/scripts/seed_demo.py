from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.core.config import get_settings
from app.db.base import Base


def sqlite_db_path(database_url: str) -> Path:
    prefix = "sqlite:///./"
    if database_url.startswith(prefix):
        return ROOT / database_url.removeprefix(prefix)
    return ROOT / "fleet_demo_local.db"


if __name__ == "__main__":
    settings = get_settings()
    if settings.is_sqlite:
        db_path = sqlite_db_path(settings.database_url)
        if db_path.exists():
            db_path.unlink()

    from app.db.session import SessionLocal, engine
    from app.services.seed_service import seed_demo_data

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_data(db, reset=True)
        print("Seeded demo data successfully.")
        print("Users: admin / dispatcher / mechanic / viewer")
        print("Passwords: Admin123! / Dispatch123! / Mechanic123! / Viewer123!")
    finally:
        db.close()

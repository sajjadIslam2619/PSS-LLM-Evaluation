"""
Create invite links. Only participants who log in through one of these links can
receive the thank-you (gift card) email.

Run on the server (or anywhere with the same SECRET_KEY and COMMON_PASSWORD in .env);
links made with a different SECRET_KEY won't be accepted.

Usage (from PSS-FastAPI-Backend):
    python scripts/make_invite_links.py --email jane@example.com --role Veteran
    python scripts/make_invite_links.py --csv participants.csv
        participants.csv has the columns email,role; writes participants_links.csv
Options:
    --no-password       leave the shared password out of the link
    --app-url URL       frontend address (default: the GitHub Pages site)
"""
import argparse
import csv
import sys
from pathlib import Path
from typing import get_args

START_DIR = Path.cwd()

import _common  # noqa: E402,F401  (sets up imports and the working directory)
from config import get_settings  # noqa: E402
from invites import DEFAULT_APP_URL, invite_link  # noqa: E402
from schemas.user import UserRole  # noqa: E402

ROLES = get_args(UserRole)


def normalize_role(role: str) -> str:
    match = next((r for r in ROLES if r.lower() == role.strip().lower()), None)
    if match is None:
        sys.exit(f"Unknown role {role!r}. Use one of: {', '.join(ROLES)}")
    return match


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--email")
    parser.add_argument("--role")
    parser.add_argument("--csv", type=Path, help="CSV file with columns email,role")
    parser.add_argument("--no-password", action="store_true")
    parser.add_argument("--app-url", default=DEFAULT_APP_URL)
    args = parser.parse_args()

    settings = get_settings()
    if settings.SECRET_KEY == "dev-secret-change-in-production":
        print("Warning: SECRET_KEY is the development default; set it in .env first.", file=sys.stderr)
    if not args.no_password and not settings.COMMON_PASSWORD:
        sys.exit("COMMON_PASSWORD is not set; set it in .env or use --no-password.")
    include_password = not args.no_password

    if args.csv:
        csv_path = (START_DIR / args.csv).resolve()
        out_path = csv_path.with_name(f"{csv_path.stem}_links.csv")
        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            rows = list(csv.DictReader(f))
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["email", "role", "link"])
            for row in rows:
                email, role = row["email"].strip(), normalize_role(row["role"])
                writer.writerow([email, role, invite_link(email, role, args.app_url, include_password)])
        print(f"Wrote {len(rows)} links to {out_path}")
    elif args.email and args.role:
        print(invite_link(args.email, normalize_role(args.role), args.app_url, include_password))
    else:
        parser.error("give --email and --role, or --csv")


if __name__ == "__main__":
    main()

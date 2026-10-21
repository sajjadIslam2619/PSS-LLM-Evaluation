"""
Summarize study progress: rows per table, participants by role, and how many
participants evaluated every Reddit post and submitted feedback.

Read-only; safe to run while the backend is running.

Usage (from PSS-FastAPI-Backend):
    python scripts/db_stats.py                 # summary
    python scripts/db_stats.py --participants  # also one line per participant
"""
import argparse
import json
from collections import Counter, defaultdict

from sqlalchemy import func, select

from _common import BACKEND_DIR, MODELS, describe_database
from database import SyncSessionLocal
from models.create_own_post_response import CreateOwnPostResponse
from models.user_feedback import UserFeedback
from models.user_response import UserResponse


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--participants", action="store_true", help="list each participant's progress")
    args = parser.parse_args()

    posts = json.loads((BACKEND_DIR / "data" / "redditPosts.json").read_text(encoding="utf-8"))
    post_ids = {post["id"] for post in posts}

    print(f"Database: {describe_database()}\n")
    with SyncSessionLocal() as session:
        print("Rows per table")
        for model in MODELS:
            total = session.scalar(select(func.count()).select_from(model))
            no_role = session.scalar(select(func.count()).select_from(model).where(model.role.is_(None)))
            print(f"  {model.__tablename__:28} {total:5}   (without role: {no_role})")

        reddit = defaultdict(set)
        roles = {}
        for user, article_id, role in session.execute(
            select(UserResponse.user_identifier, UserResponse.article_id, UserResponse.role)
        ):
            reddit[user].add(article_id)
            roles[user] = role or roles.get(user)

        own_posts = Counter()
        for user, role in session.execute(select(CreateOwnPostResponse.user_identifier, CreateOwnPostResponse.role)):
            own_posts[user] += 1
            roles[user] = role or roles.get(user)

        feedback = set()
        for user, role in session.execute(select(UserFeedback.user_identifier, UserFeedback.role)):
            feedback.add(user)
            roles[user] = role or roles.get(user)

    participants = sorted(roles)
    completed = [u for u in participants if post_ids <= reddit[u]]

    print(f"\nParticipants: {len(participants)}")
    for role, count in Counter(roles[u] or "(no role)" for u in participants).most_common():
        print(f"  {role:28} {count}")

    print("\nProgress")
    print(f"  Evaluated all {len(post_ids)} Reddit posts   {len(completed)}")
    print(f"  Created at least one post     {sum(1 for u in participants if own_posts[u])}")
    print(f"  Submitted feedback            {len(feedback)}")

    if args.participants:
        print(f"\n{'participant':30} {'role':26} {'reddit':>7} {'own':>4} {'feedback':>9}")
        for user in participants:
            done = len(reddit[user] & post_ids)
            print(
                f"{user[:30]:30} {(roles[user] or '-')[:26]:26} "
                f"{done:>3}/{len(post_ids):<3} {own_posts[user]:>4} {'yes' if user in feedback else 'no':>9}"
            )


if __name__ == "__main__":
    main()

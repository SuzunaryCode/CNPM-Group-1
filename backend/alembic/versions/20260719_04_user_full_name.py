"""Add User.full_name (display name, nullable for existing accounts)."""

from alembic import op
import sqlalchemy as sa

revision = "20260719_04"
down_revision = "20260718_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("full_name", sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("full_name")

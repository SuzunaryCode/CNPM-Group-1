"""Add company_name, assigned_to_user_id, and expires_at."""

from alembic import op
import sqlalchemy as sa

revision = "20260804_05"
down_revision = "20260719_04"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # SQLite does not support ALTER TABLE ADD CONSTRAINT for foreign keys directly,
    # so we use batch_alter_table.
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("company_name", sa.String(), nullable=True))
        
    with op.batch_alter_table("license_keys") as batch_op:
        batch_op.add_column(sa.Column("assigned_to_user_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("expires_at", sa.DateTime(), nullable=True))
        batch_op.create_foreign_key(
            "fk_license_keys_assigned_to_user_id",
            "users",
            ["assigned_to_user_id"],
            ["id"]
        )


def downgrade() -> None:
    with op.batch_alter_table("license_keys") as batch_op:
        batch_op.drop_constraint("fk_license_keys_assigned_to_user_id", type_="foreignkey")
        batch_op.drop_column("expires_at")
        batch_op.drop_column("assigned_to_user_id")
    
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("company_name")

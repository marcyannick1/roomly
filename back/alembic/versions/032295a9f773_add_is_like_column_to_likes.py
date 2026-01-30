"""add_is_like_column_to_likes

Revision ID: 032295a9f773
Revises: 4c2e5470802b
Create Date: 2026-01-30 12:02:23.557419

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '032295a9f773'
down_revision: Union[str, Sequence[str], None] = '4f2f9f86a3bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Ajouter la colonne is_like (True = like, False = dislike, None = ni like ni dislike)
    op.add_column('likes', sa.Column('is_like', sa.Boolean(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Supprimer la colonne is_like
    op.drop_column('likes', 'is_like')

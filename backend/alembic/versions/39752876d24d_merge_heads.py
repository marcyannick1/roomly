"""merge heads

Revision ID: 39752876d24d
Revises: 887566960987, add_avatar_url
Create Date: 2026-02-25 10:10:04.588358

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '39752876d24d'
down_revision: Union[str, Sequence[str], None] = ('887566960987', 'add_avatar_url')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

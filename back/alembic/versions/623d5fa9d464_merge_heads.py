"""merge_heads

Revision ID: 623d5fa9d464
Revises: 032295a9f773, 4c2e5470802b
Create Date: 2026-01-30 12:03:48.968898

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '623d5fa9d464'
down_revision: Union[str, Sequence[str], None] = ('032295a9f773', '4c2e5470802b')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

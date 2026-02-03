"""add_notifications_table

Revision ID: a1b2c3d4e5f6
Revises: 623d5fa9d464
Create Date: 2026-02-03 16:50:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '623d5fa9d464'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('notifications',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('type', sa.String(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('message', sa.Text(), nullable=False),
    sa.Column('listing_id', sa.Integer(), nullable=True),
    sa.Column('landlord_id', sa.Integer(), nullable=True),
    sa.Column('is_read', sa.Boolean(), nullable=True, server_default='false'),
    sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
    sa.ForeignKeyConstraint(['landlord_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['listing_id'], ['listings.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_table('notifications')

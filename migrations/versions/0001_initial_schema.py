"""initial schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-05-06
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE TYPE user_role AS ENUM ('admin','manager','resident')")
    op.execute("CREATE TYPE invoice_status AS ENUM ('draft','issued','partial','paid','overdue','void')")
    op.execute("CREATE TYPE payment_method AS ENUM ('cash','card','ach','wire','check')")
    op.execute("CREATE TYPE dispute_status AS ENUM ('open','under_review','resolved','rejected')")
    op.execute("CREATE TYPE notification_channel AS ENUM ('email','sms','in_app')")
    op.execute("CREATE TYPE job_status AS ENUM ('queued','running','completed','failed')")
    op.execute("CREATE TYPE export_job_status AS ENUM ('queued','running','completed','failed')")

    op.create_table('users',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('role', sa.Enum(name='user_role', create_type=False), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('last_login_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table('residents',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('user_id', sa.BigInteger(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('unit_number', sa.String(50), nullable=False),
        sa.Column('lease_start_date', sa.Date()),
        sa.Column('lease_end_date', sa.Date()),
        sa.Column('phone', sa.String(25)),
        sa.Column('emergency_contact_name', sa.String(255)),
        sa.Column('emergency_contact_phone', sa.String(25)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table('invoices',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('resident_id', sa.BigInteger(), sa.ForeignKey('residents.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('invoice_number', sa.String(50), nullable=False, unique=True),
        sa.Column('issue_date', sa.Date(), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=False),
        sa.Column('subtotal', sa.Numeric(12,2), nullable=False),
        sa.Column('tax_amount', sa.Numeric(12,2), nullable=False, server_default='0.00'),
        sa.Column('total_amount', sa.Numeric(12,2), nullable=False),
        sa.Column('balance_due', sa.Numeric(12,2), nullable=False),
        sa.Column('status', sa.Enum(name='invoice_status', create_type=False), nullable=False),
        sa.Column('notes', sa.Text()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_invoices_resident_status_due', 'invoices', ['resident_id','status','due_date'])

    op.create_table('invoice_items',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('invoice_id', sa.BigInteger(), sa.ForeignKey('invoices.id', ondelete='CASCADE'), nullable=False),
        sa.Column('description', sa.String(255), nullable=False),
        sa.Column('quantity', sa.Numeric(10,2), nullable=False, server_default='1.00'),
        sa.Column('unit_price', sa.Numeric(12,2), nullable=False),
        sa.Column('line_total', sa.Numeric(12,2), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_invoice_items_invoice', 'invoice_items', ['invoice_id'])

    op.create_table('payments',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('invoice_id', sa.BigInteger(), sa.ForeignKey('invoices.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('resident_id', sa.BigInteger(), sa.ForeignKey('residents.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('amount', sa.Numeric(12,2), nullable=False),
        sa.Column('method', sa.Enum(name='payment_method', create_type=False), nullable=False),
        sa.Column('paid_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('transaction_reference', sa.String(100)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_payments_invoice_paid', 'payments', ['invoice_id','paid_at'])

    op.create_table('receipts',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('payment_id', sa.BigInteger(), sa.ForeignKey('payments.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('receipt_number', sa.String(50), nullable=False, unique=True),
        sa.Column('issued_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('document_url', sa.String(500)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table('disputes',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('invoice_id', sa.BigInteger(), sa.ForeignKey('invoices.id', ondelete='CASCADE'), nullable=False),
        sa.Column('resident_id', sa.BigInteger(), sa.ForeignKey('residents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('opened_by_user_id', sa.BigInteger(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('status', sa.Enum(name='dispute_status', create_type=False), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table('notifications',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('user_id', sa.BigInteger(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('channel', sa.Enum(name='notification_channel', create_type=False), nullable=False),
        sa.Column('subject', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('sent_at', sa.DateTime(timezone=True)),
        sa.Column('read_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table('audit_logs',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('user_id', sa.BigInteger(), sa.ForeignKey('users.id', ondelete='SET NULL')),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('entity_type', sa.String(100), nullable=False),
        sa.Column('entity_id', sa.BigInteger()),
        sa.Column('metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_audit_logs_entity', 'audit_logs', ['entity_type','entity_id'])

    op.create_table('system_settings',
        sa.Column('key', sa.String(100), primary_key=True),
        sa.Column('value', sa.JSON(), nullable=False),
        sa.Column('description', sa.String(255)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table('announcements',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('starts_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ends_at', sa.DateTime(timezone=True)),
        sa.Column('created_by_user_id', sa.BigInteger(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table('import_jobs',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('requested_by_user_id', sa.BigInteger(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('source_filename', sa.String(255), nullable=False),
        sa.Column('status', sa.Enum(name='job_status', create_type=False), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True)),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
        sa.Column('total_rows', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('success_rows', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('failed_rows', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table('import_job_errors',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('import_job_id', sa.BigInteger(), sa.ForeignKey('import_jobs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('row_number', sa.Integer(), nullable=False),
        sa.Column('field_name', sa.String(100)),
        sa.Column('error_message', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_import_job_errors_job_row', 'import_job_errors', ['import_job_id','row_number'])

    op.create_table('exports',
        sa.Column('id', sa.BigInteger(), primary_key=True),
        sa.Column('requested_by_user_id', sa.BigInteger(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('export_type', sa.String(100), nullable=False),
        sa.Column('filters', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('status', sa.Enum(name='export_job_status', create_type=False), nullable=False),
        sa.Column('file_url', sa.String(500)),
        sa.Column('started_at', sa.DateTime(timezone=True)),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    for t in ['exports','import_job_errors','import_jobs','announcements','system_settings','audit_logs','notifications','disputes','receipts','payments','invoice_items','invoices','residents','users']:
        op.drop_table(t)
    op.execute('DROP TYPE IF EXISTS export_job_status')
    op.execute('DROP TYPE IF EXISTS job_status')
    op.execute('DROP TYPE IF EXISTS notification_channel')
    op.execute('DROP TYPE IF EXISTS dispute_status')
    op.execute('DROP TYPE IF EXISTS payment_method')
    op.execute('DROP TYPE IF EXISTS invoice_status')
    op.execute('DROP TYPE IF EXISTS user_role')

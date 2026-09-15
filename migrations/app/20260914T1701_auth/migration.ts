#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/da533e8b1c39f681f70385317c769853daee9bedf0ff908c4da8813b1fa4f174/contract';
import endContract from '../../snapshots/da533e8b1c39f681f70385317c769853daee9bedf0ff908c4da8813b1fa4f174/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'ai_detected_items',
        columns: [
          col('confidence_score', 'float8', {
            notNull: true,
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('detected_component', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('scan_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ai_reviews',
        columns: [
          col('comments', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('decision', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('reviewer_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('scan_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ai_scans',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('image_url', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('loan_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'audit_logs',
        columns: [
          col('action', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('details', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ip_address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('resource', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('user_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'component_categories',
        columns: [
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'components',
        columns: [
          col('available_quantity', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('category_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('identifier', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('total_quantity', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'dispute_evidences',
        columns: [
          col('dispute_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('file_url', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('uploaded_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'disputes',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('loan_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'inventory_transactions',
        columns: [
          col('component_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('quantity_change', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('reference_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('transaction_type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'kit_components',
        columns: [
          col('component_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('kit_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('quantity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['kit_id', 'component_id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'kits',
        columns: [
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('kit_code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'loan_items',
        columns: [
          col('component_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('loan_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('quantity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'loan_status_histories',
        columns: [
          col('changed_by', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('loan_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'loans',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('due_date', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('failed_attempts', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('is_active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('loan_code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('locked_until', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'notifications',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('is_read', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('message', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'qr_codes',
        columns: [
          col('code', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('entity_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('entity_type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'roles',
        columns: [
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'system_configs',
        columns: [
          col('failed_attempts', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('is_active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('locked_until', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('value', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'user_roles',
        columns: [
          col('role_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['user_id', 'role_id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('failed_attempts', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('full_name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('is_active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('locked_until', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('password_hash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('student_code', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('username', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'component_categories',
        constraint: 'component_categories_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'components',
        constraint: 'components_identifier_key',
        columns: ['identifier'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'kits',
        constraint: 'kits_kit_code_key',
        columns: ['kit_code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'loans',
        constraint: 'loans_loan_code_key',
        columns: ['loan_code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'qr_codes',
        constraint: 'qr_codes_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'roles',
        constraint: 'roles_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'system_configs',
        constraint: 'system_configs_key_key',
        columns: ['key'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_username_key',
        columns: ['username'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_student_code_key',
        columns: ['student_code'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ai_detected_items',
        index: 'ai_detected_items_scan_id_idx_e600160e',
        columns: ['scan_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ai_reviews',
        index: 'ai_reviews_reviewer_id_idx_ab069db0',
        columns: ['reviewer_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ai_reviews',
        index: 'ai_reviews_scan_id_idx_e600160e',
        columns: ['scan_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ai_scans',
        index: 'ai_scans_loan_id_idx_cf51812a',
        columns: ['loan_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'audit_logs',
        index: 'audit_logs_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'components',
        index: 'components_category_id_idx_da7213d4',
        columns: ['category_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'dispute_evidences',
        index: 'dispute_evidences_dispute_id_idx_25febdb0',
        columns: ['dispute_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'disputes',
        index: 'disputes_loan_id_idx_cf51812a',
        columns: ['loan_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'disputes',
        index: 'disputes_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'inventory_transactions',
        index: 'inventory_transactions_component_id_idx_ebd7854e',
        columns: ['component_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'kit_components',
        index: 'kit_components_component_id_idx_ebd7854e',
        columns: ['component_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'kit_components',
        index: 'kit_components_kit_id_idx_cef86e26',
        columns: ['kit_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'loan_items',
        index: 'loan_items_component_id_idx_ebd7854e',
        columns: ['component_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'loan_items',
        index: 'loan_items_loan_id_idx_cf51812a',
        columns: ['loan_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'loan_status_histories',
        index: 'loan_status_histories_changed_by_idx_eac6b555',
        columns: ['changed_by'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'loan_status_histories',
        index: 'loan_status_histories_loan_id_idx_cf51812a',
        columns: ['loan_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'loans',
        index: 'loans_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'notifications',
        index: 'notifications_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'user_roles',
        index: 'user_roles_role_id_idx_d9467c50',
        columns: ['role_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'user_roles',
        index: 'user_roles_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ai_detected_items',
        foreignKey: {
          name: 'ai_detected_items_scan_id_fkey',
          columns: ['scan_id'],
          references: { schema: 'public', table: 'ai_scans', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ai_reviews',
        foreignKey: {
          name: 'ai_reviews_scan_id_fkey',
          columns: ['scan_id'],
          references: { schema: 'public', table: 'ai_scans', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ai_reviews',
        foreignKey: {
          name: 'ai_reviews_reviewer_id_fkey',
          columns: ['reviewer_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ai_scans',
        foreignKey: {
          name: 'ai_scans_loan_id_fkey',
          columns: ['loan_id'],
          references: { schema: 'public', table: 'loans', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'audit_logs',
        foreignKey: {
          name: 'audit_logs_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'components',
        foreignKey: {
          name: 'components_category_id_fkey',
          columns: ['category_id'],
          references: { schema: 'public', table: 'component_categories', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'dispute_evidences',
        foreignKey: {
          name: 'dispute_evidences_dispute_id_fkey',
          columns: ['dispute_id'],
          references: { schema: 'public', table: 'disputes', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'disputes',
        foreignKey: {
          name: 'disputes_loan_id_fkey',
          columns: ['loan_id'],
          references: { schema: 'public', table: 'loans', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'disputes',
        foreignKey: {
          name: 'disputes_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'inventory_transactions',
        foreignKey: {
          name: 'inventory_transactions_component_id_fkey',
          columns: ['component_id'],
          references: { schema: 'public', table: 'components', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'kit_components',
        foreignKey: {
          name: 'kit_components_kit_id_fkey',
          columns: ['kit_id'],
          references: { schema: 'public', table: 'kits', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'kit_components',
        foreignKey: {
          name: 'kit_components_component_id_fkey',
          columns: ['component_id'],
          references: { schema: 'public', table: 'components', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'loan_items',
        foreignKey: {
          name: 'loan_items_loan_id_fkey',
          columns: ['loan_id'],
          references: { schema: 'public', table: 'loans', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'loan_items',
        foreignKey: {
          name: 'loan_items_component_id_fkey',
          columns: ['component_id'],
          references: { schema: 'public', table: 'components', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'loan_status_histories',
        foreignKey: {
          name: 'loan_status_histories_loan_id_fkey',
          columns: ['loan_id'],
          references: { schema: 'public', table: 'loans', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'loan_status_histories',
        foreignKey: {
          name: 'loan_status_histories_changed_by_fkey',
          columns: ['changed_by'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'loans',
        foreignKey: {
          name: 'loans_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'notifications',
        foreignKey: {
          name: 'notifications_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'user_roles',
        foreignKey: {
          name: 'user_roles_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'user_roles',
        foreignKey: {
          name: 'user_roles_role_id_fkey',
          columns: ['role_id'],
          references: { schema: 'public', table: 'roles', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

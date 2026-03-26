"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-03-26 17:45:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


user_role = sa.Enum("admin", "dispatcher", "mechanic", "viewer", name="userrole", native_enum=False)
vehicle_type = sa.Enum("tractor", "utility_truck", "service_car", "municipal_vehicle", "water_tanker", "loader", "other", name="vehicletype", native_enum=False)
department_type = sa.Enum("agriculture", "municipal", "sanitation", "transport", "maintenance", "other", name="departmenttype", native_enum=False)
vehicle_status = sa.Enum("active", "idle", "in_service", "offline", "unavailable", name="vehiclestatus", native_enum=False)
fuel_type = sa.Enum("diesel", "petrol", "cng", "electric", "hybrid", name="fueltype", native_enum=False)
driver_status = sa.Enum("active", "resting", "off_duty", "unavailable", name="driverstatus", native_enum=False)
task_type = sa.Enum("field_work", "equipment_delivery", "municipal_service", "road_service", "transport_support", "inspection", "emergency", "other", name="tasktype", native_enum=False)
task_priority = sa.Enum("low", "medium", "high", "critical", name="taskpriority", native_enum=False)
task_status = sa.Enum("pending", "assigned", "in_progress", "completed", "cancelled", name="taskstatus", native_enum=False)
alert_type = sa.Enum("fuel_anomaly", "excessive_idle", "overdue_service", "unusual_movement", "low_efficiency", name="alerttype", native_enum=False)
alert_severity = sa.Enum("low", "medium", "high", "critical", name="alertseverity", native_enum=False)
alert_status = sa.Enum("open", "acknowledged", "resolved", name="alertstatus", native_enum=False)


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("username"),
    )
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)
    op.create_index(op.f("ix_users_role"), "users", ["role"], unique=False)

    op.create_table(
        "drivers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=False),
        sa.Column("license_type", sa.String(length=50), nullable=False),
        sa.Column("status", driver_status, nullable=False),
        sa.Column("experience_years", sa.Integer(), nullable=False),
        sa.Column("assigned_vehicle_id", sa.Integer(), nullable=True),
        sa.Column("current_lat", sa.Float(), nullable=True),
        sa.Column("current_lng", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("phone"),
    )
    op.create_index(op.f("ix_drivers_full_name"), "drivers", ["full_name"], unique=False)
    op.create_index(op.f("ix_drivers_status"), "drivers", ["status"], unique=False)

    op.create_table(
        "vehicles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("plate_number", sa.String(length=30), nullable=False),
        sa.Column("internal_code", sa.String(length=30), nullable=False),
        sa.Column("type", vehicle_type, nullable=False),
        sa.Column("department", department_type, nullable=False),
        sa.Column("brand_model", sa.String(length=120), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("fuel_type", fuel_type, nullable=False),
        sa.Column("fuel_capacity", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", vehicle_status, nullable=False),
        sa.Column("assigned_driver_id", sa.Integer(), sa.ForeignKey("drivers.id"), nullable=True),
        sa.Column("current_lat", sa.Float(), nullable=True),
        sa.Column("current_lng", sa.Float(), nullable=True),
        sa.Column("odometer", sa.Numeric(12, 2), nullable=False),
        sa.Column("last_service_date", sa.Date(), nullable=True),
        sa.Column("next_service_due_km", sa.Numeric(12, 2), nullable=True),
        sa.Column("next_service_due_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("internal_code"),
        sa.UniqueConstraint("plate_number"),
    )
    op.create_index(op.f("ix_vehicles_plate_number"), "vehicles", ["plate_number"], unique=True)
    op.create_index(op.f("ix_vehicles_internal_code"), "vehicles", ["internal_code"], unique=True)
    op.create_index(op.f("ix_vehicles_type"), "vehicles", ["type"], unique=False)
    op.create_index(op.f("ix_vehicles_department"), "vehicles", ["department"], unique=False)
    op.create_index(op.f("ix_vehicles_status"), "vehicles", ["status"], unique=False)

    op.create_foreign_key("fk_drivers_assigned_vehicle_id_vehicles", "drivers", "vehicles", ["assigned_vehicle_id"], ["id"])

    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("task_type", task_type, nullable=False),
        sa.Column("region", sa.String(length=80), nullable=False),
        sa.Column("district", sa.String(length=80), nullable=False),
        sa.Column("location_name", sa.String(length=120), nullable=False),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lng", sa.Float(), nullable=False),
        sa.Column("priority", task_priority, nullable=False),
        sa.Column("scheduled_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("scheduled_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", task_status, nullable=False),
        sa.Column("required_vehicle_type", vehicle_type, nullable=True),
        sa.Column("assigned_vehicle_id", sa.Integer(), sa.ForeignKey("vehicles.id"), nullable=True),
        sa.Column("assigned_driver_id", sa.Integer(), sa.ForeignKey("drivers.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(op.f("ix_tasks_title"), "tasks", ["title"], unique=False)
    op.create_index(op.f("ix_tasks_task_type"), "tasks", ["task_type"], unique=False)
    op.create_index(op.f("ix_tasks_region"), "tasks", ["region"], unique=False)
    op.create_index(op.f("ix_tasks_district"), "tasks", ["district"], unique=False)
    op.create_index(op.f("ix_tasks_status"), "tasks", ["status"], unique=False)
    op.create_index(op.f("ix_tasks_priority"), "tasks", ["priority"], unique=False)

    op.create_table(
        "daily_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("vehicle_id", sa.Integer(), sa.ForeignKey("vehicles.id"), nullable=False),
        sa.Column("driver_id", sa.Integer(), sa.ForeignKey("drivers.id"), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("trip_count", sa.Integer(), nullable=False),
        sa.Column("total_km", sa.Numeric(10, 2), nullable=False),
        sa.Column("fuel_used", sa.Numeric(10, 2), nullable=False),
        sa.Column("idle_hours", sa.Float(), nullable=False),
        sa.Column("active_hours", sa.Float(), nullable=False),
        sa.Column("task_count", sa.Integer(), nullable=False),
        sa.Column("completed_task_count", sa.Integer(), nullable=False),
        sa.Column("notes", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("vehicle_id", "date", name="uq_daily_logs_vehicle_date"),
    )
    op.create_index(op.f("ix_daily_logs_vehicle_id"), "daily_logs", ["vehicle_id"], unique=False)
    op.create_index(op.f("ix_daily_logs_driver_id"), "daily_logs", ["driver_id"], unique=False)
    op.create_index(op.f("ix_daily_logs_date"), "daily_logs", ["date"], unique=False)

    op.create_table(
        "maintenance_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("vehicle_id", sa.Integer(), sa.ForeignKey("vehicles.id"), nullable=False),
        sa.Column("service_type", sa.String(length=100), nullable=False),
        sa.Column("service_date", sa.Date(), nullable=False),
        sa.Column("odometer_at_service", sa.Numeric(12, 2), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("cost", sa.Numeric(12, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(op.f("ix_maintenance_records_vehicle_id"), "maintenance_records", ["vehicle_id"], unique=False)
    op.create_index(op.f("ix_maintenance_records_service_date"), "maintenance_records", ["service_date"], unique=False)

    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("vehicle_id", sa.Integer(), sa.ForeignKey("vehicles.id"), nullable=True),
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("tasks.id"), nullable=True),
        sa.Column("alert_type", alert_type, nullable=False),
        sa.Column("severity", alert_severity, nullable=False),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", alert_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(op.f("ix_alerts_vehicle_id"), "alerts", ["vehicle_id"], unique=False)
    op.create_index(op.f("ix_alerts_task_id"), "alerts", ["task_id"], unique=False)
    op.create_index(op.f("ix_alerts_alert_type"), "alerts", ["alert_type"], unique=False)
    op.create_index(op.f("ix_alerts_severity"), "alerts", ["severity"], unique=False)
    op.create_index(op.f("ix_alerts_status"), "alerts", ["status"], unique=False)


def downgrade() -> None:
    op.drop_table("alerts")
    op.drop_table("maintenance_records")
    op.drop_table("daily_logs")
    op.drop_table("tasks")
    op.drop_table("vehicles")
    op.drop_table("drivers")
    op.drop_table("users")

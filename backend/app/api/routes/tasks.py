from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.task import TaskAssignRequest, TaskCreate, TaskResponse, TaskUpdate
from app.services.fleet_service import FleetService


router = APIRouter()


@router.get("", response_model=list[TaskResponse])
def list_tasks(db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.MECHANIC, UserRole.VIEWER))) -> list[TaskResponse]:
    return FleetService.list_tasks(db)


@router.post("", response_model=TaskResponse)
def create_task(payload: TaskCreate, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER))) -> TaskResponse:
    return FleetService.create_task(db, payload)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER))) -> TaskResponse:
    return FleetService.update_task(db, task_id, payload)


@router.post("/{task_id}/assign", response_model=TaskResponse)
def assign_task(task_id: int, payload: TaskAssignRequest, db: Session = Depends(get_db), _: object = Depends(require_roles(UserRole.ADMIN, UserRole.DISPATCHER))) -> TaskResponse:
    return FleetService.assign_task(db, task_id, payload)

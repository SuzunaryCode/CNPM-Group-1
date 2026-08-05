from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.api.deps import require_role
from app.db.session import get_db
from app.models.license import STATUS_REVOKED, STATUS_AVAILABLE, STATUS_EXPIRED, STATUS_USED, LicenseKey
from app.models.user import ROLE_ADMIN, ROLE_STAFF, User
from app.schemas.license import LicenseKeyGenerateRequest, LicenseKeyResponse, LicenseAssignRequest
from app.schemas.user import StaffCreate, UserPlanUpdate, UserResponse, AdminUserUpdate
from app.core import security
from app.services.licensing import create_license_keys

DepAdmin = Depends(require_role(ROLE_ADMIN))

# Router-level: STAFF chi duoc XEM (dashboard-stats/list users/list keys). Cac
# endpoint thay doi du lieu (generate/revoke/assign key, sua user, tao staff)
# gan them DepAdmin rieng de chi ADMIN moi thuc hien duoc.
router = APIRouter(dependencies=[Depends(require_role(ROLE_ADMIN, ROLE_STAFF))])


def _check_expired(db: Session, license_key: LicenseKey) -> LicenseKey:
    if license_key.status == STATUS_AVAILABLE and license_key.expires_at and license_key.expires_at < datetime.utcnow():
        license_key.status = STATUS_EXPIRED
        db.commit()
    return license_key


def _to_license_response(license_key: LicenseKey) -> LicenseKeyResponse:
    return LicenseKeyResponse(
        id=license_key.id,
        key=license_key.key,
        status=license_key.status,
        assigned_to_user_id=license_key.assigned_to_user_id,
        assigned_to_email=license_key.assigned_to.email if license_key.assigned_to else None,
        used_by_user_id=license_key.used_by_user_id,
        used_by_email=license_key.used_by.email if license_key.used_by else None,
        used_at=license_key.used_at,
        expires_at=license_key.expires_at,
        created_at=license_key.created_at,
    )


@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Auto expire available keys
    db.query(LicenseKey).filter(
        LicenseKey.status == STATUS_AVAILABLE,
        LicenseKey.expires_at < datetime.utcnow()
    ).update({LicenseKey.status: STATUS_EXPIRED})
    db.commit()

    total_licenses = db.query(LicenseKey).count()
    active_licenses = db.query(LicenseKey).filter(LicenseKey.status == STATUS_USED).count()
    expired_licenses = db.query(LicenseKey).filter(LicenseKey.status == STATUS_EXPIRED).count()
    assigned_licenses = db.query(LicenseKey).filter(
        LicenseKey.assigned_to_user_id.isnot(None),
        LicenseKey.status == STATUS_AVAILABLE
    ).count()
    total_customers = db.query(User).count()
    
    return {
        "total_licenses": total_licenses,
        "active_licenses": active_licenses,
        "expired_licenses": expired_licenses,
        "assigned_licenses": assigned_licenses,
        "total_customers": total_customers
    }


@router.post("/license-keys", response_model=list[LicenseKeyResponse], status_code=status.HTTP_201_CREATED, dependencies=[DepAdmin])
def generate_license_keys(
    request_in: LicenseKeyGenerateRequest,
    db: Session = Depends(get_db),
):
    created = create_license_keys(db, request_in.count, request_in.expires_at)
    return [_to_license_response(key) for key in created]


@router.get("/license-keys", response_model=list[LicenseKeyResponse])
def list_license_keys(
    skip: int = 0,
    limit: int = 200,
    search: str = None,
    status_filter: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(LicenseKey)
    if search:
        query = query.filter(LicenseKey.key.ilike(f"%{search}%"))
    if status_filter:
        query = query.filter(LicenseKey.status == status_filter)
        
    keys = query.order_by(LicenseKey.created_at.desc()).offset(skip).limit(limit).all()
    # Check expiry
    result = []
    for key in keys:
        key = _check_expired(db, key)
        result.append(_to_license_response(key))
    return result


@router.post("/license-keys/{key_id}/revoke", response_model=LicenseKeyResponse, dependencies=[DepAdmin])
def revoke_license_key(
    key_id: int,
    db: Session = Depends(get_db),
):
    license_key = db.query(LicenseKey).filter(LicenseKey.id == key_id).first()
    if not license_key:
        raise HTTPException(status_code=404, detail="Không tìm thấy License Key.")
    license_key.status = STATUS_REVOKED
    db.commit()
    db.refresh(license_key)
    return _to_license_response(license_key)


@router.post("/license-keys/{key_id}/assign", response_model=LicenseKeyResponse, dependencies=[DepAdmin])
def assign_license_key(
    key_id: int,
    request_in: LicenseAssignRequest,
    db: Session = Depends(get_db),
):
    license_key = db.query(LicenseKey).filter(LicenseKey.id == key_id).first()
    if not license_key:
        raise HTTPException(status_code=404, detail="Không tìm thấy License Key.")
    
    target_user = db.query(User).filter(User.id == request_in.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")

    license_key = _check_expired(db, license_key)
    if license_key.status != STATUS_AVAILABLE:
        raise HTTPException(status_code=400, detail=f"License Key đang ở trạng thái {license_key.status}, không thể cấp phát.")
        
    license_key.assigned_to_user_id = target_user.id
    db.commit()
    db.refresh(license_key)
    return _to_license_response(license_key)


@router.get("/users", response_model=list[UserResponse])
def list_all_users(
    skip: int = 0,
    limit: int = 200,
    search: str = None,
    role_filter: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                User.email.ilike(search_pattern),
                User.full_name.ilike(search_pattern),
                User.company_name.ilike(search_pattern)
            )
        )
    if role_filter:
        query = query.filter(User.role == role_filter)
    return query.order_by(User.id.desc()).offset(skip).limit(limit).all()


@router.put("/users/{user_id}", response_model=UserResponse, dependencies=[DepAdmin])
def update_user_admin(
    user_id: int,
    request_in: AdminUserUpdate,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
        
    if request_in.company_name is not None:
        user.company_name = request_in.company_name
    if request_in.is_active is not None:
        user.is_active = request_in.is_active
    if request_in.plan is not None:
        user.plan = request_in.plan
        
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}/plan", response_model=UserResponse, dependencies=[DepAdmin])
def update_user_plan(
    user_id: int,
    plan_in: UserPlanUpdate,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
    user.plan = plan_in.plan
    db.commit()
    db.refresh(user)
    return user


@router.post("/staff", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[DepAdmin])
def create_staff_account(
    staff_in: StaffCreate,
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == staff_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email đã được đăng ký sử dụng.")
    staff_user = User(
        email=staff_in.email,
        hashed_password=security.get_password_hash(staff_in.password),
        full_name=staff_in.full_name,
        role=ROLE_STAFF,
    )
    db.add(staff_user)
    db.commit()
    db.refresh(staff_user)
    return staff_user

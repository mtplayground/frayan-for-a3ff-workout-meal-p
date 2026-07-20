import logging
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.schemas.errors import ErrorDetail, ErrorField, ErrorResponse

logger = logging.getLogger(__name__)

FIELD_LABELS = {
    "weight": "Weight",
    "height": "Height",
    "target_body_area": "Target body area",
    "meal_prep_budget": "Meal prep budget",
    "fitness_goal": "Fitness goal",
    "activity_level": "Activity level",
}


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(RequestValidationError, request_validation_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)


async def request_validation_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    fields = [_field_error(error) for error in exc.errors()]
    return _error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        code="validation_error",
        message="Please correct the highlighted fields.",
        fields=fields,
    )


async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    return _error_response(
        status_code=exc.status_code,
        code=_http_error_code(exc.status_code),
        message=_http_error_message(exc),
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(
        "Unhandled server error",
        extra={
            "error_type": type(exc).__name__,
            "error_code": getattr(exc, "code", None),
            "error_message": str(exc),
            "request_path": request.url.path,
        },
    )
    return _error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        code="server_error",
        message="Something went wrong while preparing the plan. Please try again.",
    )


def _error_response(
    *,
    status_code: int,
    code: str,
    message: str,
    fields: list[ErrorField] | None = None,
) -> JSONResponse:
    payload = ErrorResponse(
        error=ErrorDetail(
            code=code,
            message=message,
            fields=fields or [],
        )
    )
    return JSONResponse(
        status_code=status_code,
        content=payload.model_dump(mode="json"),
    )


def _field_error(error: dict[str, Any]) -> ErrorField:
    field = _field_name(error.get("loc", ()))
    return ErrorField(
        field=field,
        code=str(error.get("type", "invalid")),
        message=_field_error_message(field, error),
    )


def _field_name(location: Any) -> str:
    if not isinstance(location, list | tuple):
        return "request"

    for part in reversed(location):
        if isinstance(part, str) and part != "body":
            return part

    return "request"


def _field_error_message(field: str, error: dict[str, Any]) -> str:
    label = FIELD_LABELS.get(field, field.replace("_", " ").title())
    error_type = str(error.get("type", "invalid"))
    context = error.get("ctx") or {}

    if error_type == "missing":
        return f"{label} is required."

    if error_type == "extra_forbidden":
        return f"{label} is not a supported input."

    if error_type in {"greater_than_equal", "greater_than"}:
        bound = context.get("ge") or context.get("gt")
        return f"{label} must be at least {bound}."

    if error_type in {"less_than_equal", "less_than"}:
        bound = context.get("le") or context.get("lt")
        return f"{label} must be at most {bound}."

    if error_type == "enum":
        expected = context.get("expected")
        return f"{label} must be one of: {expected}."

    if error_type.startswith("decimal_"):
        return f"{label} must be a valid dollar amount."

    return str(error.get("msg", f"{label} is invalid."))


def _http_error_code(status_code: int) -> str:
    if status_code == status.HTTP_404_NOT_FOUND:
        return "not_found"

    if status_code == status.HTTP_503_SERVICE_UNAVAILABLE:
        return "service_unavailable"

    return "request_error"


def _http_error_message(exc: StarletteHTTPException) -> str:
    if isinstance(exc.detail, str) and exc.detail:
        return exc.detail

    if exc.status_code == status.HTTP_404_NOT_FOUND:
        return "The requested resource was not found."

    return "The request could not be completed."

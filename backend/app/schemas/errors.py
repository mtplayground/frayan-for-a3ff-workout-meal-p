from pydantic import BaseModel, Field


class ErrorField(BaseModel):
    field: str
    code: str
    message: str


class ErrorDetail(BaseModel):
    code: str
    message: str
    fields: list[ErrorField] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    error: ErrorDetail

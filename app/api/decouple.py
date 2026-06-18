from __future__ import annotations

import os
from pathlib import Path


class UndefinedValueError(Exception):
    pass


class Csv:
    def __init__(self, separator: str = ",") -> None:
        self.separator = separator

    def __call__(self, value: str) -> list[str]:
        return [item.strip() for item in value.split(self.separator) if item.strip()]


_ENV_CACHE: dict[str, str] | None = None
_UNSET = object()


def _load_env_file() -> dict[str, str]:
    env_path = Path(__file__).resolve().parent / ".env"

    if not env_path.exists():
        return {}

    values: dict[str, str] = {}
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()

    return values


def _get_env_value(key: str):
    global _ENV_CACHE

    if _ENV_CACHE is None:
        _ENV_CACHE = _load_env_file()

    if key in os.environ:
        return os.environ[key]

    if key in _ENV_CACHE:
        return _ENV_CACHE[key]

    return _UNSET


def config(key: str, default=_UNSET, cast=None):
    value = _get_env_value(key)

    if value is _UNSET:
        if default is _UNSET:
            raise UndefinedValueError(
                f"{key} not found. Declare it as env var or in .env."
            )
        value = default

    if cast is None:
        return value

    if cast is bool:
        return str(value).strip().lower() in {"1", "true", "yes", "on"}

    return cast(value)

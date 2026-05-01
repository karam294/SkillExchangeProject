from .base import *  # noqa: F403
from .base import env_bool


DEBUG = env_bool("DJANGO_DEBUG", False)

if DEBUG:
    raise ValueError("Production settings loaded with DEBUG=True. Set DJANGO_DEBUG=False.")

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

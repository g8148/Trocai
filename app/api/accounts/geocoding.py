import logging
import threading

logger = logging.getLogger(__name__)

NOMINATIM_USER_AGENT = "trocai-app/1.0 (contato@trocai.app)"
NOMINATIM_TIMEOUT = 10


def _fetch_coordinates(city: str, state: str, street: str = "", neighborhood: str = ""):
    """Retorna (lat, lon) ou None se a geocodificação falhar."""
    try:
        from geopy.exc import GeocoderServiceError, GeocoderTimedOut
        from geopy.geocoders import Nominatim
    except ImportError:
        logger.warning("geopy não instalado; geocodificação indisponível.")
        return None

    geocoder = Nominatim(user_agent=NOMINATIM_USER_AGENT, timeout=NOMINATIM_TIMEOUT)

    parts_full = [p for p in [street, neighborhood, city, state, "Brasil"] if p]
    parts_fallback = [p for p in [city, state, "Brasil"] if p]

    for query in (", ".join(parts_full), ", ".join(parts_fallback)):
        try:
            location = geocoder.geocode(query)
        except (GeocoderTimedOut, GeocoderServiceError):
            location = None
        if location:
            return location.latitude, location.longitude

    return None


def geocode_user_async(user_pk: str) -> None:
    """Geocodifica o usuário em background thread, sem bloquear o request."""

    def _run():
        from django.db import connection

        try:
            from django.contrib.auth import get_user_model

            User = get_user_model()

            try:
                user = User.objects.get(pk=user_pk)
            except User.DoesNotExist:
                return

            if user.latitude is not None or not user.city or not user.state:
                return

            result = _fetch_coordinates(
                city=user.city,
                state=user.state,
                street=user.street,
                neighborhood=user.neighborhood,
            )

            if result is None:
                logger.warning("Geocodificação falhou para o usuário %s", user_pk)
                return

            lat, lon = result
            User.objects.filter(pk=user_pk).update(latitude=lat, longitude=lon)
            logger.info("Usuário %s geocodificado: (%s, %s)", user_pk, lat, lon)

        except Exception:
            logger.exception("Erro inesperado ao geocodificar usuário %s", user_pk)
        finally:
            connection.close()

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()

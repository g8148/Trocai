import logging
import threading

logger = logging.getLogger(__name__)

NOMINATIM_USER_AGENT = "trocai-app/1.0 (contato@trocai.app)"
NOMINATIM_TIMEOUT = 10

# Mapeamento de sigla → nome completo para melhorar a precisão da geocodificação.
ESTADO_NOMES = {
    "AC": "Acre", "AL": "Alagoas", "AM": "Amazonas", "AP": "Amapá",
    "BA": "Bahia", "CE": "Ceará", "DF": "Distrito Federal", "ES": "Espírito Santo",
    "GO": "Goiás", "MA": "Maranhão", "MG": "Minas Gerais", "MS": "Mato Grosso do Sul",
    "MT": "Mato Grosso", "PA": "Pará", "PB": "Paraíba", "PE": "Pernambuco",
    "PI": "Piauí", "PR": "Paraná", "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte",
    "RO": "Rondônia", "RR": "Roraima", "RS": "Rio Grande do Sul", "SC": "Santa Catarina",
    "SE": "Sergipe", "SP": "São Paulo", "TO": "Tocantins",
}


def _fetch_coordinates(city: str, state: str, street: str = "", neighborhood: str = ""):
    """Retorna (lat, lon) ou None se a geocodificação falhar."""
    try:
        from geopy.exc import GeocoderServiceError, GeocoderTimedOut
        from geopy.geocoders import Nominatim
    except ImportError:
        logger.warning("geopy não instalado; geocodificação indisponível.")
        return None

    geocoder = Nominatim(user_agent=NOMINATIM_USER_AGENT, timeout=NOMINATIM_TIMEOUT)
    state_name = ESTADO_NOMES.get(state.upper(), state)

    # Tenta do mais específico para o mais genérico, sempre restrito ao Brasil.
    queries = [
        # 1. Endereço completo com nome do estado por extenso
        ", ".join(p for p in [street, neighborhood, city, state_name] if p),
        # 2. Só cidade e estado por extenso
        f"{city}, {state_name}",
        # 3. Cidade e sigla (fallback para cidades com nome ambíguo)
        f"{city}, {state}",
    ]

    for query in queries:
        if not query.strip():
            continue
        try:
            location = geocoder.geocode(query, country_codes="BR")
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
                User.objects.filter(pk=user_pk).update(geocoding_failed=True)
                return

            lat, lon = result
            User.objects.filter(pk=user_pk).update(
                latitude=lat, longitude=lon, geocoding_failed=False
            )
            logger.info("Usuário %s geocodificado: (%s, %s)", user_pk, lat, lon)

        except Exception:
            logger.exception("Erro inesperado ao geocodificar usuário %s", user_pk)
        finally:
            connection.close()

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()

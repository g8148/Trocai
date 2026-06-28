import time

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db.models import Q

User = get_user_model()

# Nominatim exige User-Agent identificável com contato e no máximo 1 req/s.
USER_AGENT = "trocai-app/1.0 (gabriel8148mcpe@gmail.com)"
THROTTLE_SECONDS = 1.0


class Command(BaseCommand):
    help = (
        "Geocodifica usuários com city/state preenchidos e lat/lng nulos "
        "usando o Nominatim. Pensado para rodar via cron na VPS."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Máximo de usuários a processar nesta execução (0 = sem limite).",
        )

    def handle(self, *args, **options):
        from geopy.exc import GeocoderServiceError, GeocoderTimedOut
        from geopy.geocoders import Nominatim

        geocoder = Nominatim(user_agent=USER_AGENT, timeout=10)

        pending = (
            User.objects.filter(latitude__isnull=True, longitude__isnull=True)
            .exclude(Q(city="") | Q(state=""))
            .order_by("date_joined")
        )

        limit = options["limit"]
        if limit > 0:
            pending = pending[:limit]

        total = pending.count()
        if total == 0:
            self.stdout.write("Nenhum usuário pendente de geocoding.")
            return

        self.stdout.write(f"Geocodificando {total} usuário(s)...")

        done = 0
        failed = 0
        for index, user in enumerate(pending):
            if index > 0:
                time.sleep(THROTTLE_SECONDS)  # respeita o limite de 1 req/s

            location = self._geocode(geocoder, user)
            if location is None:
                failed += 1
                self.stderr.write(f"  falhou: {user.email or user.pk}")
                continue

            User.objects.filter(pk=user.pk).update(
                latitude=location.latitude,
                longitude=location.longitude,
            )
            done += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Concluído: {done} geocodificado(s), {failed} falha(s)."
            )
        )

    def _geocode(self, geocoder, user):
        from geopy.exc import GeocoderServiceError, GeocoderTimedOut

        parts = [user.street, user.neighborhood, user.city, user.state, "Brasil"]
        full = ", ".join(p for p in parts if p)
        fallback = ", ".join(p for p in [user.city, user.state, "Brasil"] if p)

        for query in (full, fallback):
            try:
                location = geocoder.geocode(query)
            except (GeocoderTimedOut, GeocoderServiceError):
                location = None
            if location:
                return location
        return None

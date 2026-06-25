from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver


def _geocode(address):
    from geopy.exc import GeocoderServiceError, GeocoderTimedOut
    from geopy.geocoders import Nominatim

    try:
        geocoder = Nominatim(user_agent="trocai-app/1.0", timeout=10)
        return geocoder.geocode(address)
    except (GeocoderTimedOut, GeocoderServiceError, Exception):
        return None


@receiver(pre_save, sender="accounts.User")
def track_address_change(sender, instance, **kwargs):
    if not instance.pk:
        instance._address_changed = bool(instance.city and instance.state)
        return

    try:
        old = sender.objects.get(pk=instance.pk)
        instance._address_changed = (
            old.city != instance.city
            or old.state != instance.state
            or old.street != instance.street
            or old.neighborhood != instance.neighborhood
            or old.zip_code != instance.zip_code
        )
    except sender.DoesNotExist:
        instance._address_changed = True


@receiver(post_save, sender="accounts.User")
def geocode_user_address(sender, instance, **kwargs):
    if not getattr(instance, "_address_changed", False):
        return
    if not (instance.city and instance.state):
        return

    parts = [instance.street, instance.neighborhood, instance.city, instance.state, "Brasil"]
    full_address = ", ".join(p for p in parts if p)

    location = _geocode(full_address)

    if not location:
        location = _geocode(f"{instance.city}, {instance.state}, Brasil")

    if location:
        sender.objects.filter(pk=instance.pk).update(
            latitude=location.latitude,
            longitude=location.longitude,
        )

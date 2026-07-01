from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver


@receiver(pre_save, sender="accounts.User")
def reset_coords_on_address_change(sender, instance, **kwargs):
    """Quando o endereço muda, invalida as coordenadas para forçar re-geocodificação.

    A geocodificação em si acontece no post_save via background thread,
    sem bloquear o request.
    """
    if not instance.pk:
        # Usuário novo: nasce sem coordenadas; post_save vai geocodificar.
        return

    try:
        old = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    address_changed = (
        old.city != instance.city
        or old.state != instance.state
        or old.street != instance.street
        or old.neighborhood != instance.neighborhood
        or old.zip_code != instance.zip_code
    )

    if address_changed:
        instance.latitude = None
        instance.longitude = None
        instance.geocoding_failed = False
        instance._needs_geocoding = True
    else:
        # Endereço não mudou, mas se ainda não temos coordenadas tenta geocodificar
        # (cobre usuários antigos e retentativas após falha do Nominatim).
        instance._needs_geocoding = instance.latitude is None


@receiver(post_save, sender="accounts.User")
def trigger_geocoding(sender, instance, created, **kwargs):
    """Dispara geocodificação em background quando endereço muda ou usuário é criado."""
    needs = getattr(instance, "_needs_geocoding", None)

    # Para usuários novos, geocodifica se já trouxer city+state no cadastro.
    if created:
        if not instance.city or not instance.state:
            return
    elif not needs:
        return

    if instance.latitude is not None:
        return

    from .geocoding import geocode_user_async
    geocode_user_async(str(instance.pk))

from django.db.models.signals import pre_save
from django.dispatch import receiver


@receiver(pre_save, sender="accounts.User")
def reset_coords_on_address_change(sender, instance, **kwargs):
    """Quando o endereço muda, invalida as coordenadas para o geocoding refazer.

    O geocoding em si NÃO acontece aqui: bater no Nominatim dentro do save
    bloquearia a request (rede lenta/instável) e deixaria o cadastro/edição
    de perfil refém de um serviço externo. Quem geocodifica é o management
    command `geocode_users` (rodado por cron na VPS), que pega justamente os
    usuários com city/state preenchidos e lat/lng nulos.
    """
    if not instance.pk:
        # Usuário novo: nasce sem coordenadas; o command geocodifica depois.
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

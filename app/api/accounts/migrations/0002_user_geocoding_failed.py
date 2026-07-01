from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="geocoding_failed",
            field=models.BooleanField(
                default=False,
                help_text="True quando a geocodificacao falhou para o endereco atual.",
            ),
        ),
    ]

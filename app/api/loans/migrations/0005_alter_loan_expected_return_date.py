from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("loans", "0004_delete_reservation"),
    ]

    operations = [
        migrations.AlterField(
            model_name="loan",
            name="expected_return_date",
            field=models.DateTimeField(help_text="Data/hora prevista para devolução"),
        ),
    ]

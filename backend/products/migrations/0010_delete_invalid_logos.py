from django.db import migrations


def delete_invalid_logos(apps, schema_editor):
    Logo = apps.get_model('products', 'Logo')
    Logo.objects.filter(
        image_url__in=[
            '',
            'https://via.placeholder.com/200',
            None
        ]
    ).delete()
    Logo.objects.filter(image_url__startswith='https://via.placeholder').delete()


def reverse_invalid_logos(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0009_remove_logo_default'),
    ]

    operations = [
        migrations.RunPython(delete_invalid_logos, reverse_invalid_logos),
    ]

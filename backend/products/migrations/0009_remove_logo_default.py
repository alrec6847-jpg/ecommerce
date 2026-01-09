from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0008_alter_logo_image_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='logo',
            name='image_url',
            field=models.URLField(verbose_name='رابط صورة اللوغو من ImgBB'),
        ),
    ]

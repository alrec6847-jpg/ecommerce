
class Logo(models.Model):
    """Company logo model for storing uploaded logo image from ImgBB"""
    name = models.CharField('اسم اللوغو', max_length=100, default='شركة الريادة')
    image_url = models.URLField('رابط صورة اللوغو من ImgBB', blank=False)
    is_active = models.BooleanField('نشط', default=True)
    created_at = models.DateTimeField('تاريخ الإنشاء', auto_now_add=True)
    updated_at = models.DateTimeField('تاريخ التحديث', auto_now=True)

    class Meta:
        verbose_name = 'لوغو'
        verbose_name_plural = 'اللوغوهات'

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Ensure only one active logo exists"""
        if not self.image_url:
            raise ValueError('صورة اللوغو مطلوبة')
        
        if self.is_active:
            Logo.objects.exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

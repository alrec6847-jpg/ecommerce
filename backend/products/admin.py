
from django.contrib import admin
from django import forms
from django.utils.html import mark_safe
from .models import Category, Product, ProductReview, ProductView, Banner, SiteSettings
from .models_coupons import Coupon, CouponUsage

class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'whatsapp_number', 'contact_phone')
    
    def has_add_permission(self, request):
        # Allow only one instance
        try:
            from django.db import connection
            if 'products_sitesettings' not in connection.introspection.table_names():
                return True
            # Double check if objects.exists() fails
            try:
                if self.model.objects.exists():
                    return False
            except:
                return True
        except Exception as e:
            print(f"Error in SiteSettingsAdmin.has_add_permission: {e}")
            return True
        return True

    def has_delete_permission(self, request, obj=None):
        return False

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'display_order', 'is_active')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'description', 'parent__name')
    list_editable = ('display_order', 'is_active')
    prepopulated_fields = {}  # يمكن إضافة حقول يتم ملؤها تلقائيًا إذا لزم الأمر

    fieldsets = (
        (None, {
            'fields': ('name', 'parent', 'description', 'image', 'is_active', 'display_order')
        }),
    )


class ProductAdmin(admin.ModelAdmin):
    list_display = ('product_image', 'name', 'category', 'price', 'discount_amount', 'stock_quantity', 'is_active', 'is_featured')
    list_filter = ('category', 'brand', 'is_active', 'is_featured', 'show_on_homepage', 'created_at')
    search_fields = ('name', 'description', 'brand', 'model')
    list_editable = ('price', 'stock_quantity', 'is_active')
    
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        try:
            extra_context['categories'] = Category.objects.all()
        except:
            extra_context['categories'] = []
            
        # Add filters to context for the custom template
        extra_context['category_filter'] = request.GET.get('category')
        extra_context['status_filter'] = request.GET.get('status')
        extra_context['featured_filter'] = request.GET.get('featured')
        extra_context['stock_filter'] = request.GET.get('stock')
        extra_context['search_query'] = request.GET.get('q')
        
        # Get the standard response
        try:
            response = super().changelist_view(request, extra_context=extra_context)
        except Exception as e:
            print(f"Error in ProductAdmin.changelist_view super call: {e}")
            # If it fails, we might be missing tables
            from django.shortcuts import render
            return render(request, 'admin/change_list.html', extra_context)
        
        # After super call, we can access the changelist instance if it's a TemplateResponse
        if hasattr(response, 'context_data'):
            if 'cl' in response.context_data:
                cl = response.context_data['cl']
                response.context_data['results'] = cl.result_list
                if hasattr(cl, 'paginator'):
                    response.context_data['page_range'] = cl.paginator.page_range
            
            # Ensure page_range is always present to avoid template errors
            if 'page_range' not in response.context_data:
                response.context_data['page_range'] = range(1, 2)
            
            if 'results' not in response.context_data:
                response.context_data['results'] = []
            
        return response

    def product_image(self, obj):
        """عرض صورة صغيرة من المنتج"""
        if obj.main_image:
            return mark_safe(f'<img src="{obj.main_image.url}" width="50" height="50" style="border-radius: 4px; object-fit: cover;" />')
        return '❌ لا توجد صورة'
    product_image.short_description = '🖼️ الصورة'

    fieldsets = (
        ('📦 معلومات أساسية', {
            'fields': ('name', 'description', 'category', 'brand', 'model')
        }),
        ('💰 التسعير والخصومات', {
            'fields': (
                'price', 'wholesale_price', 
                'discount_amount', 'discount_price',
                'discount_start', 'discount_end'
            )
        }),
        ('📊 إدارة المخزون', {
            'fields': ('stock_quantity', 'low_stock_threshold')
        }),
        ('🖼️ معرض الصور', {
            'fields': ('main_image', 'image_2', 'image_3', 'image_4')
        }),
        ('🏷️ تفاصيل المنتج', {
            'fields': ('color', 'size', 'weight')
        }),
        ('🔍 SEO والبيانات الوصفية', {
            'fields': ('slug', 'meta_description', 'tags')
        }),
        ('⚡ الحالة والمميزات', {
            'fields': ('is_active', 'is_featured', 'show_on_homepage', 'display_order')
        }),
    )


class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('product__name', 'user__username', 'comment')
    readonly_fields = ('created_at',)


class ProductViewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'ip_address', 'viewed_at')
    list_filter = ('viewed_at',)
    search_fields = ('product__name', 'user__username', 'ip_address')
    readonly_fields = ('viewed_at',)


class BannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'product', 'is_active', 'display_order', 'created_at')
    list_filter = ('is_active', 'created_at', 'product')
    search_fields = ('title', 'description', 'product__name')
    list_editable = ('is_active', 'display_order')
    autocomplete_fields = ['product']  # Enable autocomplete for product selection
    
    fieldsets = (
        ('معلومات الإعلان', {
            'fields': ('title', 'description')
        }),
        ('الصور والروابط', {
            'fields': ('image',),
            'description': 'قم برفع صورة الإعلان هنا. سيتم حفظها محلياً في السيرفر لضمان السرعة.'
        }),
        ('ربط المنتج', {
            'fields': ('product', 'link_url'),
            'description': 'اختر المنتج المرتبط بالإعلان. سيتم توجيه المستخدم لصفحة المنتج عند الضغط على الإعلان.'
        }),
        ('إعدادات العرض', {
            'fields': ('is_active', 'display_order')
        }),
    )


# تسجيل نماذج الكوبونات
# Note: Registration is done in ecom_project/admin.py for custom admin site
class CouponAdmin(admin.ModelAdmin):
    """إعدادات عرض الكوبونات في لوحة الإدارة"""
    list_display = [
        'code', 
        'discount_type', 
        'discount_value', 
        'minimum_order_amount',
        'usage_limit',
        'used_count',
        'is_active',
        'start_date',
        'end_date'
    ]
    list_filter = [
        'discount_type',
        'is_active',
        'start_date',
        'end_date',
        'created_at'
    ]
    search_fields = ['code', 'description']
    readonly_fields = ['id', 'used_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('معلومات الكوبون', {
            'fields': (
                'code',
                'description',
                'is_active'
            )
        }),
        ('تفاصيل الخصم', {
            'fields': (
                'discount_type',
                'discount_value',
                'max_discount_amount',
                'minimum_order_amount'
            )
        }),
        ('الصلاحية والاستخدام', {
            'fields': (
                'start_date',
                'end_date',
                'usage_limit',
                'used_count'
            )
        }),
        # ('تطبيق الكوبون', {
        #     'fields': (
        #         'applicable_products',
        #         'applicable_categories',
        #         'excluded_products',
        #         'excluded_categories'
        #     )
        # }),
        ('معلومات النظام', {
            'fields': (
                'id',
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    def get_readonly_fields(self, request, obj=None):
        """جعل حقل used_count للقراءة فقط دائمًا"""
        if obj:  # إذا كان الكائن موجودًا بالفعل
            return self.readonly_fields + ['used_count']
        return self.readonly_fields


# Note: Registration is done in ecom_project/admin.py for custom admin site
class CouponUsageAdmin(admin.ModelAdmin):
    """إعدادات عرض استخدامات الكوبونات في لوحة الإدارة"""
    list_display = [
        'coupon_code',
        'user',
        'order',
        'discount_amount',
        'used_at'
    ]
    list_filter = [
        'used_at',
        'coupon__discount_type'
    ]
    search_fields = [
        'coupon__code',
        'user__first_name',
        'user__last_name',
        'user__phone',
        'order__id'
    ]
    readonly_fields = ['id', 'used_at']
    
    def coupon_code(self, obj):
        """عرض كود الكوبون"""
        return obj.coupon.code
    coupon_code.short_description = 'كود الكوبون'
    
    def has_add_permission(self, request):
        """منع إضافة استخدامات كوبونات يدويًا"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """منع تعديل استخدامات الكوبونات"""
        return False


# تسجيل النماذج الأخرى
admin.site.register(SiteSettings, SiteSettingsAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(ProductReview, ProductReviewAdmin)
admin.site.register(ProductView, ProductViewAdmin)
admin.site.register(Banner, BannerAdmin)

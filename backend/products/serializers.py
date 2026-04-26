from rest_framework import serializers
from .models import Product, Category, Banner, SiteSettings
from .models_coupons import Coupon, CouponUsage
from .serializers_coupons import CouponSerializer, CouponUsageSerializer
import logging

logger = logging.getLogger(__name__)

class SiteSettingsSerializer(serializers.ModelSerializer):
    site_logo = serializers.ImageField(source='logo', required=False, allow_null=True)
    
    class Meta:
        model = SiteSettings
        fields = ['site_name', 'site_logo', 'contact_phone', 'whatsapp_number', 'telegram_username']

    def to_representation(self, instance):
        """Handle missing fields in database gracefully and ensure absolute URLs"""
        try:
            # Check if instance is valid
            if not instance:
                return {
                    'site_name': 'شركة الريادة المتحدة',
                    'site_logo': None,
                    'contact_phone': '07834950300',
                    'whatsapp_number': '07834950300',
                    'telegram_username': '07834950300'
                }

            try:
                ret = super().to_representation(instance)
            except Exception:
                ret = {}

            # Ensure all expected fields are present
            fields_needed = ['site_name', 'site_logo', 'contact_phone', 'whatsapp_number', 'telegram_username']
            for field in fields_needed:
                if field not in ret:
                    # Try to get from instance attribute directly
                    val = getattr(instance, field, None)
                    if field == 'site_logo':
                        val = getattr(instance, 'logo', None)
                    ret[field] = val
            
            # Ensure site_logo is absolute URL
            logo_obj = getattr(instance, 'logo', None)
            if logo_obj:
                try:
                    logo_url = logo_obj.url
                    if logo_url.startswith('http'):
                        ret['site_logo'] = logo_url
                    else:
                        request = self.context.get('request')
                        if request:
                            ret['site_logo'] = request.build_absolute_uri(logo_url)
                        else:
                            ret['site_logo'] = f"http://167.86.98.95{logo_url}"
                except Exception:
                    ret['site_logo'] = None
            else:
                ret['site_logo'] = None

            # Defaults for contact info if None or empty
            if not ret.get('site_name'): ret['site_name'] = 'شركة الريادة المتحدة'
            if not ret.get('contact_phone'): ret['contact_phone'] = '07834950300'
            if not ret.get('whatsapp_number'): ret['whatsapp_number'] = '07834950300'
            if not ret.get('telegram_username'): ret['telegram_username'] = '07834950300'
            
            return ret
        except Exception as e:
            print(f"Critical error in SiteSettingsSerializer: {e}")
            return {
                'site_name': 'شركة الريادة المتحدة',
                'site_logo': None,
                'contact_phone': '07834950300',
                'whatsapp_number': '07834950300',
                'telegram_username': '07834950300'
            }

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image', 'parent', 'is_active', 'display_order', 'children', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        """Get subcategories for this category"""
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []

class ProductListSerializer(serializers.ModelSerializer):
    """A simplified serializer for product lists"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_image_url = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    is_on_sale = serializers.SerializerMethodField()
    time_left = serializers.SerializerMethodField()
    stock = serializers.IntegerField(source='stock_quantity', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'wholesale_price', 'discount_amount', 'discount_price', 'discount_start', 'discount_end',
                  'discount_percentage', 'discounted_price', 'is_on_sale', 'time_left', 'stock_quantity', 'stock', 'category_name', 
                  'main_image', 'image_2', 'image_3', 'image_4', 'main_image_url', 'image', 'is_featured', 'show_on_homepage', 
                  'brand', 'is_in_stock']
        read_only_fields = ['id', 'main_image_url', 'image', 'discount_percentage', 'discounted_price', 'is_on_sale', 'time_left', 'category_name', 'stock', 'is_in_stock']

    def get_main_image_url(self, obj):
        """الصورة الرئيسية بوضوح"""
        if obj.main_image:
            return obj.main_image.url
        return None

    def get_image(self, obj):
        """اختر أول صورة متاحة - هذا ما يستخدمه Frontend"""
        for img_field in [obj.main_image, obj.image_2, obj.image_3, obj.image_4]:
            if img_field:
                return img_field.url
        return None
    
    def get_discount_percentage(self, obj):
        """Get discount percentage from model property"""
        return obj.discount_percentage
    
    def get_discounted_price(self, obj):
        """Get appropriate discounted price based on user type"""
        request = self.context.get('request')
        user = request.user if request else None
        
        if user and user.is_authenticated and hasattr(user, 'is_wholesale') and user.is_wholesale:
            # For wholesale users, we return the wholesale price
            return obj.wholesale_price if obj.wholesale_price > 0 else obj.price
            
        # For normal users, return normal discounted price
        return obj.discounted_price
    
    def get_is_on_sale(self, obj):
        """Get is_on_sale from model property"""
        return obj.is_on_sale

    def get_time_left(self, obj):
        """Calculate time left in seconds if on sale"""
        if obj.is_on_sale and obj.discount_end:
            from django.utils import timezone
            diff = obj.discount_end - timezone.now()
            seconds = int(diff.total_seconds())
            return max(seconds, 0)
        return 0

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_image_url = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    all_images = serializers.SerializerMethodField()
    # إضافة حقول الخصم المحسوبة
    discount_percentage = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    is_on_sale = serializers.SerializerMethodField()
    time_left = serializers.SerializerMethodField()
    stock = serializers.IntegerField(source='stock_quantity', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'price', 'wholesale_price', 'discount_amount', 'discount_price', 'discount_start', 'discount_end',
            'discount_percentage', 'discounted_price', 'is_on_sale', 'time_left',
            'stock_quantity', 'stock', 'low_stock_threshold',
            'main_image', 'image_2', 'image_3', 'image_4', 'main_image_url', 'image', 'all_images',
            'brand', 'model', 'color', 'size', 'weight',
            'slug', 'meta_description', 'tags',
            'is_active', 'is_featured', 'show_on_homepage', 'display_order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'main_image_url', 'image', 'all_images', 'time_left', 'discount_percentage', 'discounted_price', 'is_on_sale']

    def get_main_image_url(self, obj):
        """إرجاع الصورة الرئيسية"""
        if obj.main_image:
            return obj.main_image.url
        return None

    def get_image(self, obj):
        """إرجاع أول صورة متاحة - يستخدمها Frontend لعرض الصورة"""
        for img_field in [obj.main_image, obj.image_2, obj.image_3, obj.image_4]:
            if img_field:
                return img_field.url
        return None
    
    def get_all_images(self, obj):
        """إرجاع كل الصور كقائمة"""
        images = []
        for img_field in [obj.main_image, obj.image_2, obj.image_3, obj.image_4]:
            if img_field:
                images.append(img_field.url)
        return images if images else None
    
    def get_discount_percentage(self, obj):
        """Get discount percentage from model property"""
        return obj.discount_percentage
    
    def get_discounted_price(self, obj):
        """Get appropriate discounted price based on user type"""
        request = self.context.get('request')
        user = request.user if request else None
        
        if user and user.is_authenticated and hasattr(user, 'is_wholesale') and user.is_wholesale:
            # For wholesale users, we return the wholesale price
            return obj.wholesale_price if obj.wholesale_price > 0 else obj.price
            
        # For normal users, return normal discounted price
        return obj.discounted_price
    
    def get_is_on_sale(self, obj):
        """Get is_on_sale from model property"""
        return obj.is_on_sale

    def get_time_left(self, obj):
        """Calculate time left in seconds if on sale"""
        if obj.is_on_sale and obj.discount_end:
            from django.utils import timezone
            diff = obj.discount_end - timezone.now()
            seconds = int(diff.total_seconds())
            return max(seconds, 0)
        return 0
    
    def to_representation(self, instance):
        """تحسين تمثيل البيانات - تأكد من أن الصور موجودة"""
        representation = super().to_representation(instance)
        
        # تسجيل للتحقق من البيانات
        if instance.id and instance.id <= 3:  # تسجيل أول 3 منتجات فقط
            print(f"🖼️ Serializing Product: {instance.name} (ID: {instance.id})")
            print(f"   main_image: {instance.main_image}")
            print(f"   image_2: {instance.image_2}")
            print(f"   image_3: {instance.image_3}")
            print(f"   image_4: {instance.image_4}")
            print(f"   Final image field: {representation.get('image')}")
        
        return representation
    
    def create(self, validated_data):
        """إنشء منتج جديد مع ضمان حفظ الصور"""
        print(f"📝 Creating new product with data:")
        print(f"   main_image: {validated_data.get('main_image')}")
        print(f"   image_2: {validated_data.get('image_2')}")
        print(f"   image_3: {validated_data.get('image_3')}")
        print(f"   image_4: {validated_data.get('image_4')}")
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """تحديث منتج مع ضمان حفظ الصور"""
        print(f"📝 Updating product {instance.id} with data:")
        print(f"   main_image: {validated_data.get('main_image')}")
        print(f"   image_2: {validated_data.get('image_2')}")
        print(f"   image_3: {validated_data.get('image_3')}")
        print(f"   image_4: {validated_data.get('image_4')}")
        
        return super().update(instance, validated_data)

class BannerSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    link = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = ['id', 'title', 'description', 'image', 'product', 'link_url', 
                  'is_active', 'display_order', 'link', 'product_id', 'created_at', 'updated_at']

    def get_image(self, obj):
        # Return local file URL
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_link(self, obj):
        # Return the link using the get_link method from the model
        link = obj.get_link()
        print(f"Banner link for {obj.title}: {link}")
        return link

    def get_product_id(self, obj):
        # Return the product ID if exists
        if obj.product:
            print(f"Banner {obj.title} is linked to product ID: {obj.product.id}")
            return obj.product.id
        print(f"Banner {obj.title} is not linked to any product")
        return None
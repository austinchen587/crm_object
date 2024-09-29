from rest_framework import serializers
from .models import Customer
from django.contrib.auth import get_user_model
from .models import SalesUser

User = get_user_model()

# 序列化器类，用于将Customer模型数据转换为JSON格式
class CustomerSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(slug_field='username', read_only=True)  # 只读字段，显示创建者的用户名
    updated_by = serializers.SlugRelatedField(slug_field='username', read_only=True) # 只读字段，显示最后修改者的用户名
    description = serializers.CharField(required=False, allow_blank=True)

    
    # 格式化日期字段，只显示年月日
    #created_at = serializers.DateField(format="%Y-%m-%d",read_only=True)
    #updated_by = serializers.DateField(format="%Y-%m-%d",read_only=True)
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()
   

    class Meta:
        model = Customer # 绑定到Customer模型
        fields = ['id', 'name', 'phone', 'wechat_id', 'address', 'education', 
                  'major_category', 'major_detail', 'status', 'created_by', 'updated_by', 
                  'created_at', 'updated_at', 'description']
        #fields = '__all__'  # 序列化所有字段


    # 自定义方法将 datetime 转为 date（只保留年月日）
    def get_created_at(self, obj):
        return obj.created_at.date()
    
    def get_updated_at(self, obj):
        return obj.updated_at.date() if obj.updated_at else None



# 作用：
# 1. CustomerSerializer 将Customer模型数据序列化为JSON，便于前端接收。
# 2. fields = '__all__' 表示序列化模型中的所有字段。

# 作用说明：
# 1. `created_by` 和 `modified_by` 字段是只读字段，显示客户的创建者和修改者的用户名。
# 2. `description` 字段是可选的，因此设置了 `required=False` 和 `allow_blank=True`，表示用户可以选择不填此字段。
# 3. `fields` 列表中定义了所有需要被序列化的字段。

# 用于序列化 SalesUser 模型
class SalesUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesUser
        fields = ['id', 'username', 'email', 'role']  # 确保 role 字段被序列化
from django.contrib import admin # 从Django中导入admin模块
from .models import Customer, SalesUser  # 导入Customer模型
from django.contrib.auth.admin import UserAdmin  # 导入Django默认UserAdmin类
from .forms import SalesUserCreationForm  # 导入自定义的用户创建表单
from django.utils.html import format_html  # 用于在admin界面中格式化HTML

# 自定义SalesUser的Admin管理界面
class SaleUserAdmin(UserAdmin):
    model = SalesUser  # 确保这里正确指定模型
    # 继承Django默认的UserAdmin以确保密码处理正确
    add_form = SalesUserCreationForm  # 用于在Admin中创建用户时使用的表单
    list_display = ('username', 'email', 'is_staff', 'is_active', 'role', 'group_leader')  # 定义显示哪些字段
    list_filter = ('is_staff', 'is_active', 'role', 'group_leader')  # 你可以根据需求添加过滤器
    search_fields = ('username', 'email', 'group_leader__username')  # 支持按组长搜索
    ordering = ('username',)

    # 修改fieldsets来包含group_leader字段
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('个人信息', {'fields': ('email',)}),
        ('权限设置', {'fields': ('is_staff', 'is_active', 'role', 'group_leader')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'role', 'group_leader', 'is_staff', 'is_active')}, # 在添加用户时包含group_leader
        ),
    )

    #search_fields = ('username', 'email')
    #ordering = ('username',)
    
    # 在保存表单时，确保更新用户的组长信息
    def save_model(self,request,obj,form,change):
        if form.is_valid():
            obj.save()
            self.message_user(request, f"用户 {obj.username} 已分配给组长 {obj.group_leader}")
        super().save_model(request,obj,form,change)



# 自定义Customer的Admin管理界面
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'created_by', 'updated_by', 'created_at', 'updated_at') # 定义显示的字段
    list_filter = ('created_by', 'updated_by', 'created_at')  # 添加过滤器
    search_fields = ('name', 'phone') # 添加搜索功能
    ordering = ('created_at',)  # 按创建时间排序

    # 在admin界面中允许修改created_by字段
    fields = ['name', 'phone', 'wechat_id', 'address', 'description', 'created_by', 'updated_by']  # 可编辑的字段
    
    # 自定义显示created_by字段样式
    def create_by_display(self,obj):
        if obj.created_by:
            return format_html(f'<strong>{obj.created_by.username}</strong>')
        return '未指定'
    
    create_by_display.short_description = '创建人' # 自定义表头名称

        # 计算客户上次更新到现在的天数
    def days_since_update(self, obj):
        if obj.updated_at:
            from datetime import datetime
            delta = datetime.now().date() - obj.updated_at.date()
            return f"{delta.days} 天"
        return '未修改'

    days_since_update.short_description = '未更新天数'  # 设置表头名称


# 注册Customer模型到管理后台
admin.site.register(SalesUser, SaleUserAdmin)  # 注册SalesUser模型
admin.site.register(Customer, CustomerAdmin)  # 注册Customer模型


# 作用：
# 1. 通过admin.site.register() 将Customer模型注册到Django管理后台。

# 1. `SaleUserAdmin` 自定义了对SalesUser模型的管理功能，允许管理员管理用户的角色、权限等。
# 2. `CustomerAdmin` 允许管理员在后台管理中修改 `created_by` 和 `modified_by` 字段，并且可以添加、过滤和搜索客户信息。
# 3. `created_by_display` 是一个自定义方法，用于友好地展示 `created_by` 字段。

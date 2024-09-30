from django.contrib.auth.models import AbstractUser # 从Django中导入AbstractUser类，用于扩展用户模型
from django.db import models
from django.utils import timezone


# 自定义用户模型，继承自Django内置的AbstractUser
class SalesUser(AbstractUser):
    ROLE_CHOICES = [
        ('user', '普通用户'),
        ('group_leader', '组长'),
        ('admin', '管理员'),
    ]

    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='user', verbose_name='用户角色')   # 用户角色，默认为普通用户
    #group_leader = models.BooleanField(default=False)  # 是否为组长，默认不是
    group_leader = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='team_members',
        help_text="为该用户分配一个组长.",
        verbose_name='组长'
    )

    # 添加related_name参数，解决与默认User模型的冲突
    groups = models.ManyToManyField(
        'auth.Group',
        related_name = 'salesuser_set',  # 设置反向关联的related_name，避免冲突
        blank = True,
        help_text = '该用户所属的用户组',
        verbose_name = '用户组',
    )

    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name = 'salesuser_set',  # 设置反向关联的related_name，避免冲突
        blank = True,
        help_text = '该用户拥有的特定权限',
        verbose_name = '用户权限',
    )
    
    def __str__(self):
        return self.username
    
    class Meta:
        verbose_name = '销售用户'
        verbose_name_plural = '销售用户列表'
# 作用说明：
# 该模型扩展了Django自带的用户模型，可以根据需求添加更多字段。
# 后续可以通过权限系统实现管理员和普通用户的权限区分。

# 定义学历选项
EDUCATION_CHOICES = [
    ('below_college', '大专以下'),
    ('college', '大专'),
    ('bachelor', '本科'),
    ('master_above', '研究生及以上'),
]

# 定义专业选项
MAJOR_CHOICES = [
    ('it', 'IT'),
    ('non_it', '非IT'),
]

# 定义状态选项
STATUS_CHOICES = [
    ('employed', '在职'),
    ('unemployed', '待业'),
]



# 客户模型类，定义了客户数据的字段
class Customer(models.Model):
    name = models.CharField(max_length=100, verbose_name='姓名') # 客户姓名
    phone = models.CharField(max_length=20, verbose_name='电话')  # 客户电话
    wechat_id = models.CharField(max_length=50,default='', verbose_name='微信号')  # 微信号字段
    education = models.CharField(max_length=20, choices=EDUCATION_CHOICES, default='大专', verbose_name='学历')  # 学历字段
    major_category = models.CharField(max_length=10, choices=MAJOR_CHOICES, default='IT', verbose_name='专业类别')  # 专业类别
    major_detail = models.CharField(max_length=100, blank=True, null=True, verbose_name='专业详细信息')  # 专业详细信息
    status = models.CharField(max_length=15, choices=STATUS_CHOICES,default='待业', verbose_name='状态')  # 状态字段
    address = models.TextField(verbose_name='地址')
    
    # 创建人和修改人字段
    created_by = models.ForeignKey(SalesUser, on_delete=models.CASCADE, null=True, related_name='customers_created', verbose_name='创建人')  # 创建人
    updated_by = models.ForeignKey(SalesUser, on_delete=models.SET_NULL, null=True, related_name='customers_updated', verbose_name='最后修改人')  # 修改人
    
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')  # 创建时间
    updated_at = models.DateTimeField(auto_now=True, verbose_name='修改时间')  # 修改时间，自动更新为最近一次修改的时间
    
    description = models.TextField(null=True, blank=True, verbose_name='客户描述')  # 客户情况描述字段

    def __str__(self):
        return self.name  # 在Django管理界面中显示客户姓名
    
    class Meta:
        verbose_name = '客户'
        verbose_name_plural = '客户列表'

    
# 作用：
# 1. 定义了Customer模型，代表数据库中的客户信息表。
# 2. 模型字段指定了客户数据的各个属性，如姓名、邮箱等。
# 3. __str__ 方法定义了在Django admin界面中展示客户名称。
# 1. SalesUser 扩展了 Django 默认用户模型，增加了角色和组长字段。
# 2. Customer 模型新增了 created_by 和 updated_by 字段，用于记录客户的创建人和最后一次修改人。
# 3. updated_at 自动更新每次修改客户信息的时间。
# 1. `description` 字段用于存储客户情况描述，可以为空。



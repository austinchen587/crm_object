from django.urls import path  # 从Django中导入path方法，用于定义URL路径
from .views import LoginView  # 从sales应用的views模块导入LoginView类
from .views import CustomerListView, CustomerDetailView, verify_token # 从当前目录导入视图类
from .views import RegisterView

# 定义URL路由，将请求导向对应的视图
urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('token-verify/', verify_token, name='token-verify'),  # Token验证视图
    path('customers/', CustomerListView.as_view(),name='customer-list'),  # 定义URL路径以获取所有客户信息
    path('customer-detail/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),  # 使用pk
    path('register/', RegisterView.as_view(), name='register'),  # 注册接口
    
]

# 作用：
# 1. path('customers/') 定义了一个URL路径，用于获取所有客户数据或创建新客户。
# 2. path('customers/<int:pk>/') 定义了通过客户ID获取、更新或删除客户的URL路径。
# 3. 每个路径都会映射到指定的视图（如CustomerListView、CustomerDetailView），这些视图负责处理请求。
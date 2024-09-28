from rest_framework import permissions, status # 导入REST框架的权限和状态模块，用于设置API的访问权限和返回状态
from rest_framework.views import APIView   # 导入APIView类，用于处理API请求
from rest_framework.response import Response # 导入Response类，用于返回API响应
from django.contrib.auth import authenticate  # 导入Django的authenticate方法，用于用户验证
from rest_framework import generics  # 从Django REST框架中导入泛型视图类，用于简化API开发
from .models import Customer, SalesUser  # 从当前目录导入Customer模型，用于查询数据库中的客户数据
from .serializers import CustomerSerializer # 从当前目录导入CustomerSerializer序列化器，用于将客户数据转换为JSON格式
from rest_framework.authtoken.models import Token  # 导入Token模型，用于生成和返回认证Token
from rest_framework.decorators import api_view  # 导入api_view装饰器，用于将视图函数定义为REST API视图
from rest_framework import status  # 导入status模块，用于返回HTTP状态码
import logging
from .models import Customer
from rest_framework.generics import RetrieveAPIView
from .permissions import IsOwnerOrGroupLeaderOrAdmin
from .serializers import CustomerSerializer
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import PermissionDenied
from .serializers import SalesUserSerializer
from django.contrib.auth.models import User
from datetime import timedelta
from django.utils.timezone import now
from django.db.models import F, Value
from django.db.models.functions import TruncDate


# 获取 logger 用于记录调试信息
logger = logging.getLogger(__name__)  # 设置日志记录器


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        #raise Exception("LoginView reached this point")
        logger.info("LoginView has been called")
        username = request.data.get('username')
        password = request.data.get('password')
        logger.info(f"Received login data: {username}, {password}")

        user = authenticate(username=username, password=password)

        if user is not None:
            token, created = Token.objects.get_or_create(user=user)

            # 序列化用户数据
            user_serializer = SalesUserSerializer(user)
            logger.info(f"Serialized user data: {user_serializer.data}")  # 打印序列化的用户数据

            # 检查 role 是否存在于序列化数据中
            #role = user_serializer.data.get('role')
            #logger.info(f"Role: {role}")

            response_data = {
                "message": "LoginView is working",
                "token": token.key,
                "username": user.username,
                "role": user_serializer.data.get('role')
                #"role": user.role
            }

            logger.info(f"Response data to be returned: {response_data}")  # 打印即将返回的数据

            return Response(response_data, status=status.HTTP_200_OK)

        logger.error(f"Authentication failed for user: {username}")
        return Response({"message": "登入失败"}, status=status.HTTP_400_BAD_REQUEST)

# 视图类，用于处理获取所有客户信息的请求
class CustomerListView(generics.ListCreateAPIView):
    #queryset = Customer.objects.all()  # 查询数据库中的所有客户记录
    #serializer_class = CustomerSerializer  # 指定序列化器，将数据格式化为JSON响应
    serializer_class = CustomerSerializer  # 使用CustomerSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrGroupLeaderOrAdmin]  # 使用自定义权限

    def get_queryset(self):
        user = self.request.user
        logger.info(f"Fetching customer list for user: {user.username}, role: {user.role}")
        
        if not user.is_authenticated:  # 检查用户是否已认证
            raise PermissionDenied("用户未认证")
        
        # 过滤时间范围
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        #queryset = Customer.objects.all()

        # 管理员可以查看所有客户，组长可以查看本组的客户，普通用户只能查看自己的客户
        if user.is_superuser:
            queryset = Customer.objects.all()
            logger.info(f"Superuser {user.username} retrieving all customers")
            #return Customer.objects.all()
    
        # 如果用户是组长，允许查看本组成员的客户
        #if hasattr(user, 'group_leader') and user.group_leader:
        elif user.role == 'group_leader':
           
        # 这里假设 group_leader 和组的关系明确，并且你有对应的关联模型
           #return Customer.objects.filter(created_by__in=SalesUser.objects.filter(group_leader=True))
           group_members = SalesUser.objects.filter(group_leader=user)
           queryset = Customer.objects.filter(created_by__in=group_members) | Customer.objects.filter(created_by=user)
           logger.info(f"Group leader {user.username} retrieving customers for their group")
           #return Customer.objects.filter(created_by__in=group_members) | Customer.objects.filter(created_by=user)
        
        else:
        # 普通用户只能查看自己添加的客户
             #queryset = queryset.filter(created_at__range=[start_date, end_date])
             queryset = Customer.objects.filter(created_by=user)
             logger.info(f"Regular user {user.username} retrieving only their own customers")
             #return Customer.objects.filter(created_by=user)
             

        # 日期过滤：根据创建时间筛选客户
        if start_date and end_date:
            queryset = queryset.filter(created_at__range=[start_date, end_date])
            logger.info(f"Filtering customers created between {start_date} and {end_date}")

        # 截断日期只显示年月日
        queryset = queryset.annotate(
            created_at_trunc = TruncDate('created_at'),
            updated_at_trunc = TruncDate('updated_at')
        )

        return queryset
    
    def perform_create(self, serializer):
        logger.info(f"Creating new customer by user: {self.request.user.username}")
        serializer.save(created_by=self.request.user)


    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        data = response.data

        # 按 `created_by` 归类显示
        grouped_data = {}
        for item in data:
            created_by_user = item['created_by']
            if created_by_user not in grouped_data:
                grouped_data[created_by_user] = []
            grouped_data[created_by_user].append(item)

        return Response(grouped_data)

# 视图类，用于处理获取单个客户信息的请求
class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Customer.objects.all()  # 查询数据库中的所有客户记录
    serializer_class = CustomerSerializer # 指定序列化器，将数据格式化为JSON响应
    #lookup_field = 'pk'  # 确保使用主键来查找客户
    permission_classes = [IsOwnerOrGroupLeaderOrAdmin] # 使用自定义权限

    def perform_update(self, serializer):
        logger.info(f"Updating customer by user: {self.request.user.username}")
        serializer.save(updated_by=self.request.user)

    def get(self, request, *args, **kwargs):
        print(f"Fetching customer with ID: {kwargs['pk']}")
        return super().get(request, *args, **kwargs)


# 作用：
# 1. CustomerListView 类处理获取所有客户的GET请求，并支持创建客户的POST请求。
# 2. CustomerDetailView 类处理通过客户ID获取（GET）、更新（PUT）、删除（DELETE）的请求。 


logger = logging.getLogger(__name__)

@api_view(['GET'])
def verify_token(request):
    token = request.headers.get('Authorization', None)
    logger.info(f"Received token: {token}")  # 记录接收到的Token
    
    if token and token.startswith('Token '):
        token_key = token.split(' ')[1]
        try:
            token_obj = Token.objects.get(key=token_key)
            logger.info(f"Token is valid for user: {token_obj.user.username}")
            return Response({"detail": "Token is valid."}, status=status.HTTP_200_OK)
        except Token.DoesNotExist:
            logger.error("Invalid token.")
            return Response({"detail": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)
    
    logger.warning("Token not provided.")
    return Response({"detail": "Token not provided."}, status=status.HTTP_400_BAD_REQUEST)



class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]  # 允许任何人访问

    def post(self, request):
        logger.info("RegisterView has been called")  # 调用时的第一条日志

        # 从请求数据中获取信息
        username = request.data.get('username')  
        password = request.data.get('password')
        
        # 调试点：记录收到的注册信息
        logger.info(f"Received registration data - Username: {username}")

        # 验证必填字段
        if not username or not password:
            logger.error("Username or password missing")
            return Response({'message': '用户名和密码为必填项'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 检查用户名是否已存在
        if SalesUser.objects.filter(username=username).exists():
            logger.warning(f"Attempt to register with existing username: {username}")
            return Response({'message': '用户名已存在'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 创建用户前的日志记录
        logger.info(f"Creating new user - Username: {username}, Role: user")

        try:
            # 创建普通用户
            user = SalesUser.objects.create_user(
                username = username,
                password=password,
                role='user', # 注册时指定用户角色为普通用户

            )
            user.save()  # 保存用户

            logger.info(f"User {user.username} created successfully with role: {user.role}")

            # 序列化用户信息
            user_serializer = SalesUserSerializer(user)
            token, created = Token.objects.get_or_create(user=user)

            return Response({
                "message": "用户注册成功",
                "token": token.key,
                "user": user_serializer.data,  # 返回用户的序列化数据
                "role": "user"
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            # 捕捉创建用户过程中的任何异常
            logger.error(f"Error occurred during user creation: {str(e)}")
            return Response({"message": "用户注册失败"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


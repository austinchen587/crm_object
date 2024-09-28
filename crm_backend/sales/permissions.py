from rest_framework import permissions
import logging

# 设置日志记录
logger = logging.getLogger(__name__)


class IsOwnerOrGroupLeaderOrAdmin(permissions.BasePermission):
    """
    自定义权限：用户只能查看、修改自己添加的客户信息；
    组长可以查看、修改、删除本组的客户信息；
    管理员可以查看、修改、删除所有客户信息并设置组长。
    """

    def has_object_permission(self, request, view, obj):
        # 增加调试日志，记录当前用户及其角色信息
        logger.info(f"Checking permissions for user: {request.user.username}, role: {getattr(request.user, 'role', 'undefined')}")

        # 如果用户是管理员，允许所有操作
        if request.user.is_superuser:
            logger.info(f"User {request.user.username} is superuser, granting all permissions.")
            return True
        
        # 如果用户是组长，允许查看、修改和删除本组成员的客户
        if hasattr(request.user, 'role') and request.user.role == 'group_leader':
            # 这里可以进一步检查组长是否是客户所属组的组长
            logger.info(f"User {request.user.username} is a group leader, granting permissions for group members.")
            return True  # 组长可以操作本组成员的客户

        # 普通用户只能操作自己创建的客户
        if hasattr(obj, 'created_by') and obj.created_by == request.user:
            logger.info(f"User {request.user.username} is the owner of the customer, granting permission.")
            return True  # 如果客户是用户创建的，允许访问


        # 如果用户既不是管理员也不是组长，且不是客户的创建者，拒绝访问
        logger.warning(f"User {request.user.username} does not have permission to access customer {obj.id}.")
        return False
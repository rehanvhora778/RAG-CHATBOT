import logging
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError

from core.responses import APIResponse
from core.mongo import analytics_col
from core.constants import EVENT_LOGIN
from .serializers import RegisterSerializer, UserProfileSerializer, ChangePasswordSerializer
from django.utils import timezone

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error('Registration failed.', serializer.errors)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        logger.info("New user registered: %s", user.username)
        return APIResponse.created(
            data={
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
            },
            message='Registration successful.',
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return APIResponse.error('Username and password are required.')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return APIResponse.error('No account found with that username.', status_code=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return APIResponse.error('Incorrect password. Please try again.', status_code=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return APIResponse.error('Account is disabled.', status_code=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)

        # Log analytics event
        try:
            analytics_col().insert_one({
                'user_id': user.id,
                'event_type': EVENT_LOGIN,
                'metadata': {'username': user.username},
                'created_at': timezone.now(),
            })
        except Exception:
            pass

        logger.info("User logged in: %s", user.username)
        return APIResponse.success(
            data={
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
            },
            message='Login successful.',
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return APIResponse.error('Refresh token is required.')
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info("User logged out: %s", request.user.username)
            return APIResponse.success(message='Logged out successfully.')
        except TokenError as exc:
            return APIResponse.error(str(exc))


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return APIResponse.success(data=serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            return APIResponse.error('Update failed.', serializer.errors)
        serializer.save()
        return APIResponse.success(data=serializer.data, message='Profile updated.')


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponse.error('Validation failed.', serializer.errors)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return APIResponse.error('Current password is incorrect.')

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        logger.info("Password changed for user: %s", user.username)
        return APIResponse.success(message='Password changed successfully.')


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            return APIResponse.success(data=response.data, message='Token refreshed.')
        return APIResponse.error('Token refresh failed.', response.data,
                                 status_code=response.status_code)

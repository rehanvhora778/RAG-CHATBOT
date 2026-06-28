from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView,
    ProfileView, ChangePasswordView, CustomTokenRefreshView,
)

urlpatterns = [
    path('register/',         RegisterView.as_view(),        name='auth_register'),
    path('login/',            LoginView.as_view(),           name='auth_login'),
    path('logout/',           LogoutView.as_view(),          name='auth_logout'),
    path('token/refresh/',    CustomTokenRefreshView.as_view(), name='auth_token_refresh'),
    path('profile/',          ProfileView.as_view(),         name='auth_profile'),
    path('change-password/',  ChangePasswordView.as_view(),  name='auth_change_password'),
]

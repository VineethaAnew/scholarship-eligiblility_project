from django.shortcuts import render
#from django.utils.decorators import method_decorator
#from django.views.decorators.csrf import csrf_exempt

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import login, logout
from .serializers import RegisterSerializer, LoginSerializer
from .models import Profile
from django.contrib.auth.models import User
from .serializers import ProfileSerializer


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = Profile.objects.get(user=user)

        return Response({
            "username": user.username,
            "email": user.email,
            "phone": profile.phone,
            "age": profile.age,
            "gender": profile.gender,
            "dob": profile.dob if hasattr(profile, 'dob') else None
        })

    def put(self, request):
        data = request.data
        user = request.user
        
        profile, _ = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # Update user fields
        user.email = data.get('email', user.email)
        user.save()

        # Update profile fields
        profile.phone = data.get('phone', profile.phone)
        profile.age = data.get('age', profile.age)
        profile.gender = data.get('gender', profile.gender)
        profile.dob = data.get('dob', profile.dob)
        profile.save()

        return Response({"message": "Profile updated successfully"})


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Account created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({"message": "Logged in successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Logged out"}, status=status.HTTP_200_OK)


class MeView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response({"username": request.user.username})
        return Response({"detail": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

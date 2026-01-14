from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import ScholarshipApplication
from .serializers import ScholarshipApplicationSerializer

class ScholarshipApplyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        serializer = ScholarshipApplicationSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyApplicationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        apps = ScholarshipApplication.objects.filter(user=request.user).order_by('-created_at')
        serializer = ScholarshipApplicationSerializer(apps, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

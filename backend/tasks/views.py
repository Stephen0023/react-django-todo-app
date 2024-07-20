from django.shortcuts import render
from rest_framework import generics
from .models import Task, Category
from .serializers import TaskSerializer, CategorySerializer
from django_filters.rest_framework import DjangoFilterBackend

class TaskListCreate(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['categories__name']  # Renamed from tags

class TaskDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class CategoryListCreate(generics.ListCreateAPIView):  # Renamed from TagListCreate
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

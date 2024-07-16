from django.shortcuts import render
from rest_framework import generics
from .models import Task, Tag
from .serializers import TaskSerializer, TagSerializer
from django_filters.rest_framework import DjangoFilterBackend

# Create your views here.

class TaskListCreate(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tags__name']

class TaskDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class TagListCreate(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer



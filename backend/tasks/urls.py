from django.urls import path
from .views import TaskListCreate, TaskDetail, TagListCreate

urlpatterns = [
    path('tasks/', TaskListCreate.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', TaskDetail.as_view(), name='task-detail'),
    path('tags/', TagListCreate.as_view(), name='tag-list-create'),
]

from django.urls import path
from .views import TaskListCreate, TaskDetail, CategoryListCreate  

urlpatterns = [
    path('tasks/', TaskListCreate.as_view(), name='task-list-create'),
    path('tasks/<uuid:pk>/', TaskDetail.as_view(), name='task-detail'),
    path('categories/', CategoryListCreate.as_view(), name='category-list-create'),  
]

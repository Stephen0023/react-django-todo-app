from rest_framework import serializers
from .models import Task, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class TaskSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, required=False)  # Renamed from tags

    class Meta:
        model = Task
        fields = ['id', 'name', 'description', 'completed', 'categories', 'date', 'deadline', 'created_at', 'updated_at']

    def create(self, validated_data):
        categories_data = validated_data.pop('categories', [])  # Renamed from tags
        task = Task.objects.create(**validated_data)
        for category_data in categories_data:
            category, created = Category.objects.get_or_create(name=category_data['name'])
            task.categories.add(category)  # Renamed from tags
        return task

    def update(self, instance, validated_data):
        categories_data = validated_data.pop('categories', [])  # Renamed from tags
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.completed = validated_data.get('completed', instance.completed)
        instance.date = validated_data.get('date', instance.date)
        instance.deadline = validated_data.get('deadline', instance.deadline)
        instance.save()
        instance.categories.clear()  # Renamed from tags
        for category_data in categories_data:
            category, created = Category.objects.get_or_create(name=category_data['name'])
            instance.categories.add(category)  # Renamed from tags
        return instance

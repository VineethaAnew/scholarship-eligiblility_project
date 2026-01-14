from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Profile
import re

class RegisterSerializer(serializers.ModelSerializer):
    
    
    
    email = serializers.EmailField()
    age = serializers.IntegerField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.ChoiceField(
        choices=Profile.GENDER_CHOICES,
        required=False,
        allow_blank=True
    )
    def validate_password(self, value):
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-={}[\]|\\:;"\'<>,./~`]).{8,}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
            )
        return value
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'age', 'phone', 'gender']

    def create(self, validated_data):
        age = validated_data.pop('age', None)
        phone = validated_data.pop('phone', '')
        gender = validated_data.pop('gender', '')

        # Create User
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )

        # Create Profile
        Profile.objects.create(
            user=user,
            age=age,
            phone=phone,
            gender=gender
        )

        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            username=data['username'],
            password=data['password']
        )
        if not user:
            raise serializers.ValidationError("Invalid username or password")
        data['user'] = user
        return data


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', required=False)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'phone', 'age', 'gender', 'dob']

    def update(self, instance, validated_data):
        # update user email if provided
        user_data = validated_data.get('user', {})
        email = user_data.get('email', None)
        if email is not None:
            instance.user.email = email
            instance.user.save()

        instance.phone = validated_data.get('phone', instance.phone)
        instance.age = validated_data.get('age', instance.age)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.dob = validated_data.get('dob', instance.dob)
        instance.save()
        return instance

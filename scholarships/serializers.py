from rest_framework import serializers
from .models import ScholarshipApplication

class ScholarshipApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipApplication
        fields = [
            'id', 'name', 'college', 'parents_name', 'phone', 'address',
            'marks', 'is_eligible',
            'bank_account_number', 'bank_ifsc', 'bank_name',
            'created_at'
        ]
        read_only_fields = ['is_eligible', 'created_at']

    def validate(self, attrs):
        marks = attrs.get('marks', None)
        bank_account_number = attrs.get('bank_account_number')
        bank_ifsc = attrs.get('bank_ifsc')
        bank_name = attrs.get('bank_name')

        # If marks < 75, they are not allowed to send bank details
        if marks is not None and marks < 75:
            if bank_account_number or bank_ifsc or bank_name:
                raise serializers.ValidationError(
                    "Bank details cannot be provided when marks are below 75."
                )
        return attrs

from django.urls import path
from .views import ScholarshipApplyView, MyApplicationsView

urlpatterns = [
    path('apply/', ScholarshipApplyView.as_view(), name='apply-scholarship'),
    path('my/', MyApplicationsView.as_view(), name='my-scholarships'),
]

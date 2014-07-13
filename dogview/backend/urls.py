from django.conf.urls import patterns, url
from backend import views

urlpatterns = patterns('',
    url(r'^reads/', views.reads, name='index')
)
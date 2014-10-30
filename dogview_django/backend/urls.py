from django.conf.urls import patterns, url
from backend import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^reads/', views.reads, name='reads'),
    url(r'^pileups/', views.pileups, name='pileups'),
    url(r'^expressions/', views.expressions, name='expression'),
)
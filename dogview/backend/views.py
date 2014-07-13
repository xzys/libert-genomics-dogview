from django.shortcuts import render
from django.http import HttpResponse

from django.utils import simplejson
from django.core import serializers

# Create your views here.
def index(request):
	return HttpResponse("Hello, world. You're at the index.")
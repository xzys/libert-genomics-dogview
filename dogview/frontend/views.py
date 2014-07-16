from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def graph(request):
	# return HttpResponse("Hello, world. You're at the graph.")
	return render(request, 'frontend/graph.html')


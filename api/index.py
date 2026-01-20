import sys
import os

# Create a path to the backend directory
# This assumes the file structure:
# root/
#   api/index.py
#   backend/
#     app/
#       main.py
backend_path = os.path.join(os.path.dirname(__file__), '../backend')
sys.path.append(backend_path)

from app.main import app

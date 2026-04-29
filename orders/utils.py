import math
import random

# 📏 Distance (basic Euclidean)
def calculate_distance(lat1, lon1, lat2, lon2):
    return math.sqrt((lat1 - lat2)**2 + (lon1 - lon2)**2)

# 🚦 Traffic simulation
def traffic_factor():
    return random.uniform(1.0, 1.5)
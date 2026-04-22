import requests
 
PRODUCTS = [
    {"name": "Wireless Noise-Cancelling Headphones", "price": 79.99, "category": "Electronics",
     "description": "Premium sound with 30hr battery life and active noise cancellation."},
    {"name": "Mechanical Keyboard", "price": 129.99, "category": "Electronics",
     "description": "Tactile switches, RGB backlight, and a sturdy aluminium frame."},
    {"name": "Running Shoes", "price": 89.99, "category": "Sports",
     "description": "Lightweight mesh upper with responsive foam midsole."},
    {"name": "Yoga Mat", "price": 34.99, "category": "Sports",
     "description": "6mm thick non-slip surface, eco-friendly materials."},
    {"name": "Coffee Maker", "price": 59.99, "category": "Kitchen",
     "description": "Brews 12 cups, programmable timer, auto shut-off."},
    {"name": "Air Fryer", "price": 99.99, "category": "Kitchen",
     "description": "5.8L capacity, 7 presets, uses 85% less oil than deep frying."},
    {"name": "Backpack 30L", "price": 49.99, "category": "Travel",
     "description": "Waterproof, laptop sleeve, multiple compartments."},
    {"name": "Sunglasses UV400", "price": 24.99, "category": "Fashion",
     "description": "Polarised lenses, lightweight TR90 frame."},
]
 
for p in PRODUCTS:
    r = requests.post("http://127.0.0.1:8000/products", json=p)
    if r.ok:
        print(f"✅ Added: {p['name']}")
    else:
        print(f"❌ Failed: {p['name']} — {r.text}")
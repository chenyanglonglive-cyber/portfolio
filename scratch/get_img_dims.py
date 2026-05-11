from PIL import Image
import os

img_path = r'd:\blog\portfolio\frontend\images\ui_assets.png'
if os.path.exists(img_path):
    with Image.open(img_path) as img:
        print(f"Dimensions: {img.width}x{img.height}")
else:
    print("File not found")

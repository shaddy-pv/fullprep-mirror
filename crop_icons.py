from PIL import Image
import os

images_to_process = [
    'favicon-96x96.png',
    'apple-touch-icon.png',
    'favicon.ico',
    'web-app-manifest-192x192.png',
    'web-app-manifest-512x512.png'
]

apps = [
  r'E:\Project\Working\fullprep-main\frontend\public',
  r'E:\Project\Working\fullprep-main\landing-page\public',
  r'E:\Project\Working\fullprep-main\fullprep-Admin\public'
]

for app in apps:
    for img_name in images_to_process:
        path = os.path.join(app, img_name)
        if os.path.exists(path):
            try:
                img = Image.open(path)
                w, h = img.size
                
                # crop 20% from all sides (so 60% of original size is kept in the center)
                left = int(w * 0.20)
                top = int(h * 0.20)
                right = int(w * 0.80)
                bottom = int(h * 0.80)
                
                img_cropped = img.crop((left, top, right, bottom))
                img_resized = img_cropped.resize((w, h), Image.Resampling.LANCZOS)
                
                if path.endswith('.ico'):
                    img_resized.save(path, format='ICO', sizes=[(16,16), (32,32), (48,48), (64,64)])
                else:
                    img_resized.save(path)
                print(f'Processed {path}')
            except Exception as e:
                print(f'Error {path}: {e}')

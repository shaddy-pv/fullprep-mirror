import re

paths = [
  r'E:\Project\Working\fullprep-main\frontend\public\favicon.svg',
  r'E:\Project\Working\fullprep-main\landing-page\public\favicon.svg',
  r'E:\Project\Working\fullprep-main\fullprep-Admin\public\favicon.svg'
]

for p in paths:
    with open(p, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(r'viewBox="0 0 1000 1000"', 'viewBox="150 150 700 700"', content)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(new_content)
print('SVG Updated!')

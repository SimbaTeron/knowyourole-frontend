import codecs, re
f = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\client\src\pages\mood-mixer.tsx"
out = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\replace-resultcard-out.txt"
with codecs.open(f, 'r', encoding='utf-8') as fh:
    content = fh.read()

# Find all occurrences of "function ResultCard" and "const blendName"
results = []
for m in re.finditer(r'ResultCard', content):
    results.append(f"ResultCard at {m.start()}: {repr(content[m.start():m.start()+60])}")

for m in re.finditer(r'blendName', content):
    results.append(f"blendName at {m.start()}: {repr(content[m.start()-20:m.start()+40])}")

for m in re.finditer(r'MOOD SHIFT', content):
    results.append(f"MOOD SHIFT at {m.start()}: {repr(content[m.start()-20:m.start()+40])}")

with codecs.open(out, 'w', encoding='utf-8') as rh:
    for r in results:
        rh.write(r + "\n")

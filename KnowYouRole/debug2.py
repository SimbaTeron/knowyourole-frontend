import codecs
f = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\client\src\pages\mood-mixer.tsx"
out = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\do-mood-shift-out.txt"
with codecs.open(f, 'r', encoding='utf-8') as fh:
    content = fh.read()

idx = content.find('RESULT CARD')
with codecs.open(out, 'w', encoding='utf-8') as rh:
    rh.write(f"File len: {len(content)}\n")
    rh.write(f"RESULT CARD found at: {idx}\n")
    if idx >= 0:
        # Show surrounding context
        rh.write(f"Before: {repr(content[idx-10:idx])}\n")
        rh.write(f"After: {repr(content[idx:idx+30])}\n")

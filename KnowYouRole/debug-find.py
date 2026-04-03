import codecs, re
f = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\client\src\pages\mood-mixer.tsx"
out = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\do-mood-shift-out.txt"
with codecs.open(f, 'r', encoding='utf-8') as fh:
    content = fh.read()

# Try different patterns
patterns = [
    r'//.*RESULT CARD.*\nfunction ResultCard',
    r'RESULT CARD',
    r'ResultCard',
    r'// .* RESULT',
]

with codecs.open(out, 'w', encoding='utf-8') as rh:
    for pat in patterns:
        m = re.search(pat, content)
        if m:
            rh.write(f"FOUND: '{pat}' at {m.start()}\n")
            rh.write(f"  Context: {repr(content[m.start():m.start()+50])}\n")
        else:
            rh.write(f"NOT FOUND: '{pat}'\n")
    
    # Also check raw bytes for "RESULT"
    idx = content.find('RESULT')
    rh.write(f"\nRaw find 'RESULT' at: {idx}\n")
    if idx >= 0:
        rh.write(f"  Context: {repr(content[idx-5:idx+60])}\n")

import re

f = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\client\src\pages\mood-mixer.tsx"
out = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\do-mood-shift-out.txt"

# Try both encodings
for enc in ['utf-8', 'cp1252', 'latin-1']:
    try:
        with open(f, 'r', encoding=enc) as fh:
            content = fh.read()
        idx = content.find('RESULT CARD')
        print(f"{enc}: len={len(content)}, idx={idx}")
        if idx >= 0:
            print(f"  Before 'RESULT CARD': {repr(content[idx-20:idx])}")
            # Also try the regex
            m = re.search(r'//.*RESULT CARD', content)
            print(f"  re.match: {m is not None}")
            break
    except Exception as e:
        print(f"{enc}: ERROR {e}")

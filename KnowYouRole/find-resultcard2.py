import codecs, re
f = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\client\src\pages\mood-mixer.tsx"
out = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\replace-resultcard-out.txt"
with codecs.open(f, 'r', encoding='utf-8') as fh:
    content = fh.read()

m = re.search(r'ResultCard', content)
with codecs.open(out, 'w', encoding='utf-8') as rh:
    if m:
        rh.write(f"Found at: {m.start()}\n")
        rh.write(f"Context: {repr(content[m.start():m.start()+80])}\n")
    else:
        rh.write("ResultCard not found at all!\n")
    
    # Also check what the file looks like around position 35000-35200
    rh.write(f"\nFile length: {len(content)}\n")
    rh.write(f"\nContent around 35000:\n")
    rh.write(repr(content[34900:35100]))

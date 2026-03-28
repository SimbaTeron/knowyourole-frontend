import re

# Open with Windows-1252 (the actual encoding of the file)
f = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\client\src\pages\mood-mixer.tsx"
out = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\do-mood-shift-out.txt"

with open(f, 'r', encoding='cp1252') as fh:
    content = fh.read()

# Verify - should now show the proper box-drawing characters
idx = content.find('RESULT CARD')
print(f"File length: {len(content)}")
print(f"RESULT CARD found at: {idx}")
print(f"Context: {repr(content[idx-5:idx+40])}")

# Also verify ResultCard function
idx2 = content.find('ResultCard')
print(f"ResultCard found at: {idx2}")
print(f"Context: {repr(content[idx2:idx2+50])}")

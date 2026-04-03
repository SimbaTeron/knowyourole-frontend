import codecs
f = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\client\src\pages\mood-mixer.tsx"
out = r"C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\find-resultcard-out.txt"
with codecs.open(f, 'r', encoding='utf-8') as fh:
    lines = fh.readlines()
with codecs.open(out, 'w', encoding='utf-8') as rh:
    for i, line in enumerate(lines):
        if 'RESULT CARD' in line:
            rh.write(f"Line {i+1}\n")
            rh.write(f"Line content: {lines[i][:80]}\n")
            rh.write(f"Prev line: {lines[i-1][:80]}\n")
            rh.write(f"Next line: {lines[i+1][:80]}\n")
            rh.write(f"Function start search...\n")
            # Search backward for function ResultCard
            for j in range(i-1, max(i-20, -1), -1):
                if 'function ResultCard' in lines[j]:
                    rh.write(f"ResultCard function at line {j+1}\n")
                    rh.write(f"{lines[j][:80]}\n")
                    break
            break

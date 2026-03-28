import subprocess, re, codecs

# Get raw LF-only bytes
git_data = subprocess.check_output(
    ['git', 'cat-file', '-p', 'bbb6966:KnowYouRole/client/src/pages/mood-mixer.tsx'],
    cwd=r'C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole'
)
text = git_data.decode('utf-8')

# Try patterns
patterns = [
    r'//\s+RESULT CARD[^\n]*\n',
    r'//\s+RESULT CARD',
    r'Result Card',
    r'ResultCard',
    r'getBlendDescription',
]

for pat in patterns:
    m = re.search(pat, text)
    if m:
        # Don't print unicode to PS - write to file instead
        with codecs.open(r'C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\deploy-status.txt', 'w', 'utf-8') as rh:
            rh.write(f"FOUND: {pat!r} at {m.start()}\n")
            rh.write(f"Match: {text[m.start():m.start()+50]}\n")
        print(f"FOUND '{pat}' at {m.start()}")
        break
else:
    with codecs.open(r'C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\deploy-status.txt', 'w', 'utf-8') as rh:
        rh.write("None of the patterns matched!\n")
        rh.write(f"RESULT CARD at: {text.find('RESULT CARD')}\n")
        rh.write(f"ResultCard at: {text.find('ResultCard')}\n")
    print("No patterns matched!")
    print(f"RESULT CARD at: {text.find('RESULT CARD')}")
    print(f"ResultCard at: {text.find('ResultCard')}")

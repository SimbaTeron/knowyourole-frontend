import subprocess, re, codecs

# Step 1: Get raw bytes from git and write binary
git_data = subprocess.check_output(
    ['git', 'show', 'bbb6966:KnowYouRole/client/src/pages/mood-mixer.tsx'],
    cwd=r'C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole'
)
out_path = r'C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\client\src\pages\mood-mixer.tsx'
with open(out_path, 'wb') as f:
    f.write(git_data)

# Step 2: Read back with utf-8 (git output should be UTF-8 with LF only)
text = git_data.decode('utf-8', errors='replace')

rc = re.search(r'ResultCard', text)
gbd = re.search(r'getBlendDescription', text)
ms = re.search(r'MOOD SHIFT', text)

with codecs.open(r'C:\Users\Simba\Desktop\Projects\knowyourole-frontend\KnowYouRole\fix-status.txt', 'w', 'utf-8') as rh:
    rh.write(f"Git data: {len(git_data)} bytes\n")
    rh.write(f"ResultCard: {rc.start() if rc else 'NOT FOUND'}\n")
    rh.write(f"getBlendDescription: {gbd.start() if gbd else 'NOT FOUND'}\n")
    rh.write(f"MOOD SHIFT: {ms.start() if ms else 'NOT FOUND'}\n")

print("Step 1 done: file written")
print(f"ResultCard at: {rc.start() if rc else 'NOT FOUND'}")
print(f"getBlendDescription at: {gbd.start() if gbd else 'NOT FOUND'}")

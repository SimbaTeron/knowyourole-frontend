import urllib.request, json

TOKEN="vcp_REDACTED"
headers = {"Authorization": f"Bearer {TOKEN}"}
project_id = "prj_xfRh2KAfdnUsctAthiHGWEJuWRAz"

req = urllib.request.Request(
    f"https://api.vercel.com/v6/deployments?projectId={project_id}&limit=3",
    headers=headers,
)
with urllib.request.urlopen(req, timeout=15) as resp:
    deps = json.loads(resp.read())
    print("Latest deployments:")
    for d in deps.get("deployments", []):
        print(f"  {d['url']} | {d['state']} | branch={d['meta'].get('gitCommitRef','?')} | sha={d['meta'].get('gitCommitSha','N/A')[:8]}")

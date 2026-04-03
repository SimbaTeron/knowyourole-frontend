import urllib.request, json

TOKEN="vcp_REDACTED"
headers = {"Authorization": f"Bearer {TOKEN}"}

project_id = "prj_xfRh2KAfdnUsctAthiHGWEJuWRAz"

# Get client project details
req = urllib.request.Request(
    f"https://api.vercel.com/v6/projects/{project_id}",
    headers=headers,
)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        proj = json.loads(resp.read())
        print("Project:", proj.get("name"))
        print("Git:", proj.get("link"))
        print("Framework:", proj.get("framework"))
        # Check env vars
        print("\nFetching env vars via v2 endpoint...")
        req2 = urllib.request.Request(
            f"https://api.vercel.com/v2/projects/{project_id}/env?decrypt=true",
            headers=headers,
        )
        with urllib.request.urlopen(req2, timeout=15) as resp2:
            envs = json.loads(resp2.read())
            print("Env vars count:", len(envs.get("envs", [])))
            for e in envs.get("envs", []):
                if "VITE" in e.get("key", ""):
                    print(f"  {e['key']} = {e.get('value', e.get('secret'))}")
except Exception as ex:
    print("Error:", ex)
    # Try alternative
    import traceback; traceback.print_exc()

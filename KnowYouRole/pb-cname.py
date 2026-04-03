import urllib.request, json, base64

PB_KEY = "pk1_0b9e366011a2ed9c6fdc1e490c215e26a7d76e14a5aa7857115d29665894398b"
PB_SECRET = "sk1_ae8050b92528741b9674193fd380f9d6deb026495550b6910b8f08ebb90f592f"
PB_API = "https://porkbun.com/api/json/v3"
domain = "ummout.com"

# Try with Basic Auth (user=key, pass=secret)
auth = base64.b64encode(f"{PB_KEY}:{PB_SECRET}".encode()).decode()

payload = {
    "apiKey": PB_KEY,
    "apiSecretKey": PB_SECRET,
    "name": "dev",
    "type": "CNAME",
    "content": "client-tau-lemon-66.vercel.app",
    "ttl": "600",
}

url = f"{PB_API}/dns/create/{domain}"

# Try with basic auth header
for auth_type in ["none", "basic"]:
    headers = {"Content-Type": "application/json"}
    if auth_type == "basic":
        headers["Authorization"] = f"Basic {auth}"

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            print(f"{auth_type} auth: SUCCESS")
            print(json.dumps(result, indent=2))
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"{auth_type} auth: HTTP {e.code} | {body[:100]}")
    except Exception as ex:
        print(f"{auth_type} auth: Error {ex}")

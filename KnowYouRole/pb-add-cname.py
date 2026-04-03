import urllib.request, json

PB_API = "https://porkbun.com/api/json/v3"
PB_KEY = "pk1_0b9e366011a2ed9c6fdc1e490c215e26a7d76e14a5aa7857115d29665894398b"
PB_SECRET = "sk1_ae8050b92528741b9674193fd380f9d6deb026495550b6910b8f08ebb90f592f"

# Step 1: Add CNAME for dev.ummout.com → client-tau-lemon-66.vercel.app
domain = "ummout.com"
record_data = {
    "apiKey": PB_KEY,
    "apiSecretKey": PB_SECRET,
    "name": "dev",
    "type": "CNAME",
    "content": "client-tau-lemon-66.vercel.app",
    "ttl": "300",
}

req = urllib.request.Request(
    f"{PB_API}/dns/create/{domain}",
    data=json.dumps(record_data).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read())
        print("CNAME created:")
        print(json.dumps(result, indent=2))
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print("HTTP Error:", e.code)
    print("Body:", body[:400])

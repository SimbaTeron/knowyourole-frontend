import urllib.request, json

PB_API = "https://porkbun.com/api/json/v3"
PB_KEY = "pk1_0b9e366011a2ed9c6fdc1e490c215e26a7d76e14a5aa7857115d29665894398b"
PB_SECRET = "sk1_ae8050b92528741b9674193fd380f9d6deb026495550b6910b8f08ebb90f592f"

# Try different endpoints to debug
endpoints = [
    (f"{PB_API}/ping", {"apiKey": PB_KEY, "apiSecretKey": PB_SECRET}),
    (f"{PB_API}/domain/getAllInfo", {"apiKey": PB_KEY, "apiSecretKey": PB_SECRET}),
]

for url, data in endpoints:
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            print(f"URL {url}:")
            print(json.dumps(result, indent=2)[:500])
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"URL {url}: HTTP {e.code} | {body[:200]}")
    except Exception as ex:
        print(f"URL {url}: Error: {ex}")
    print()

import urllib.request, json

PB_API = "https://porkbun.com/api/json/v3"
PB_KEY = "pk1_76d10956458b9cc053caa15bd393ca4d0b3768198047d595ce12b2cc9313199c"

# Porkbun requires both apiKey AND apiSecretKey
# The user gave me the public key (pk1_) — I need the secret key too
# Let me try with empty secret first to see what error comes back
ping_data = json.dumps({
    "apiKey": PB_KEY,
    "apiSecretKey": "",  # Need this
}).encode()

req = urllib.request.Request(
    f"{PB_API}/ping",
    data=ping_data,
    headers={"Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        result = json.loads(resp.read())
        print("Ping:", json.dumps(result, indent=2))
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print("HTTP Error:", e.code)
    print("Body:", body[:300])
except Exception as e:
    print("Error:", type(e).__name__, str(e)[:200])

# python run.py <task.js> [timeout]  — отправляет задачу серверу браузера, при busy ждёт и повторяет
import sys, time, urllib.request, json, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
task = sys.argv[1]; tmo = int(sys.argv[2]) if len(sys.argv) > 2 else 170
port = sys.argv[3] if len(sys.argv) > 3 else "9444"
path = r"C:\Users\17D3~1\.claude\abakan-klining\_tools\\" + task
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
for i in range(80):
    try:
        r = opener.open(urllib.request.Request("http://127.0.0.1:%s/run" % port, data=path.encode()), timeout=tmo).read().decode("utf-8")
    except Exception as e:
        print(json.dumps({"error": "http: " + str(e)})); sys.exit(1)
    if r != '{"error":"busy"}':
        print(r); sys.exit(0)
    time.sleep(3)
print('{"error":"busy too long"}')

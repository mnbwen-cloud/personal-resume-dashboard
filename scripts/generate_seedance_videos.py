"""
Seedance 2.5 视频生成脚本 - 为看板生成3个背景视频
"""
import httpx
import json
import time
import os

API_KEY = os.environ.get("ARK_API_KEY", "") or ""
if not API_KEY:
    # 从项目根目录 .env 读取（.env 不会提交到 Git）
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        for line in open(env_path, encoding="utf-8"):
            line = line.strip()
            if line.startswith("ARK_API_KEY="):
                API_KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
                break
if not API_KEY:
    raise SystemExit("未找到 ARK_API_KEY，请在 .env 中配置（ARK_API_KEY=ark-xxx）")
BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
OUTPUT_DIR = "f:/项目/Personal-Resume/assets/videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

videos = [
    {
        "name": "dashboard-bg-aurora",
        "prompt": "Abstract dark tech background with flowing aurora-like light streaks, deep navy blue and purple gradients, subtle golden particles floating, futuristic cyberpunk aesthetic, smooth camera movement, cinematic lighting, no text, no characters",
        "ratio": "16:9",
        "duration": 8,
    },
    {
        "name": "geometric-abstract",
        "prompt": "Animated geometric shapes floating in dark space, rotating triangles and hexagons with neon blue and purple glow, modern minimalist motion design, smooth slow motion, elegant camera pan, no text",
        "ratio": "16:9",
        "duration": 8,
    },
    {
        "name": "particle-flow",
        "prompt": "Elegant particle flow animation, thousands of glowing particles forming abstract patterns, dark background with blue and teal color scheme, dreamy atmosphere, smooth flowing motion, no text",
        "ratio": "16:9",
        "duration": 8,
    },
]


def submit_task(video):
    body = {
        "model": "doubao-seedance-2-5-260628",
        "content": [
            {
                "type": "text",
                "text": video["prompt"]
            }
        ],
        "ratio": video["ratio"],
        "duration": video["duration"],
        "watermark": False
    }
    r = httpx.post(f"{BASE_URL}/contents/generations/tasks", headers=headers, json=body, timeout=60)
    data = r.json()
    if r.status_code == 200:
        task_id = data["id"]
        print(f"  Task submitted: {task_id}")
        return task_id
    else:
        print(f"  ERROR: {json.dumps(data, ensure_ascii=False)}")
        return None


def poll_task(task_id, max_wait=600):
    start = time.time()
    while time.time() - start < max_wait:
        r = httpx.get(f"{BASE_URL}/contents/generations/tasks/{task_id}", headers=headers, timeout=30)
        data = r.json()
        status = data.get("status", "unknown")
        elapsed = int(time.time() - start)
        print(f"  [{elapsed}s] Status: {status}")

        if status == "succeeded":
            content = data.get("content", {})
            video_url = content.get("video_url", "")
            if isinstance(video_url, dict):
                video_url = video_url.get("url", "")
            return {"video_url": video_url}
        elif status == "failed":
            print(f"  FAILED: {json.dumps(data, ensure_ascii=False)[:300]}")
            return None

        time.sleep(10)

    print(f"  TIMEOUT after {max_wait}s")
    return None


def download_file(url, filepath):
    if not url:
        print(f"  No URL to download")
        return False
    print(f"  Downloading...")
    with httpx.stream("GET", url, timeout=300) as r:
        if r.status_code == 200:
            with open(filepath, "wb") as f:
                for chunk in r.iter_bytes():
                    f.write(chunk)
            size_mb = os.path.getsize(filepath) / (1024 * 1024)
            print(f"  Saved: {filepath} ({size_mb:.1f} MB)")
            return True
        else:
            print(f"  Download failed: HTTP {r.status_code}")
            return False


def main():
    results = []
    print("=== Seedance 2.5 Video Generation ===")
    print(f"Generating {len(videos)} videos...\n")

    # 1. Submit all tasks in parallel
    task_ids = []
    for i, v in enumerate(videos):
        print(f"[{i+1}/{len(videos)}] {v['name']}")
        tid = submit_task(v)
        if tid:
            task_ids.append({"name": v["name"], "id": tid})
        print()

    # 2. Poll and download
    for item in task_ids:
        print(f"[{item['name']}] Waiting for completion...")
        result = poll_task(item["id"])

        if result and result.get("video_url"):
            video_path = os.path.join(OUTPUT_DIR, f"{item['name']}.mp4")
            download_file(result["video_url"], video_path)

            results.append({
                "name": item["name"],
                "video": video_path,
                "video_url": result["video_url"]
            })
        else:
            print(f"  Failed to generate {item['name']}")
        print()

    # 3. Save results
    results_file = os.path.join(OUTPUT_DIR, "results.json")
    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n=== Done! {len(results)}/{len(videos)} videos generated ===")
    for r in results:
        print(f"  - {r['name']}: {r['video']}")


if __name__ == "__main__":
    main()

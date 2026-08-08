import sys
import os
import asyncio
sys.path.insert(0, r"C:\Users\huang\.trae-cn\skills\byted-seedance-video-generate\scripts")
from video_generate import video_generate
import json

API_KEY = "VxCgNvLTE.ChBobU4za3ZXYjgzRjNxSVlvEIHU7_YHGAEqEKORaxQY1k0jokGmVjhPZgk.f7-HSGm5_VF9CNmNZKMbwBogz1bBaaoYwlg3atycMpRs0JT2DGUcgVZjV8BjOmg9LkhP8zRXKKYkmF_qKGZsmweZ"
os.environ["ARK_API_KEY"] = API_KEY

videos = [
    {
        "video_name": "dashboard-bg-dark",
        "prompt": "Abstract dark tech background with flowing aurora-like light streaks, deep navy blue and purple gradients, subtle golden particles floating, futuristic cyberpunk aesthetic, 4K quality, smooth camera movement, cinematic lighting, no text",
        "ratio": "16:9",
        "duration": 6,
        "resolution": "720p",
    },
    {
        "video_name": "geometric-abstract",
        "prompt": "Animated geometric shapes floating in space, rotating triangles and hexagons, dark background with neon blue and purple glow, modern minimalist motion design, 4K, smooth slow motion, elegant camera pan",
        "ratio": "16:9",
        "duration": 5,
        "resolution": "720p",
    },
    {
        "video_name": "particle-flow",
        "prompt": "Elegant particle flow animation, thousands of glowing particles forming abstract patterns, dark background with blue and teal color scheme, dreamy atmosphere, 4K, smooth flowing motion",
        "ratio": "16:9",
        "duration": 5,
        "resolution": "720p",
    },
]

print(f"Starting generation of {len(videos)} videos...")
result = asyncio.run(video_generate(videos, max_wait_seconds=600))
print(json.dumps(result, indent=2, ensure_ascii=False))

# Save results
with open("f:/项目/Personal-Resume/seeds_result.json", "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2, ensure_ascii=False)
print("Results saved to seeds_result.json")
import requests
import json
import os

os.makedirs('docs/stitch_ui', exist_ok=True)
headers = {"X-Goog-Api-Key": "AQ.Ab8RN6JmbOhDjVSTVeQNcgkcJY6bRVtevgq-sjbjFjxYsDmDDQ"}
url = "https://stitch.googleapis.com/v1/projects/2765353294196365771/screens"
res = requests.get(url, headers=headers)
data = res.json()

if 'screens' in data:
    for screen in data['screens']:
        screen_id = screen['id']
        name = screen.get('title', screen_id).replace('/', '_')
        print(f"Downloading {name} ({screen_id})...")
        if 'htmlCode' in screen and 'downloadUrl' in screen['htmlCode']:
            download_url = screen['htmlCode']['downloadUrl']
            html_res = requests.get(download_url)
            with open(f"docs/stitch_ui/{name}.html", "w") as f:
                f.write(html_res.text)
        else:
            print("No htmlCode found.")


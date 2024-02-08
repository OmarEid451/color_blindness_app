import requests
url = "https://en.wikipedia.org/wiki/Web_colors"
file_name = "web_colors.html"
page = requests.get(url)
page.raise_for_status()
with open(file_name, "wb") as fhand:
    for chunk in page.iter_content(chunk_size=512):
        fhand.write(chunk)




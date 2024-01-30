import requests

page = requests.get("https://www.colorhexa.com/color-names")
page.raise_for_status()
with open("colorpage2.html", "wb") as fhand:
    for chunk in page.iter_content(chunk_size=512):
        fhand.write(chunk)




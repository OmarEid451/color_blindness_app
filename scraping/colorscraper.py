import requests

page = requests.get("https://en.wikipedia.org/wiki/List_of_colors_(alphabetical)")
page.raise_for_status()
with open("colorpage.html", "wb") as fhand:
    for chunk in page.iter_content(chunk_size=512):
        fhand.write(chunk)




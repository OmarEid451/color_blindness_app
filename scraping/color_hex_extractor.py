from bs4 import BeautifulSoup
import json
color_dict = {}
webpage = open("colorpage2.html")
json_handle = open("colors.json", 'w')
soup = BeautifulSoup(webpage, "html.parser")
colors = soup.find_all("td", style=True)
for tag in colors:
    hex_num = tag['style'].split(':')[1][1:-1]
    color_dict[hex_num] = tag.text

json.dump(color_dict, json_handle)
webpage.close()
json_handle.close()

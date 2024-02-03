from bs4 import BeautifulSoup
import json
color_dict = {}
webpage = open("colorpage2.html")
json_handle = open("colors.json", 'w')
soup = BeautifulSoup(webpage, "html.parser")
colors = soup.find_all("td", style=True)
for tag in colors:
    rgb_values = []
    hex_num = tag['style'].split(':')[1][1:-1]
    for i in range(0, len(hex_num), 2):
        rgb_num = int(hex_num[i:i+2], 16)
        rgb_values.append(rgb_num)
    color_dict[tag.text] = rgb_values

json.dump(color_dict, json_handle, indent=4)
webpage.close()
json_handle.close()

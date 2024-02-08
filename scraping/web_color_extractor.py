from bs4 import BeautifulSoup
import json
import re
color_dict = {}
webpage = open("web_colors.html")
json_handle = open("web_colors.json", 'w')
soup = BeautifulSoup(webpage, "html.parser")

# regex used to ensure only the body of the webcolors table is extracted
color_table = soup.find_all("tr", style=re.compile("background.+color"))

for row in color_table:
    row_data = row.text.split()
    color_name = row_data[0]
    rgb_values = row_data[2:]
    color_dict[color_name] = rgb_values


json.dump(color_dict, json_handle, indent=4)
webpage.close()
json_handle.close()
#sanity debugging
#values = color_table[0].text.split() 
#print((color_table[0].text))
#print(values)
#print(color_dict)

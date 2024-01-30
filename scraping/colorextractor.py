from bs4 import BeautifulSoup

fhand = open("colorpage.html")
soup = BeautifulSoup(fhand, "html.parser")
color_values = soup.find_all("p", title=True)
color_names = soup.find_all("p", style=True)
hex_doc = open("hex_values.txt", 'w')
color_name_doc = open("color_names.txt", 'w')

# extract hex_values
for tag in color_values:
    values = tag['title'].split()
    hex_color = values[-1]
    hex_color = hex_color[1:]
    hex_doc.write(hex_color)
    hex_doc.write('\n')
hex_doc.close()

#extract color names
for tag in color_names:
    color = str(tag.contents[0].string)
    color = color.strip()
    color = color.replace('\n', '')
    color_name_doc.write(color)
    color_name_doc.write('\n')
color_name_doc.close()
fhand.close()

from bs4 import BeautifulSoup

fhand = open("colorpage.html")
soup = BeautifulSoup(fhand, "html.parser")
color_values = soup.find_all("p", title=True)
color_names = soup.find_all("p", style=True)
for tag in color_values:
    values = tag['title'].split()
    hex_color = values[-1]
    hex_color = hex_color[1:]
    print(hex_color)


#extract color names
'''for tag in color_names:
    color = str(tag.contents[0].string)
    color = color.strip()
    print(color)'''
fhand.close()

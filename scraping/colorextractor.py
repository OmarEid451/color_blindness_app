from bs4 import BeautifulSoup

fhand = open("colorpage.html")
soup = BeautifulSoup(fhand, "html.parser")
color_values = soup.find_all("p", title=True)
color_names = soup.find_all("p", style=True)
#for tag in color_values:
 #   print(tag["title"])
for tag in color_names:
    color = str(tag.contents[0].string)
    color = color.strip()
    print(color)
    #print(tag.contents[0])
fhand.close()
#print(color_tables)

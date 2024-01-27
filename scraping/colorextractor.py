from bs4 import BeautifulSoup


soup = BeautifulSoup(open("colorpage.html"), "html.parser")
color_tables = soup.find_all("div", style=True)
print(color_tables)


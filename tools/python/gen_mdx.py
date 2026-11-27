import pathlib

TARGET1 = pathlib.Path("C:/Users/dyshkantiuk_andrii/Desktop/GYNNITECH/src/content/corso/analisi-marketing/modelli-attribuzione.mdx")
TARGET2 = pathlib.Path("C:/Users/dyshkantiuk_andrii/Desktop/GYNNITECH/src/content/corso/analisi-marketing/funnel-unit-economics.mdx")

def build_mdx1():
    L = []
    def a(s=""): L.append(s)
    a("---")
    a("title: "Modelli di Attribuzione"")
    a("description: "Capire quale canale ha generato la conversione."")
    a("module: "Modulo 6: Analisi di Marketing"")
    a("order: 9")
    a("category: "Attribuzione"")
    a("---")
    a()
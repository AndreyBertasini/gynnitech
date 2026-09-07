
## Social listening: dal rumore delle menzioni ai segnali operativi

Il social listening promette di "ascoltare la rete" ma produce spesso nuvole di parole e grafici di sentiment che nessuno usa. Il problema è quasi sempre la domanda: "cosa dicono di noi?" è troppo vaga per generare azioni. Le domande che funzionano sono tre, e ciascuna ha un output diverso.

La prima è brand health: il sentiment peggiora prima delle vendite? Si monitorano volume di menzioni, quota di conversazioni negative e temi emergenti su finestre mobili a 7 giorni, confrontati con la baseline stagionale del brand. Un picco di menzioni negative del 40% sopra baseline con concentrazione su un tema (spedizioni, resi, bug) è un early warning operativo: va al customer care e alle operations, non al report mensile. La soglia va tarata sul rumore di fondo del brand: per un brand con 50 menzioni al giorno, bastano 15 menzioni coordinate per segnalare un problema; per un brand con 5.000, serve una variazione percentuale.

La seconda è competitive intelligence: dove il concorrente viene lodato e noi no? Si confrontano le distribuzioni di temi positivi per brand nella stessa categoria. Se il 30% delle lodi al concorrente riguarda "consegna in 24 ore" e per te quella quota è al 5%, hai trovato un gap di posizionamento o di servizio, non un problema di creatività.

La terza è product insight: cosa chiedono gli utenti che il prodotto non fa? Si estraggono pattern linguistici ricorrenti ("sarebbe bello se", "peccato che non", "quando arriva") dai commenti e dalle recensioni. Bastano poche centinaia di testi codificati manualmente per validare le categorie, prima di automatizzare.

Sul sentiment, serve onestà tecnica: i modelli lessicali generici funzionano male sull'italiano colloquiale dei social, dove ironia, dialetto ed emoji ribaltano il significato. Il codice qui sotto usa un approccio a soglie su polarità, adatto a una prima esplorazione ma non a decisioni delicate. In produzione, i team seri validano il classificatore su 300-500 commenti etichettati a mano e riportano precisione e richiamo per classe, invece di fidarsi del punteggio grezzo.

```python
# Analisi esplorativa del sentiment sui commenti social.
# Da usare come prima scrematura: le classi vanno validate a mano.
from textblob import TextBlob

# Lista di commenti reali esportati dal profilo (ultimi 7 giorni).
comments = [
    "Questo prodotto è assolutamente fantastico, ha cambiato la mia routine!",
    "La spedizione è stata un disastro, tre settimane di ritardo e pacco danneggiato.",
    "Non male, fa il suo lavoro. Forse un po' caro.",
    "Lo adoro! Lo comprerò di nuovo sicuramente. Consigliatissimo.",
    "Pessima esperienza con il servizio clienti, non rispondono mai.",
    "Il prodotto è ok, ma la descrizione sul sito non era chiara.",
]

# Soglie simmetriche: sopra 0.1 positivo, sotto -0.1 negativo, resto neutro.
SOGLIA_POSITIVO = 0.1
SOGLIA_NEGATIVO = -0.1

positivi = negativi = neutri = 0

print("Analisi del sentiment dei commenti:")
for commento in comments:
    # TextBlob restituisce polarity in [-1, 1]; su testi italiani
    # brevi il punteggio è rumoroso: serve validazione manuale.
    polarita = TextBlob(commento).sentiment.polarity
    if polarita > SOGLIA_POSITIVO:
        etichetta, positivi = "Positivo", positivi + 1
    elif polarita < SOGLIA_NEGATIVO:
        etichetta, negativi = "Negativo", negativi + 1
    else:
        etichetta, neutri = "Neutro", neutri + 1
    print(f"- {commento[:50]}... -> {etichetta} ({polarita:.2f})")

# Score netto: positivo se sopra 0, negativo se sotto; con pochi
# commenti l'intervallo di confidenza è largo, non sovra-interpretarlo.
denominatore = max(1, positivi + negativi)
punteggio = (positivi - negativi) / denominatore
print(f"\nScore complessivo: {punteggio:.2f}")
print(f"Dettaglio: {positivi} positivi, {neutri} neutri, {negativi} negativi")
```

Il punto non è il punteggio in sé ma la serie storica: un brand con score stabile a 0,4 che scende a 0,1 in una settimana ha un problema, anche se il numero resta "positivo". E i commenti neutri non sono scarti: spesso contengono le richieste di prodotto più utili, perché chi è arrabbiato insulta e chi è entusiasta loda, mentre chi scrive "non male, ma" sta descrivendo esattamente cosa manca.

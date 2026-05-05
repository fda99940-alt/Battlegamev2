# Interviewfragen für Senior Softwareentwickler

## Grundsätzlich

- **Frage:** Was sind die wichtigsten Prinzipien von Clean Code?
  - **Antwort:** Klarheit und Lesbarkeit stehen im Vordergrund: sprechende Namen, kleine Funktionen mit einer Verantwortung, geringe Kopplung und hohe Kohäsion. Zusätzlich wichtig sind konsistenter Stil, sauberes Error-Handling, aussagekräftige Tests und kontinuierliches Refactoring, damit der Code langfristig wartbar bleibt.

- **Frage:** Wie definieren Sie technische Schulden und wie gehen Sie damit um?
  - **Antwort:** Technische Schulden sind Kompromisse in Architektur, Code oder Prozessen, die kurzfristig Zeit sparen, aber spätere Änderungen teurer machen. Ich mache sie sichtbar (Tickets, ADRs, Code-Kommentare), bewerte Risiko und Business-Impact und plane den Abbau aktiv ein, zum Beispiel über Refactoring-Budgets pro Sprint, Boy-Scout-Rule und Qualitäts-Gates in CI.

- **Frage:** Was ist der Unterschied zwischen agiler Entwicklung und Wasserfallmodell?
  - **Antwort:** Agile Entwicklung ist iterativ und inkrementell: kurze Zyklen, frühes Feedback, laufende Priorisierung und schnelle Anpassung an neue Anforderungen. Das Wasserfallmodell folgt festen, sequenziellen Phasen mit späterem Feedback und hoher Planungsstabilität, ist aber deutlich weniger flexibel bei Änderungen.

- **Frage:** Wie messen Sie Codequalität in einem Projekt?
  - **Antwort:** Ich kombiniere qualitative und quantitative Signale: strukturierte Code Reviews, statische Analyse (Linting, Security, Smells), Testpyramide (Unit-, Integrations-, End-to-End-Tests) und Metriken wie Coverage, zyklomatische Komplexität, Duplication und Defect-Rate. Ergänzend nutze ich Architektur-Checks und beobachte Runtime-Indikatoren wie Fehlerraten und Performance.

## Angular

- **Frage:** Was ist der Unterschied zwischen `ngOnInit` und dem Konstruktor in einer Angular-Komponente?
  - **Antwort:** Der Konstruktor ist für Dependency Injection und minimale Objektinitialisierung gedacht und sollte keine Angular-Lifecycle-Logik enthalten. `ngOnInit` läuft, nachdem Angular Inputs gesetzt hat, und ist der richtige Ort für Initialdaten, Subscriptions und Initialisierungslogik, die vom Komponentenstatus abhängt.

- **Frage:** Wie funktioniert das Angular Change Detection System?
  - **Antwort:** Angular führt Change-Detection-Zyklen aus und prüft gebundene Werte im Komponentenbaum. Standardmäßig stößt Zone.js diese Zyklen bei asynchronen Ereignissen an. Mit `OnPush` kann man Prüfungen gezielt reduzieren; dann werden Updates typischerweise über neue Referenzen, Events, `async`-Pipe oder `ChangeDetectorRef` getriggert.

- **Frage:** Was sind Reactive Forms und wann verwendet man sie?
  - **Antwort:** Reactive Forms sind modellgetriebene Formulare mit `FormControl`, `FormGroup` und `FormArray`. Sie eignen sich besonders für komplexe Formulare mit dynamischen Feldern, zusammengesetzten Validierungen, klarer Testbarkeit und wenn Formzustände programmatisch gesteuert oder mit RxJS verarbeitet werden sollen.

- **Frage:** Wie teilen Sie Daten zwischen Angular-Komponenten?
  - **Antwort:** Zwischen Parent und Child nutze ich `@Input` und `@Output`. Für entfernte Komponenten verwende ich Services mit RxJS (`Subject`/`BehaviorSubject`) oder bei komplexem Zustand ein State-Management wie NgRx. `@ViewChild` nutze ich nur gezielt für enge Kopplung im gleichen View-Kontext.

## C#

- **Frage:** Was sind die wichtigsten Unterschiede zwischen `interface` und `abstract class`?
  - **Antwort:** Ein `interface` beschreibt primär einen Vertrag (was ein Typ können muss) und erlaubt Mehrfachimplementierung. Eine `abstract class` kann zusätzlich gemeinsamen Zustand, Basisimplementierungen, geschützte Methoden und Konstruktorlogik bereitstellen. Faustregel: Interface für Fähigkeiten/Abstraktionen, abstrakte Klasse für gemeinsam genutztes Verhalten.

- **Frage:** Was ist async/await und wie verbessert es die C#-Programmierung?
  - **Antwort:** `async/await` vereinfacht asynchronen Code, indem er wie synchron lesbar bleibt, intern aber nicht-blockierende `Task`-basierte Ausführung nutzt. Das verbessert vor allem Skalierbarkeit bei I/O-lastigen Workloads (HTTP, Datenbank, Dateien), reduziert Thread-Blockierung und erleichtert Fehlerbehandlung mit `try/catch`.

- **Frage:** Wie funktioniert Garbage Collection in .NET?
  - **Antwort:** Der .NET-GC verwaltet den Managed Heap automatisch und räumt nicht mehr erreichbare Objekte auf. Er arbeitet generationsbasiert (Gen 0, 1, 2 plus LOH), weil kurzlebige Objekte häufig sind. Dabei werden Speicherbereiche verdichtet, um Fragmentierung zu reduzieren. Für unmanaged Ressourcen bleibt `IDisposable` mit `using` wichtig.

- **Frage:** Was sind `Span<T>` und `Memory<T>` und warum sind sie nützlich?
  - **Antwort:** `Span<T>` und `Memory<T>` erlauben effiziente Sichten auf zusammenhängende Daten ohne zusätzliche Allokationen oder Kopien. `Span<T>` ist ein stack-only Typ für synchrone, kurzlebige Verarbeitung; `Memory<T>` ist heap-fähig und für asynchrone Szenarien nutzbar. Das ist besonders wertvoll in Performance-kritischen Pipelines wie Parsing, Protokoll- oder Stream-Verarbeitung.

## SQL Server

- **Frage:** Was sind die Vorteile von Indexen in SQL Server?
  - **Antwort:** Indexe beschleunigen Lesezugriffe, Filter, Sortierung und Joins deutlich, weil weniger Daten gescannt werden müssen. Gute Indexstrategien können zudem Abfragen als Covering Index bedienen. Nachteile sind zusätzlicher Speicherbedarf, höhere Kosten bei `INSERT/UPDATE/DELETE` und Wartungsaufwand bei Fragmentierung oder falscher Indexwahl.

- **Frage:** Was ist der Unterschied zwischen `INNER JOIN` und `LEFT JOIN`?
  - **Antwort:** `INNER JOIN` liefert nur Datensätze mit Treffer auf beiden Seiten. `LEFT JOIN` liefert alle Zeilen der linken Tabelle und ergänzt fehlende rechte Treffer mit `NULL`. Wichtig in der Praxis: Filter auf rechten Spalten im `WHERE` können einen `LEFT JOIN` unbeabsichtigt wie einen `INNER JOIN` wirken lassen.

- **Frage:** Wie gehen Sie mit Sperren (`locks`) und Deadlocks in SQL Server um?
  - **Antwort:** Ich reduziere Konflikte durch kurze, klare Transaktionen, konsistente Zugriffsreihenfolge, passende Indizes und möglichst kleine betroffene Datenmengen. Zusätzlich wähle ich Isolationsebenen bewusst (z. B. Read Committed Snapshot), analysiere Deadlock-Graphs und implementiere Retry-Strategien für transiente Fehler.

- **Frage:** Was ist der Unterschied zwischen `CHAR` und `VARCHAR`?
  - **Antwort:** `CHAR(n)` speichert immer exakt `n` Zeichen (mit Padding), `VARCHAR(n)` nur die tatsächlich benötigte Länge plus Overhead. `CHAR` passt bei stabilen Fixlängenwerten (z. B. Codes), `VARCHAR` bei variablen Texten. Die Wahl beeinflusst Speicher, I/O und teilweise Indexeffizienz.

## System Architektur

- **Frage:** Was ist der Unterschied zwischen monolithischer Architektur und Microservices?
  - **Antwort:** Ein Monolith bündelt Fachlichkeiten in einer deploybaren Einheit, was Entwicklung und Betrieb zu Beginn oft vereinfacht. Microservices schneiden Fachdomänen in unabhängig deploybare Services mit eigener Skalierung und Technologiehoheit. Dafür steigen Komplexität in Observability, verteilten Transaktionen, Datenkonsistenz und Plattformbetrieb.

- **Frage:** Wie bestimmen Sie, ob ein System eher den Schichten- oder die hexagonale Architektur nutzen sollte?
  - **Antwort:** Ich entscheide anhand von Domänenkomplexität, Lebensdauer und Integrationsbedarf. Schichtenarchitektur ist oft ausreichend für CRUD-lastige, überschaubare Systeme. Hexagonale Architektur lohnt sich bei komplexer Domäne, vielen externen Abhängigkeiten und hohem Testbarkeitsanspruch, weil die Fachlogik sauber von Infrastruktur entkoppelt bleibt.

- **Frage:** Was sind die wichtigsten Kriterien für eine skalierbare Architektur?
  - **Antwort:** Wichtige Kriterien sind lose Kopplung, stateless Services für horizontale Skalierung, klare Daten- und Zuständigkeitsgrenzen, Caching, asynchrone Entkopplung und resiliente Kommunikation (Timeouts, Retries, Circuit Breaker). Ergänzend braucht es Observability (Logs, Metrics, Tracing), Automatisierung und Kapazitätsplanung unter realistischen Lastprofilen.

- **Frage:** Wie definieren Sie Event-Driven Architecture und wann wird sie eingesetzt?
  - **Antwort:** Event-Driven Architecture verwendet Ereignisse als zentrales Kommunikationsmodell: Produzenten veröffentlichen Events, Konsumenten reagieren asynchron darauf. Das eignet sich für entkoppelte, reaktive Systeme mit hohem Durchsatz, Integrationsbedarf oder near-realtime Reaktionen. Wichtig sind dabei Idempotenz, Event-Versionierung, Fehlertoleranz und Nachvollziehbarkeit.

## Praktische Fragen (Erfahrung erkennen)

- **Frage:** Erzählen Sie von einem Produktionsvorfall, den Sie selbst gelöst haben. Wie sind Sie konkret vorgegangen?
  - **Antwort:** Ich beschreibe den Impact (wer war betroffen), dann meine strukturierte Vorgehensweise: Triage, Hypothesen, Logs/Metriken/Tracing prüfen, kurzfristige Stabilisierung (Rollback/Feature-Flag), Root-Cause-Analyse und nachhaltige Maßnahmen. Wichtig ist, dass ich nicht nur „gefunden“, sondern auch Prävention umgesetzt habe.

- **Frage:** Nennen Sie ein Beispiel, bei dem Sie Performance messbar verbessert haben.
  - **Antwort:** Eine belastbare Antwort enthält Baseline, Messmethode und Ergebnis, z. B. API-Latenz von 800 ms auf 250 ms durch Query-Optimierung, Caching und Reduktion von N+1-Queries. Zusätzlich sollte der Kandidat benennen, wie Regressionen verhindert wurden (Monitoring, Lasttests, Alerts).

- **Frage:** Wie gehen Sie vor, wenn eine Anforderung fachlich unklar ist, aber der Zeitdruck hoch ist?
  - **Antwort:** Ich schneide die Anforderung in kleine, testbare Inkremente, kläre offene Punkte früh mit Product/Stakeholdern, dokumentiere Annahmen transparent und liefere zuerst den risikoärmsten Kernnutzen. So bleibt Delivery-Geschwindigkeit hoch, ohne Qualitätsverlust zu verstecken.

- **Frage:** Beschreiben Sie eine schwierige Refactoring- oder Migrationsaufgabe aus Ihrer Praxis.
  - **Antwort:** Ich erläutere Zielbild, Risiken und Migrationsstrategie (strangler pattern, inkrementelle Umstellung, Parallelbetrieb, Backward Compatibility). Gute Senior-Antworten enthalten außerdem Rollback-Plan, Datenmigration, Monitoring und klare Exit-Kriterien.

- **Frage:** Wie stellen Sie in einem Team sicher, dass Code-Reviews wirklich Qualität erhöhen?
  - **Antwort:** Durch klare Review-Standards (Lesbarkeit, Testbarkeit, Sicherheit, Architektur), kleine PRs, schnelle Feedbackzyklen und konstruktive Kommunikation. Erfahrene Kandidaten sprechen auch über Review-Ownership, Wissensaustausch und Metriken wie Defect-Leakage oder Lead Time.

- **Frage:** Geben Sie ein Beispiel, wie Sie Tests strategisch eingesetzt haben statt nur Coverage zu erhöhen.
  - **Antwort:** Ich fokussiere risikobasierte Tests: kritische Business-Flows als Integrations- oder End-to-End-Tests absichern, Kernlogik mit Unit-Tests schnell validieren und fragile Tests reduzieren. Entscheidend ist, dass Tests Vertrauen für Deployments schaffen und reale Fehler früh erkennen.

- **Frage:** Wie haben Sie ein fachliches oder technisches Konzept im Team eingeführt, das zunächst auf Widerstand stieß?
  - **Antwort:** Ich starte mit einem kleinen Pilot, mache Nutzen und Kosten sichtbar und hole Feedback früh ein. Statt „Big Bang“ liefere ich messbare Ergebnisse und passe den Ansatz an Teamrealität an. So entsteht Akzeptanz durch Evidenz statt durch Vorgaben.

- **Frage:** Woran erkennen Sie, dass ein System architektonisch „kippt“, und was tun Sie dann?
  - **Antwort:** Warnsignale sind steigende Change-Failure-Rate, lange Durchlaufzeiten, hohe Kopplung, wiederkehrende Incidents und sinkende Liefergeschwindigkeit. Dann priorisiere ich gezielte Architekturmaßnahmen (Schnittstellen klären, Verantwortlichkeiten schneiden, technische Schulden abbauen) mit klaren Business-Zielen.

## Security-relevante Fragen in der Entwicklung

- **Frage:** Was sind die häufigsten Sicherheitsrisiken in Webanwendungen?
  - **Antwort:** Typische Risiken sind Injection (z. B. SQL Injection), Broken Access Control, unsichere Authentifizierung, Sicherheitsfehlkonfigurationen, XSS und veraltete/vulnerable Abhängigkeiten. Gute Kandidaten kennen OWASP Top 10 und können konkrete Gegenmaßnahmen nennen.

- **Frage:** Wie verhindern Sie SQL Injection in der Praxis?
  - **Antwort:** Durch parametrisierte Queries/Prepared Statements, niemals String-Konkatenation für SQL, minimale Datenbankrechte und zusätzliche Eingabevalidierung. ORMs helfen, ersetzen aber keine sicheren Query-Praktiken.

- **Frage:** Was ist der Unterschied zwischen Authentifizierung und Autorisierung?
  - **Antwort:** Authentifizierung prüft, wer ein Benutzer ist; Autorisierung prüft, was dieser Benutzer darf. Beides muss konsequent serverseitig durchgesetzt werden.

- **Frage:** Wie sichern Sie Passwörter korrekt?
  - **Antwort:** Passwörter nie im Klartext speichern, sondern mit adaptiven Passwort-Hash-Verfahren wie Argon2, bcrypt oder PBKDF2 plus Salt. Zusätzlich sinnvoll sind MFA, Rate Limits, Account-Lockout und sichere Passwort-Reset-Flows.

- **Frage:** Was ist XSS und wie vermeiden Sie es?
  - **Antwort:** XSS ist das Einschleusen von Skriptcode in Seiteninhalte. Gegenmaßnahmen sind Output-Encoding, sichere Template-Standards des Frameworks, strikte Content Security Policy (CSP) und Verzicht auf unsichere DOM-APIs.

- **Frage:** Wie gehen Sie mit Secrets wie API-Keys oder DB-Passwörtern um?
  - **Antwort:** Secrets gehören nicht in Code oder Git, sondern in Secret-Management (z. B. Vault, Cloud Secret Manager) und sichere Runtime-Konfiguration. Rotation, Least Privilege, Audit-Logging und getrennte Secrets pro Umgebung sind Pflicht.

- **Frage:** Welche Rolle spielt HTTPS/TLS in modernen Anwendungen?
  - **Antwort:** TLS schützt Vertraulichkeit und Integrität der Datenübertragung und ist Standard für alle Umgebungen, nicht nur Produktion. Wichtig sind korrekte Zertifikatsverwaltung, HSTS und das Vermeiden unsicherer Protokolle/Cipher.

- **Frage:** Wie würden Sie Zugriff in APIs absichern?
  - **Antwort:** Mit robustem AuthN/AuthZ-Konzept (z. B. OAuth2/OIDC), kurzen Token-Laufzeiten, Scope-basierten Rechten, serverseitiger Prüfung jeder Anfrage und Schutzmaßnahmen wie Rate Limiting und Abuse Detection.

- **Frage:** Was bedeutet „Least Privilege“ und wie setzen Sie es um?
  - **Antwort:** Jeder Dienst und Benutzer bekommt nur die minimal notwendigen Rechte. Umsetzung über getrennte Service-Accounts, fein granularen Rollen, zeitlich begrenzte Berechtigungen und regelmäßige Rechte-Reviews.

- **Frage:** Wie integrieren Sie Security in den Entwicklungsprozess?
  - **Antwort:** Security-by-Design mit Threat Modeling, Secure Coding Guidelines, verpflichtenden Reviews, SAST/DAST/Dependency-Scans in CI/CD und klaren Prozessen für Patch- und Vulnerability-Management.

- **Frage:** Was ist CSRF und wann ist es relevant?
  - **Antwort:** CSRF nutzt bestehende Session-Kontexte aus, um ungewollte Aktionen im Namen eines Nutzers auszuführen. Relevanz besonders bei Cookie-basierter Authentifizierung; Schutz durch CSRF-Tokens, SameSite-Cookies und Origin/Referer-Prüfung.

- **Frage:** Wie reagieren Sie auf eine gemeldete kritische Sicherheitslücke in Produktion?
  - **Antwort:** Erst Risiko und Exploitierbarkeit bewerten, dann schnell mitigieren (Feature abschalten, WAF-Regel, Access einschränken), Patch bereitstellen und kontrolliert ausrollen. Danach Incident-Analyse, Kommunikation an Stakeholder und nachhaltige Prävention.

## API-Entwicklung

- **Frage:** Was macht eine gute API aus?
  - **Antwort:** Eine gute API ist konsistent, verständlich, stabil versionierbar und gut dokumentiert. Sie nutzt klare Ressourcenmodelle, sinnvolle Statuscodes, nachvollziehbare Fehlermeldungen und hat nicht-funktionale Qualitäten wie Sicherheit, Performance und Beobachtbarkeit von Anfang an eingeplant.

- **Frage:** Wie designen Sie REST-Endpunkte für Lesbarkeit und Wartbarkeit?
  - **Antwort:** Ich orientiere mich an Ressourcen statt Aktionen, nutze konsistente Namenskonventionen (`/orders`, `/orders/{id}`), verwende HTTP-Methoden semantisch korrekt und halte Payloads stabil. Zusätzlich achte ich auf saubere Trennung zwischen API-Vertrag und interner Implementierung.

- **Frage:** Welche HTTP-Statuscodes sollten Entwickler sicher beherrschen?
  - **Antwort:** Mindestens `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `429` und `500`. Entscheidend ist nicht nur das Auswendiglernen, sondern die konsistente Anwendung, damit Clients Fehler korrekt behandeln können.

- **Frage:** Wie gestalten Sie Fehlerantworten in APIs?
  - **Antwort:** Fehlerantworten sollten ein einheitliches Schema haben (Code, Message, Details, Correlation-ID), keine sensiblen Interna leaken und für Clients maschinenlesbar sein. Gute APIs unterscheiden klar zwischen Validierungsfehlern, Berechtigungsproblemen und Systemfehlern.

- **Frage:** Wann und wie versionieren Sie APIs?
  - **Antwort:** Versioniert wird vor allem bei Breaking Changes. Ich bevorzuge klare Strategien wie Pfadversionierung (`/v1`) oder Header-basiert, kombiniere das mit Deprecation-Policy, Migrationshinweisen und Sunset-Zeiträumen, damit Konsumenten planbar migrieren können.

- **Frage:** Wie setzen Sie Pagination, Filtering und Sorting um?
  - **Antwort:** Für Listenendpunkte nutze ich konsistente Query-Parameter (`page`, `size`, `sort`, Filterfelder) und liefere Metadaten wie Gesamtanzahl oder Cursor-Informationen. Bei großen Datenmengen ist Cursor-basierte Pagination oft stabiler und performanter als Offset-basierte Verfahren.

- **Frage:** Was bedeutet Idempotenz bei APIs und warum ist sie wichtig?
  - **Antwort:** Idempotenz bedeutet, dass wiederholte identische Requests denselben Effekt haben. Das ist zentral für robuste Retries bei Netzwerkfehlern, z. B. über `PUT` oder Idempotency-Keys bei `POST`-Operationen wie Zahlungen.

- **Frage:** Wie vermeiden Sie Breaking Changes für API-Consumer?
  - **Antwort:** Durch additive Änderungen, kompatible Defaults, Contract-Tests, frühzeitige Kommunikation und parallelen Betrieb alter/neuer Felder. Breaking Changes werden geplant, versioniert und mit klarer Migrationsdokumentation begleitet.

- **Frage:** Welche Rolle spielt OpenAPI/Swagger in Ihrem API-Prozess?
  - **Antwort:** OpenAPI dient als verbindlicher Vertrag zwischen Teams, unterstützt Mocking, Client-Generierung, Tests und Dokumentation. In reifen Setups ist die Spezifikation Teil der CI-Qualitätssicherung (Linting, Contract-Checks, Breaking-Change-Prüfungen).

- **Frage:** Wie sichern Sie APIs gegen Missbrauch und Überlastung?
  - **Antwort:** Mit Authentifizierung/Autorisierung, Rate Limiting, Quotas, Input-Validierung, Request-Size-Limits und ggf. WAF. Ergänzend helfen Timeouts, Circuit Breaker und Backpressure-Strategien, um Kaskadeneffekte zu vermeiden.

- **Frage:** Wie testen Sie APIs sinnvoll?
  - **Antwort:** Ich kombiniere Unit-Tests für Kernlogik, Integrations-Tests gegen echte Infrastruktur, Contract-Tests zwischen Provider und Consumer sowie End-to-End-Tests für kritische Flows. Wichtig ist, dass Tests sowohl Funktionalität als auch Fehlerfälle und Randbedingungen abdecken.

- **Frage:** Welche Observability-Daten brauchen APIs im Betrieb?
  - **Antwort:** Strukturierte Logs mit Correlation-ID, Metriken (Latenz, Fehlerrate, Throughput, Saturation) und Distributed Tracing. Damit lassen sich Engpässe, Fehlerrouten und Abhängigkeiten schnell identifizieren und SLOs verlässlich überwachen.

## Technische Vokabeln (sollte ein Kandidat kennen)

- **SOLID:** Fünf OO-Prinzipien für wartbares Design (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion).
- **DRY:** „Don’t Repeat Yourself“; Logik nicht unnötig duplizieren.
- **KISS:** „Keep It Simple, Stupid“; einfache Lösungen bevorzugen.
- **YAGNI:** „You Aren’t Gonna Need It“; nur bauen, was aktuell gebraucht wird.
- **Coupling / Kohäsion:** Geringe Kopplung zwischen Modulen, hohe innere Zusammengehörigkeit innerhalb eines Moduls.
- **Refactoring:** Code verbessern ohne externes Verhalten zu ändern.
- **Code Smell:** Hinweis auf mögliches Designproblem (z. B. lange Methoden, God Class).
- **Technical Debt:** Kurzfristige Abkürzung mit langfristigen Wartungskosten.
- **CI/CD:** Kontinuierliche Integration und Auslieferung/Deployment mit automatisierten Pipelines.
- **Unit Test / Integration Test / E2E-Test:** Testen von Einzelteilen, Zusammenspiel und kompletter Nutzerstrecke.
- **Mock / Stub / Fake:** Testdoubles mit unterschiedlichen Zwecken zur Isolation von Abhängigkeiten.
- **Idempotenz:** Mehrfaches Ausführen hat denselben Effekt wie einmaliges Ausführen.
- **Race Condition:** Fehler durch unkontrollierte Reihenfolge gleichzeitiger Zugriffe.
- **Deadlock:** Prozesse/Transaktionen blockieren sich gegenseitig dauerhaft.
- **Thread Safety:** Korrektes Verhalten von Code bei paralleler Ausführung.
- **Big O Notation:** Beschreibung der algorithmischen Komplexität in Abhängigkeit von der Eingabegröße.
- **Latency / Throughput:** Antwortzeit einzelner Requests vs. verarbeitete Menge pro Zeit.
- **Horizontal vs. Vertical Scaling:** Mehr Instanzen vs. größere Instanzen.
- **Load Balancer:** Verteilt Traffic auf mehrere Instanzen.
- **Caching:** Zwischenspeicherung zur Reduktion von Latenz und Last.
- **API Contract:** Verbindliche Schnittstellenbeschreibung (z. B. OpenAPI), auf die sich Client und Server verlassen.
- **Backward Compatibility:** Neue Versionen brechen bestehende Clients nicht.
- **REST:** Ressourcenorientierter API-Stil über HTTP-Methoden und Statuscodes.
- **GraphQL:** Abfragesprache, bei der Clients genau die benötigten Felder anfordern.
- **OAuth 2.0 / OpenID Connect:** Autorisierung bzw. Authentifizierungsschicht auf OAuth.
- **JWT:** Signiertes Token mit Claims für Auth-/Autorisierungsszenarien.
- **ACID:** Transaktionseigenschaften: Atomarität, Konsistenz, Isolation, Dauerhaftigkeit.
- **Isolation Level:** Grad der Abschirmung paralleler Transaktionen (z. B. Read Committed, Serializable).
- **Index (DB):** Datenstruktur zur Beschleunigung von Abfragen.
- **Normalization / Denormalization:** Datenmodellierung zur Reduktion von Redundanz bzw. gezielte Redundanz für Performance.
- **CAP-Theorem:** In verteilten Systemen sind Konsistenz, Verfügbarkeit und Partitionstoleranz nur begrenzt gleichzeitig optimierbar.
- **Eventual Consistency:** Daten werden über Zeit konsistent, nicht zwingend sofort.
- **Message Broker:** Vermittelt asynchrone Kommunikation (Queues/Topics), z. B. RabbitMQ oder Kafka.
- **Observability:** Systemzustand über Logs, Metriken und Traces nachvollziehbar machen.
- **SLA / SLO / SLI:** Vertragliche Verfügbarkeit, Zielwerte und Messindikatoren für Servicequalität.
- **Blue-Green / Canary Deployment:** Risikoarme Rollout-Strategien mit kontrollierter Traffic-Umschaltung.
- **Feature Flag:** Funktion zur Laufzeit aktivieren/deaktivieren ohne neues Deployment.


## Fragen, die Kandidaten dir stellen könnten

- **Frage des Kandidaten:** Wie sieht eure aktuelle Architektur aus und wo sind die größten technischen Herausforderungen?
  - **Worauf es hindeutet:** Der Kandidat denkt systemisch und will verstehen, woran er real arbeiten wird.

- **Frage des Kandidaten:** Wie trefft ihr technische Entscheidungen im Team (z. B. RFCs, ADRs, Architektur-Board)?
  - **Worauf es hindeutet:** Interesse an Engineering-Kultur, Ownership und nachvollziehbaren Entscheidungsprozessen.

- **Frage des Kandidaten:** Wie ist euer Entwicklungsprozess von Ticket bis Deployment?
  - **Worauf es hindeutet:** Der Kandidat achtet auf Delivery-Reife, Geschwindigkeit und Qualitätssicherung.

- **Frage des Kandidaten:** Welche Erwartungen habt ihr an die Rolle in den ersten 30/60/90 Tagen?
  - **Worauf es hindeutet:** Ergebnisorientierung und Wunsch nach klaren Zielen statt nur abstrakter Aufgaben.

- **Frage des Kandidaten:** Wie hoch ist der Anteil an Neuentwicklung vs. Wartung/Refactoring?
  - **Worauf es hindeutet:** Realistischer Blick auf den Arbeitsalltag und Interesse an technischer Nachhaltigkeit.

- **Frage des Kandidaten:** Wie geht ihr mit technischen Schulden konkret um?
  - **Worauf es hindeutet:** Fokus auf langfristige Codequalität und nicht nur kurzfristige Feature-Lieferung.

- **Frage des Kandidaten:** Welche Qualitätsmaßnahmen sind bei euch Pflicht (Tests, Reviews, Security-Checks)?
  - **Worauf es hindeutet:** Qualitätsbewusstsein und Professionalität in der Umsetzung.

- **Frage des Kandidaten:** Wie sieht euer On-Call-/Incident-Modell aus?
  - **Worauf es hindeutet:** Verantwortungsbewusstsein für Betrieb und Interesse an belastbaren Prozessen.

- **Frage des Kandidaten:** Welche Metriken nutzt ihr, um Erfolg im Engineering zu messen?
  - **Worauf es hindeutet:** Der Kandidat denkt in Wirkung, nicht nur in Output (z. B. DORA, SLOs, Defect-Rate).

- **Frage des Kandidaten:** Wie arbeitet ihr mit Product, QA und anderen Teams zusammen?
  - **Worauf es hindeutet:** Kollaborationsfähigkeit und Interesse an funktionierenden Schnittstellen.

- **Frage des Kandidaten:** Welche Lern- und Entwicklungsmöglichkeiten bietet ihr (Mentoring, Weiterbildung, Konferenzen)?
  - **Worauf es hindeutet:** Langfristige Perspektive und Bereitschaft, sich kontinuierlich weiterzuentwickeln.

- **Frage des Kandidaten:** Warum ist die Stelle offen geworden und was wäre in 12 Monaten ein Erfolg in dieser Rolle?
  - **Worauf es hindeutet:** Strategisches Denken, Erwartungsklarheit und ehrliches Interesse am Fit.

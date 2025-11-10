# Vercel Prebuilt Deployment Setup

## Einmalige Einrichtung (nur 1x nötig!)

Um `vercel deploy --prebuilt` zu verwenden, muss das Projekt einmalig verlinkt werden.

### Schritt 1: Projekt verlinken

Öffne PowerShell/Terminal und führe aus:

```powershell
cd C:\Users\mario\dashboard\dashboard-frontend
vercel link
```

**Interaktive Fragen beantworten:**
1. `Set up "~\dashboard\dashboard-frontend"?` → **Y** (Enter)
2. `Which scope?` → Wähle deinen Vercel Account (meist `mariomuja` oder ähnlich)
3. `Link to existing project?` → **Y** (Enter)
4. `What's the name of your existing project?` → **kpi-dashboard-eight** (tippen)

Das war's! Die `.vercel/` Ordner wird erstellt mit der Projekt-Konfiguration.

### Schritt 2: Ab jetzt prebuilt deployment

**Zukünftige Deployments** (nach jedem Code-Change):

```powershell
cd C:\Users\mario\dashboard\dashboard-frontend

# 1. Lokal bauen
npm run build -- --configuration=production

# 2. Prebuilt zu Vercel hochladen
vercel deploy --prebuilt --prod
```

**Vorteile:**
- ⚡ Nur ~30 Sekunden Upload (statt 2-3 Min Build auf Vercel)
- 💰 Spart Vercel Build-Minuten
- 🎯 Garantiert, dass lokaler Build = Production Build

---

## Aktueller Status

**Für JETZT:**
- ✅ Code wurde zu GitHub gepusht
- ✅ Vercel deployed automatisch von GitHub
- ⏱️ Deployment dauert ~2-3 Minuten
- 🔗 URL: https://kpi-dashboard-eight.vercel.app

**Sobald du Schritt 1 einmalig gemacht hast:**
- Alle zukünftigen Deployments können mit dem schnellen prebuilt-Ansatz gemacht werden!

---

## Deployment-Status prüfen

```powershell
vercel ls kpi-dashboard-eight
```

Oder online: https://vercel.com/dashboard

---

## Alternative: GitHub Auto-Deploy

Wenn du `vercel deploy --prebuilt` nicht verwenden möchtest:

**Einfach zu GitHub pushen:**
```powershell
cd C:\Users\mario\dashboard
git add -A
git commit -m "Your message"
git push origin main
```

Vercel deployed automatisch (dauert nur länger).


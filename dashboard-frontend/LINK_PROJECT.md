# Vercel Projekt einmalig verlinken

## WICHTIG: Dies muss nur EINMAL gemacht werden!

Führen Sie diese Befehle aus:

```powershell
cd C:\Users\mario\dashboard\dashboard-frontend

# 1. Aktuelles (falsches) Projekt entfernen
Remove-Item .vercel -Recurse -Force -ErrorAction SilentlyContinue

# 2. Richtiges Projekt verlinken
vercel link
```

## Bei den Fragen antworten:

1. **Set up ...?** → **Y** (Enter drücken)
2. **Which scope?** → **mario-muja** auswählen
3. **Link to existing project?** → **Y** (Enter drücken)
4. **What's the name of your existing project?** → **international-kpi-dashboard** (tippen + Enter)

## Danach für ALLE zukünftigen Deployments:

```powershell
# 1. Lokal bauen
npm run build -- --configuration=production

# 2. Vercel Output erstellen
.\deploy-prebuilt.ps1

# 3. Prebuilt deployen (NUR 3-5 Sekunden!)
vercel deploy --prebuilt --prod
```

## ⚡ Vorteil:

- **Ohne prebuilt**: 2-3 Minuten Build auf Vercel
- **Mit prebuilt**: 3-5 Sekunden Upload! 🚀

---

**Aktueller Status:** Das .vercel Verzeichnis zeigt auf das **falsche** Projekt (`dashboard-frontend`).  
**Bitte führen Sie die obigen Schritte aus**, dann funktioniert prebuilt deployment zum richtigen Projekt!


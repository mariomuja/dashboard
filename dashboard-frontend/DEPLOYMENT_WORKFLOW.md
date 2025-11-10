# ⚡ Korrekter Deployment Workflow

## 📋 Einmalige Setup (NUR 1x nötig!)

```powershell
cd C:\Users\mario\dashboard\dashboard-frontend

# Projekt verlinken
.\link-correct-project.ps1

# ODER manuell:
vercel link
# → Set up? Y
# → Scope? mario-muja
# → Link to existing? Y
# → Project name? international-kpi-dashboard
```

---

## 🚀 JEDES Deployment (nach dem Setup)

```powershell
cd C:\Users\mario\dashboard\dashboard-frontend

# 1. Lokal bauen (30-40 Sekunden)
npm run build -- --configuration=production

# 2. Vercel Output erstellen
.\deploy-prebuilt.ps1

# 3. Prebuilt deployen (nur 3-5 Sekunden!)
vercel deploy --prebuilt --prod
```

**Fertig!** ✅

---

## 🎯 Deployment URLs

Nach erfolgreichem Deployment:

- **Production**: https://international-kpi-dashboard.vercel.app
- **Inspect**: Im Terminal-Output nach dem Deployment

---

## ⚠️ Wichtig

- **NIEMALS** `git push` für Production Deployments nutzen
- **IMMER** prebuilt deployment nutzen [[memory:10993921]]
- **NUR** `git push` für Code-Backup

---

## 🐛 Debug Logs

Nach Deployment:

1. Öffne: https://international-kpi-dashboard.vercel.app
2. F12 → Console Tab
3. Schaue die Logs:
   - `[KPI Config] Fetching data for: ...`
   - `[KPI Config] parseValue input: ...`
   - `[KPI Config] ✓ Found match` oder `✗ No match`

Diese zeigen GENAU, warum KPIs NaN zeigen!


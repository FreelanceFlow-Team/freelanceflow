# Feature: Invoice PDF Email Delivery

## Overview

Lorsqu'une facture est créée via l'API, un PDF est automatiquement généré et envoyé par email au client concerné.

**Statut**: ✅ Implémenté et prêt à l'emploi

---

## Fonctionnalités

- ✅ **Auto-génération du PDF** après création de facture
- ✅ **Envoi email automatique** au client avec PDF en pièce jointe
- ✅ **Non-bloquant**: Erreur d'email n'empêche pas la création de facture
- ✅ **Logging détaillé**: Tous les envois sont loggés
- ✅ **Configuration flexible**: Test mode (dev) et SMTP réel (prod)
- ✅ **Gestion des erreurs**: Erreurs loggées sans interruption

---

## Flux d'exécution

```
POST /api/invoices
    ↓
1. Création de la facture en DB
2. Calcul automatique: subtotal, taxes, total
3. Création de lignes d'invoice
    ↓
4. [ASYNC] Génération du PDF
5. [ASYNC] Envoi email au client avec PDF attaché
    ↓
6. API retourne la facture (immédiatement)
7. Email envoyé en background (non-bloquant)
```

---

## Configuration

### Développement (Mode Test - Défaut)

Le mode test n'envoie pas d'emails réels mais les logue uniquement:

```bash
# .env
NODE_ENV=development
EMAIL_FROM=noreply@freelanceflow.app
SMTP_HOST=        # Vide = mode test
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
```

**Logs attendus**:

```
[NestFactory] Starting NestApplication...
[AppModule] Initializing application...
[EmailService] EMAIL: Using test email configuration (development mode)
[EmailService] Invoice PDF sent to client@example.com (message ID: test-message-id-123)
```

### Production (SMTP Réel)

Pour envoyer des emails véritables:

```bash
# .env ou variables d'environnement
NODE_ENV=production
EMAIL_FROM=noreply@freelanceflow.app
SMTP_HOST=smtp.gmail.com          # ou Mailgun, SendGrid, etc.
SMTP_PORT=587
SMTP_SECURE=false                 # true si port 465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password   # Ou API key selon le service
```

---

## Exemple d'utilisation

### 1. Créer une facture

```bash
curl -X POST http://localhost:3010/api/invoices \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-uuid-123",
    "issueDate": "2026-04-14T10:00:00Z",
    "dueDate": "2026-05-14T10:00:00Z",
    "taxRate": 20,
    "notes": "Merci pour votre confiance!",
    "lines": [
      {
        "description": "Services de consulting - 8 heures",
        "quantity": 8,
        "unitPrice": 150.00
      }
    ]
  }'
```

### 2. Email reçu par le client

**Subject**: `Facture FF-2026-001 - FreelanceFlow`

**Contenu**:

```
Bonjour Acme Corp,

Veuillez trouver ci-joint la facture FF-2026-001 de Jean Dupont.

Merci de votre confiance.

---
Cet email a été généré automatiquement par FreelanceFlow
```

**Pièce jointe**: `facture-FF-2026-001.pdf`

---

## Structure des fichiers créés/modifiés

### Fichiers Créés

- **`apps/api/src/email/email.service.ts`**
  - Service d'envoi d'emails via Nodemailer
  - Support modes dev/prod
  - Logging détaillé

- **`apps/api/src/email/email.module.ts`**
  - Module NestJS pour EmailService
  - Exportable dans d'autres modules

### Fichiers Modifiés

- **`apps/api/src/app.module.ts`**
  - Ajout EmailModule aux imports

- **`apps/api/src/invoices/invoices.module.ts`**
  - Ajout EmailModule et PdfModule aux imports

- **`apps/api/src/invoices/invoices.service.ts`**
  - Injection de PdfService et EmailService
  - Méthode `create()` rendue async
  - Nouvelle méthode privée `sendInvoicePdfToClient()`

- **`apps/api/src/invoices/invoices.controller.ts`**
  - Méthode `create()` rendue async

- **`apps/api/.env.example`**
  - Ajout variables de configuration email

- **`apps/api/package.json`**
  - Ajout nodemailer v6.9.8
  - Ajout @types/nodemailer v6.4.14

---

## Gestion des erreurs

### Erreur réseau/SMTP

Si le serveur SMTP est indisponible:

- Email n'est pas envoyé
- Erreur loggée dans console
- **Facture quand même créée** (non-bloquant)

### Email invalide du client

Si `client.email` n'existe pas:

- Génération du PDF réussit
- Envoi échoue (client.email is required)
- Erreur loggée: "Failed to send invoice PDF"
- **Facture quand même créée**

### Erreur génération PDF

Si la génération du PDF échoue:

- Email n'est pas envoyé
- Erreur loggée
- **Facture quand même créée**

---

## Monitoring et Debugging

### Logs à vérifier

```bash
# Terminal backend
npm run dev

# Chercher les logs:
# ✅ [EmailService] Invoice PDF sent to <email> (message ID: <id>)
# ❌ [EmailService] Failed to send invoice PDF to <email>: <error>
# ⚠️ [EmailService] EMAIL: Using test email configuration
```

### Vérifier la configuration

```bash
# S'assurer que .env existe
ls -la apps/api/.env

# Vérifier les variables
cat apps/api/.env | grep EMAIL
cat apps/api/.env | grep SMTP
```

### Test mode vs Production

```bash
# Mode test (dev)
NODE_ENV=development
SMTP_HOST=""  # Vide

# Mode production
NODE_ENV=production
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your@email.com"
SMTP_PASSWORD="app-password"
```

---

## Fournisseurs SMTP Recommandés

### Gmail

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<app-password>
```

### SendGrid

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.<api-key>
```

### Mailgun

```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@<domain>
SMTP_PASSWORD=<password>
```

---

## Limitations actuelles

- ❌ Pas de retry automatique en cas d'erreur
- ❌ Pas d'historique d'envoi en DB
- ❌ Pas de template HTML personnalisé
- ❌ Pas d'envoi lors de changement de status (sent, paid, etc.)
- ❌ Pas d'option "resend" depuis l'API

---

## Prochaines évolutions possibles

1. **Historique d'envoi**: Ajouter table `EmailLog` pour tracker les envois
2. **Retry policy**: Queue d'emails avec retry programmé
3. **Templates personnalisés**: HTML template avec logo/couleurs branding
4. **Resend endpoint**: POST `/api/invoices/{id}/resend-email`
5. **Envoi multi-status**: Ajouter option pour envoyer à chaque changement de status
6. **CC/BCC**: Ajouter options CC au freelancer
7. **Webhooks**: Notification events (sent, bounced, etc.)

---

## Support & Troubleshooting

### Q: Comment tester sans serveur SMTP?

**A**: Le mode développement est activé automatiquement si `SMTP_HOST=""`. Les emails sont loggés seulement.

### Q: Comment activer les emails réels?

**A**: Remplir les variables SMTP dans `.env` et relancer le backend.

### Q: Pourquoi l'email n'est pas envoyé?

**A**: Vérifier les logs:

- Email du client valide?
- SMTP_HOST configuré?
- Mot de passe SMTP correct?
- Firewall bloquant port SMTP?

### Q: Comment voir les emails envoyés?

**A**: Vérifier les logs ou, pour SMTP réel, vérifier le compte email du destinataire.

---

**Développé par**: FreelanceFlow Team  
**Date**: 14/04/2026  
**Statut**: Production Ready ✅

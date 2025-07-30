# 🧪 Guide de Test - Node Argil dans n8n

## 🚀 Démarrage de n8n

1. **Lancez n8n** :

    ```bash
    ./start-n8n.sh
    ```

2. **Accédez à n8n** :
    - Ouvrez votre navigateur
    - Allez à : http://localhost:5678

## 🔐 Configuration Initiale

### Étape 1 : Créer un compte

-   Email : votre-email@example.com
-   Mot de passe : choisissez un mot de passe sécurisé

### Étape 2 : Ajouter les credentials Argil

1. Cliquez sur **Credentials** dans le menu de gauche
2. Cliquez sur **+ Add Credential**
3. Recherchez "**Argil**"
4. Entrez votre API Key Argil
5. Cliquez sur **Create**

## 🎬 Créer votre première vidéo

### Étape 1 : Nouveau Workflow

1. Cliquez sur **Workflows** → **+ New**
2. Donnez un nom : "Test Argil Video"

### Étape 2 : Ajouter le node Argil

1. Cliquez sur le **+** au centre
2. Recherchez "**Argil**"
3. Sélectionnez le node **Argil**

### Étape 3 : Configurer la vidéo

#### Configuration de base :

```
Resource: Video
Operation: Create
Avatar: [Sélectionnez dans la liste]
Video Name: Ma première vidéo n8n
```

#### Transcript :

Cliquez sur "Add transcript line" et ajoutez :

-   Line 1: "Bonjour et bienvenue dans cette démonstration"
-   Line 2: "Nous allons créer une vidéo avec Argil et n8n"
-   Line 3: "C'est vraiment simple et puissant"

#### Options additionnelles :

-   **Aspect Ratio**: 16:9 (Landscape)
-   **Auto Captions**: ✅ Activé
-   **Auto B-rolls**: ✅ Activé
    -   Intensity: MEDIUM
    -   Source: GOOGLE_IMAGES

### Étape 4 : Exécuter le workflow

1. Cliquez sur **Execute Workflow**
2. Attendez la réponse
3. Vérifiez le résultat dans le panneau de sortie

## 📊 Exemple de réponse attendue

```json
{
    "id": "video_xxxxx",
    "name": "Ma première vidéo n8n",
    "status": "processing",
    "createdAt": "2024-01-19T15:30:00Z",
    "moments": [
        {
            "transcript": "Bonjour et bienvenue dans cette démonstration",
            "avatar": {
                "id": "avatar_id",
                "name": "Avatar Name"
            }
        }
    ],
    "subtitles": {
        "enable": true
    },
    "aspectRatio": "16:9"
}
```

## 🐛 Dépannage

### Le node Argil n'apparaît pas ?

1. Arrêtez n8n (Ctrl+C)
2. Vérifiez le lien :
    ```bash
    ls -la node_modules/ | grep argil
    ```
3. Si absent, refaites :
    ```bash
    npm link n8n-nodes-argil
    ```
4. Redémarrez n8n

### Erreur d'authentification ?

-   Vérifiez votre API Key dans les credentials
-   Assurez-vous qu'elle est active sur votre compte Argil

### Les avatars ne se chargent pas ?

-   Vérifiez votre connexion internet
-   Testez l'API directement :
    ```bash
    curl -X GET https://api.argil.ai/v1/avatars \
      -H "x-api-key: VOTRE_API_KEY"
    ```

## 💡 Astuces

1. **Workflow de test complet** :

    - Ajoutez un node "Schedule Trigger" avant Argil
    - Configurez pour créer une vidéo quotidienne

2. **Intégration avec d'autres services** :

    - Utilisez un node "Webhook" pour recevoir des demandes
    - Ajoutez un node "Email" après pour envoyer le résultat

3. **Traitement des données** :
    - Utilisez un node "Code" pour formater le transcript
    - Connectez à Google Sheets pour lire les scripts

## 📝 Notes

-   La génération vidéo peut prendre quelques minutes
-   Le statut initial sera "processing"
-   Vous pouvez vérifier le statut sur votre dashboard Argil

---

Bon test ! 🎉

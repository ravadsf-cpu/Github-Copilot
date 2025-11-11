# Cleary Firebase Configuration

## Setup Instructions

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Copy your Firebase configuration
5. Create a `.env.local` file in the root directory with:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Firestore Database Structure

```
users/
  {userId}/
    - email: string
    - name: string
    - createdAt: timestamp
    - preferences:
        - mood: string
        - topics: array
        - politicalLean: string
        - politicalBalance: string

reading_history/
  {userId}/
    interactions/
      {articleId}/
        - articleData: object
        - interaction: string (read, saved, skipped)
        - timestamp: timestamp
        - readTime: number

articles/
  {articleId}/
    - title: string
    - summary: string
    - mood: string
    - category: string
    - source: string
    - timestamp: timestamp
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /reading_history/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /articles/{articleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

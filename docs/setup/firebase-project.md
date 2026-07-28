# Firebase Project Setup

To activate a real Firebase project for this application, you must manually perform the following steps in the Firebase Console.

1. **Create or select a Firebase project.**
2. **Register a Web application:**
   - Go to Project Settings > General > Your apps.
   - Click the Web icon (</>) and register the app.
3. **Enable Authentication:**
   - Go to Build > Authentication > Sign-in method.
   - Enable **Google** authentication.
   - Enable **Anonymous** authentication.
4. **Add Authorized Domains:**
   - In Authentication > Settings > Authorized domains, add any custom domains where this app will be hosted.
5. **Create the Firestore Database:**
   - Go to Build > Firestore Database.
   - Click "Create database" and choose a location.
6. **Deploy Security Rules:**
   - Deploy the repository's reviewed `firestore.rules`.
   - You can run `npx firebase deploy --only firestore:rules` if you have authenticated with the Firebase CLI and set the project ID (`npx firebase use <your-project-id>`).
7. **Set the Environment Configuration:**
   - Populate `.env` with the values provided when registering the Web app.
   - Ensure `VITE_FIREBASE_USE_EMULATORS=false`.
8. **Smoke Test:**
   - Run the application locally or deployed.
   - Authenticate using Google or anonymously.
   - Create a launcher item, verify it appears in the grid, edit it, and delete it.

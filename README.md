# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Push updates (Git → GitHub → Vercel)

After making changes, commit and push so Vercel can redeploy:

```bash
git add .
git status
git commit -m "Your short description of the change"
git push origin main
```

(Use `master` instead of `main` if that’s your default branch. Use a clear message, e.g. `Add sort by distance` or `Fix listing photos`.)

## Build & deploy (web)

1. **Build** the static site (includes `public/` and your listing photos):

   ```bash
   npm run build
   ```

   Output goes to the **`dist/`** folder.

2. **Upload / deploy** – use either:

   - **Vercel (recommended):** Push the project to GitHub, then at [vercel.com](https://vercel.com) click **Add New Project**, import the repo. Vercel will use the existing `vercel.json` (build: `npm run build`, output: `dist`). Deploy.
   - **Manual:** Upload the contents of `dist/` to any static host (Netlify, GitHub Pages, your server’s `public_html`, etc.). The app is static HTML/JS/CSS.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

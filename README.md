# Steps to Compile Electron App for Windows
### 1. Install Electron Packager: If you haven't done so already, navigate to your project directory in the terminal and install Electron Packager.

```bash
npm install electron-packager --save-dev
```

### 2. Update the package.json: Make sure your package.json file has a pack script set up for Windows. Here’s an example configuration:

```json
{
  "name": "your-app-name",
  "version": "1.0.0",
  "description": "Your app description",
  "main": "renderer.js",  // or your main Electron entry file
  "scripts": {
    "start": "electron .",
    "pack": "electron-packager . your-app-name --platform=win32 --arch=x64 --out=dist/ --overwrite"
  },
  "devDependencies": {
    "electron": "^your-electron-version",
    "electron-packager": "^your-electron-packager-version"
  }
}
```

### 3. Run the Packaging Command: Execute the following command in your terminal:

```bash
npm run pack
```

### This command will create a dist folder in your project directory containing the packaged .exe file.
> Downloadable demo version: https://drive.google.com/drive/folders/1WUa-HGDPeNWgrt4iMxmJ_mCeKIL0lw6p?usp=drive_link

For any inquiries or questions, please contact me dityaisanda@gmail.com

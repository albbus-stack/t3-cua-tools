import { TextEncoder } from "util";
import * as vscode from "vscode";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  const disposableScreen = vscode.commands.registerCommand(
    "t3-cua-tools.newScreen",
    async () => {
      const screenName = await vscode.window.showInputBox({
        placeHolder: "NewScreen",
        prompt: "Enter the name of the new screen",
      });
      // Check if the user input is not empty
      if (!screenName || screenName.includes(" ")) {
        // Do something with the user input
        vscode.window.showInformationMessage(
          `Enter a valid screen name. You entered: ${screenName}`
        );
        return;
      }

      // Get the active workspace folder
      const workspaceFolder = vscode.workspace.workspaceFolders
        ? vscode.workspace.workspaceFolders[0]
        : undefined;
      if (!workspaceFolder) {
        vscode.window.showInformationMessage(
          "No workspace folder is open. Please open a workspace folder and try again."
        );
        return;
      }

      const folderUri = vscode.Uri.file(
        path.join(
          workspaceFolder.uri.fsPath,
          "packages",
          "app",
          "features",
          screenName
        )
      );
      const fileUri = vscode.Uri.file(
        path.join(folderUri.fsPath, "screen.tsx")
      );

      // Create the new screen folder
      vscode.workspace.fs.createDirectory(folderUri);

      // Create the new screen file
      const screenFileData = new TextEncoder().encode(
        `import { Button, Paragraph, YStack } from "@my/ui";\nimport { ChevronLeft } from "@tamagui/lucide-icons";\nimport React from "react";\nimport { useLink } from "solito/link";\n\nexport function ${screenName}() {\n  const linkProps = useLink({ href: "/" });\n\n  return (\n    <YStack f={1} jc="center" ai="center" space>\n      <Paragraph ta="center" fow="800">\n        ${screenName.toLowerCase()}\n      </Paragraph>\n      <Button {...linkProps} icon={ChevronLeft} theme="gray">\n        Go Home\n      </Button>\n    </YStack>\n  );\n} `
      );
      await vscode.workspace.fs.writeFile(fileUri, screenFileData);

      // Same for navigation/native/index.tsx
      const navigationFileUri = vscode.Uri.file(
        path.join(
          workspaceFolder.uri.fsPath,
          "packages",
          "app",
          "navigation",
          "native",
          "index.tsx"
        )
      );

      const navigationIndex = await vscode.workspace.openTextDocument(
        navigationFileUri
      );
      const navContents = navigationIndex.getText();

      const newImport = `import { ${screenName} } from "../../features/${screenName.toLowerCase()}/screen";\n`;
      const startingCreateStack = navContents.lastIndexOf("import");
      const newRoute = `  ${screenName.toLowerCase()}: undefined;\n`;
      const closingCreateStack = navContents.indexOf("}>();");
      const newStackScreen = `  <Stack.Screen\n        name="${screenName.toLowerCase()}"\n        component={${screenName}}\n        options={{\n          title: "${screenName}",\n        }}\n      />\n`;
      const closingNavIndex = navContents.indexOf("</Stack.Navigator>");

      const newNavContents =
        navContents.substring(0, startingCreateStack) +
        newImport +
        navContents.substring(startingCreateStack, closingCreateStack) +
        newRoute +
        navContents.substring(closingCreateStack, closingNavIndex) +
        newStackScreen +
        navContents.substring(closingNavIndex);

      // Write the new contents to the navigation file
      const newNavFileData = new TextEncoder().encode(newNavContents);
      vscode.workspace.fs.writeFile(navigationFileUri, newNavFileData);

      // Same for provider/navigation/index.tsx
      const navigationProviderFileUri = vscode.Uri.file(
        path.join(
          workspaceFolder.uri.fsPath,
          "packages",
          "app",
          "provider",
          "navigation",
          "index.tsx"
        )
      );

      const navigationProviderIndex = await vscode.workspace.openTextDocument(
        navigationProviderFileUri
      );
      const navProviderContents = navigationProviderIndex.getText();

      const newNavRoute = `  ${screenName.toLowerCase()}: "${screenName.toLowerCase()}",\n`;
      const closingScreenObject = navProviderContents.indexOf(
        "},",
        navProviderContents.indexOf("screens: {")
      );

      const newNavProviderContents =
        navProviderContents.substring(0, closingScreenObject) +
        newNavRoute +
        navProviderContents.substring(closingScreenObject);

      // Write the new contents to the navigation file
      const newNavProviderFileData = new TextEncoder().encode(
        newNavProviderContents
      );
      vscode.workspace.fs.writeFile(
        navigationProviderFileUri,
        newNavProviderFileData
      );

      // Same for apps/nextjs/pages
      const nextFolderUri = vscode.Uri.file(
        path.join(
          workspaceFolder.uri.fsPath,
          "apps",
          "nextjs",
          "pages",
          screenName
        )
      );
      const nextFileUri = vscode.Uri.file(
        path.join(nextFolderUri.fsPath, "index.tsx")
      );

      // Create the new nextjs folder
      vscode.workspace.fs.createDirectory(nextFolderUri);

      // Create the new nextjs file
      const nextFileData = new TextEncoder().encode(
        `import { ${screenName} } from 'app/features/${screenName.toLowerCase()}/screen'\n\nexport default ${screenName}\n`
      );
      await vscode.workspace.fs.writeFile(nextFileUri, nextFileData);

      // Open the screen.tsx file
      const newScreenDocument = await vscode.workspace.openTextDocument(
        fileUri
      );

      // Show it in the editor
      vscode.window.showTextDocument(newScreenDocument);
    }
  );

  const disposableComponent = vscode.commands.registerCommand(
    "t3-cua-tools.newComponent",
    async () => {
      const componentName = await vscode.window.showInputBox({
        placeHolder: "NewComponent",
        prompt: "Enter the name of the new component",
      });
      // Check if the user input is not empty
      if (!componentName || componentName.includes(" ")) {
        // Do something with the user input
        vscode.window.showInformationMessage(
          `Enter a valid component name. You entered: ${componentName}`
        );
        return;
      }

      // Get the active workspace folder
      const workspaceFolder = vscode.workspace.workspaceFolders
        ? vscode.workspace.workspaceFolders[0]
        : undefined;
      if (!workspaceFolder) {
        vscode.window.showInformationMessage(
          "No workspace folder is open. Please open a workspace folder and try again."
        );
        return;
      }

      const newFileUri = vscode.Uri.file(
        path.join(
          workspaceFolder.uri.fsPath,
          "packages",
          "ui",
          "src",
          "components",
          componentName + ".tsx"
        )
      );

      // Create the new component file
      const componentFileData = new TextEncoder().encode(
        `import { Paragraph, YStack } from "@my/ui";\nimport React from "react";\nimport { useLink } from "solito/link";\n\nexport function ${componentName}() {\n  return (\n    <YStack f={1} jc="center" ai="center" space>\n      <Paragraph ta="center" fow="800">\n        ${componentName}\n      </Paragraph>\n    </YStack>\n  );\n} `
      );
      await vscode.workspace.fs.writeFile(newFileUri, componentFileData);

      // Open the {componentName}.tsx file
      const newComponentDocument = await vscode.workspace.openTextDocument(
        newFileUri
      );

      // Show it in the editor
      vscode.window.showTextDocument(newComponentDocument);
    }
  );

  const disposableRoute = vscode.commands.registerCommand(
    "t3-cua-tools.newRoute",
    async () => {
      const routeName = await vscode.window.showInputBox({
        placeHolder: "newRoute",
        prompt: "Enter the name of the new route",
      });
      // Check if the user input is not empty
      if (!routeName || routeName.includes(" ")) {
        // Do something with the user input
        vscode.window.showInformationMessage(
          `Enter a valid route name. You entered: ${routeName}`
        );
        return;
      }

      // Get the active workspace folder
      const workspaceFolder = vscode.workspace.workspaceFolders
        ? vscode.workspace.workspaceFolders[0]
        : undefined;
      if (!workspaceFolder) {
        vscode.window.showInformationMessage(
          "No workspace folder is open. Please open a workspace folder and try again."
        );
        return;
      }

      const newFileUri = vscode.Uri.file(
        path.join(
          workspaceFolder.uri.fsPath,
          "packages",
          "api",
          "src",
          "router",
          routeName + ".ts"
        )
      );

      // Create the new route file
      const routeFileData = new TextEncoder().encode(
        `import { protectedProcedure, publicProcedure, router } from "../trpc";\n\nexport const ${routeName}Router = router({\n\n});\n`
      );
      await vscode.workspace.fs.writeFile(newFileUri, routeFileData);

      const routerIndexFileUri = vscode.Uri.file(
        path.join(
          workspaceFolder.uri.fsPath,
          "packages",
          "api",
          "src",
          "router",
          "index.ts"
        )
      );

      const navigationProviderIndex = await vscode.workspace.openTextDocument(
        routerIndexFileUri
      );
      const RouterContents = navigationProviderIndex.getText();

      const newImport = `import { ${routeName}Router } from "./${routeName}";\n`;
      const lastImportIndex = RouterContents.lastIndexOf("import");
      const newRoute = `  ${routeName}: ${routeName}Router,\n`;
      const closingRouterObject = RouterContents.indexOf("});");

      const newRouterContents =
        RouterContents.substring(0, lastImportIndex) +
        newImport +
        RouterContents.substring(lastImportIndex, closingRouterObject) +
        newRoute +
        RouterContents.substring(closingRouterObject);

      // Write the new contents to the navigation file
      const newRouterFileData = new TextEncoder().encode(newRouterContents);
      vscode.workspace.fs.writeFile(routerIndexFileUri, newRouterFileData);

      // Open the {componentName}.tsx file
      const newRouteDocument = await vscode.workspace.openTextDocument(
        newFileUri
      );

      // Show it in the editor
      vscode.window.showTextDocument(newRouteDocument);
    }
  );

  context.subscriptions.push(disposableScreen);
  context.subscriptions.push(disposableComponent);
  context.subscriptions.push(disposableRoute);
}

// this method is called when your extension is deactivated
export function deactivate() {}

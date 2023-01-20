// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { TextEncoder } from "util";
import * as vscode from "vscode";
import * as path from "path";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, "t3-cua-tools" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "t3-cua-tools.newScreen",
    async () => {
      // The code you place here will be executed every time your command is executed

      let screenName = await vscode.window.showInputBox({
        placeHolder: "new-screen",
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
      let workspaceFolder = vscode.workspace.workspaceFolders
        ? vscode.workspace.workspaceFolders[0]
        : undefined;
      if (!workspaceFolder) {
        return; // No open workspace
      }

      let folderUri = vscode.Uri.file(
        path.join(
          workspaceFolder.uri.fsPath,
          "packages",
          "app",
          "features",
          screenName
        )
      );
      let fileUri = vscode.Uri.file(path.join(folderUri.fsPath, "screen.tsx"));

      // Create the new folder
      vscode.workspace.fs.createDirectory(folderUri);

      // Create the new file
      let screenFileData = new TextEncoder().encode(
        `import { Button, Paragraph, YStack } from "@my/ui";\nimport { ChevronLeft } from "@tamagui/lucide-icons";\nimport React from "react";\nimport { useLink } from "solito/link";\n\nexport function ${screenName}() {\n  const linkProps = useLink({ href: "/" });\n\n  return (\n    <YStack f={1} jc="center" ai="center" space>\n      <Paragraph ta="center" fow="800">\n        ${screenName.toLowerCase()}\n      </Paragraph>\n      <Button {...linkProps} icon={ChevronLeft} theme="gray">\n        Go Home\n      </Button>\n    </YStack>\n  );\n} `
      );
      await vscode.workspace.fs.writeFile(fileUri, screenFileData);

      // For navigation/native/index.tsx
      let navigationFileUri = vscode.Uri.file(
        path.join(
          workspaceFolder.uri.fsPath,
          "packages",
          "app",
          "navigation",
          "native",
          "index.tsx"
        )
      );

      // Open the text document
      let navigationIndex = await vscode.workspace.openTextDocument(
        navigationFileUri
      );
      let navContents = navigationIndex.getText();

      let newImport = `import { ${screenName} } from "../../features/${screenName.toLowerCase()}/screen";\n`;
      let startingCreateStack = navContents.lastIndexOf("import");
      let newRoute = `  ${screenName.toLowerCase()}: undefined;\n`;
      let closingCreateStack = navContents.indexOf("}>();");
      let newStackScreen = `  <Stack.Screen\n        name="${screenName.toLowerCase()}"\n        component={${screenName}}\n        options={{\n          title: "${screenName}",\n        }}\n      />\n`;
      let closingNavIndex = navContents.indexOf("</Stack.Navigator>");

      let newNavContents =
        navContents.substring(0, startingCreateStack) +
        newImport +
        navContents.substring(startingCreateStack, closingCreateStack) +
        newRoute +
        navContents.substring(closingCreateStack, closingNavIndex) +
        newStackScreen +
        navContents.substring(closingNavIndex);

      // Write the new contents to the navigation file
      let newNavFileData = new TextEncoder().encode(newNavContents);
      vscode.workspace.fs.writeFile(navigationFileUri, newNavFileData);

      // For provider/navigation/index.tsx
      let navigationProviderFileUri = vscode.Uri.file(
        path.join(
          workspaceFolder.uri.fsPath,
          "packages",
          "app",
          "provider",
          "navigation",
          "index.tsx"
        )
      );

      let navigationProviderIndex = await vscode.workspace.openTextDocument(
        navigationProviderFileUri
      );
      let navProviderContents = navigationProviderIndex.getText();

      let newNavRoute = `\n              ${screenName.toLowerCase()}: "${screenName.toLowerCase()}",\n`;
      let closingScreenObject = navProviderContents.indexOf(
        "},",
        navProviderContents.indexOf("screens: {")
      );

      let newNavProviderContents =
        navProviderContents.substring(0, closingScreenObject) +
        newNavRoute +
        navProviderContents.substring(closingScreenObject);

      // Write the new contents to the navigation file
      let newNavProviderFileData = new TextEncoder().encode(
        newNavProviderContents
      );
      vscode.workspace.fs.writeFile(
        navigationProviderFileUri,
        newNavProviderFileData
      );

      // For apps/nextjs/pages
      let nextFolderUri = vscode.Uri.file(
        path.join(
          workspaceFolder.uri.fsPath,
          "apps",
          "nextjs",
          "pages",
          screenName
        )
      );
      let nextFileUri = vscode.Uri.file(
        path.join(nextFolderUri.fsPath, "index.tsx")
      );

      // Create the new folder
      vscode.workspace.fs.createDirectory(nextFolderUri);

      // Create the new file
      let nextFileData = new TextEncoder().encode(
        `import { ${screenName} } from 'app/features/${screenName.toLowerCase()}/screen'\n\nexport default ${screenName}\n`
      );
      await vscode.workspace.fs.writeFile(nextFileUri, nextFileData);

      // Open the screen.tsx
      let newScreenDocument = await vscode.workspace.openTextDocument(fileUri);

      // Show it in the editor
      vscode.window.showTextDocument(newScreenDocument);
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

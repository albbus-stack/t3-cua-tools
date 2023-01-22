import { TextEncoder } from "util";
import * as vscode from "vscode";
import * as path from "path";

const isWithExpoRouter = async (workspaceFolder: vscode.WorkspaceFolder) => {
  let folderUri = vscode.Uri.file(
    path.join(
      workspaceFolder.uri.fsPath,
      "packages",
      "app",
      "navigation",
      "native"
    )
  );

  let withExpoRouter = true;

  await vscode.workspace.fs.stat(folderUri).then((stat) => {
    if (stat.type === vscode.FileType.Directory) {
      withExpoRouter = false;
    }
  });

  console.log("wep:", withExpoRouter);

  return withExpoRouter;
};

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
        vscode.window.showInformationMessage(
          `Enter a valid screen name. You entered: ${screenName}`
        );
        return;
      }

      const isStaticRoute = await vscode.window
        .showQuickPick(["Static Route", "Dynamic Route"], {
          placeHolder: "What type of route does this screen depend on?",
        })
        .then((result) => result === "Static Route");

      let parameterName = undefined;
      if (!isStaticRoute) {
        parameterName = await vscode.window.showInputBox({
          placeHolder: "id",
          prompt: "Enter the name of the dynamic route parameter",
        });
        // Check if the user input is not empty
        if (!parameterName || parameterName.includes(" ")) {
          vscode.window.showInformationMessage(
            `Enter a valid parameter name. You entered: ${parameterName}`
          );
          return;
        }
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
          screenName.toLowerCase()
        )
      );
      const fileUri = vscode.Uri.file(
        path.join(folderUri.fsPath, "screen.tsx")
      );

      // Create the new screen folder
      vscode.workspace.fs.createDirectory(folderUri);

      // Create the new screen file
      let screenFileData = new TextEncoder().encode(
        `import { Paragraph, YStack } from "@my/ui";\nimport React from "react";\n\nexport function ${
          screenName + "Screen"
        }() {\n  return (\n    <YStack f={1} jc="center" ai="center" space>\n      <Paragraph ta="center" fow="800">\n        ${screenName.toLowerCase()}\n      </Paragraph>\n    </YStack>\n  );\n} `
      );
      if (!isStaticRoute) {
        screenFileData = new TextEncoder().encode(
          `import { Paragraph, YStack } from "@my/ui";\nimport React from "react";\nimport { createParam } from "solito";\n\nconst { useParam } = createParam<{ ${parameterName!.toLowerCase()}: string }>()\n\nexport function ${
            screenName + "Screen"
          }() {\n  const [${parameterName!.toLowerCase()}] = useParam('${parameterName!.toLowerCase()}')\n\n  return (\n    <YStack f={1} jc="center" ai="center" space>\n      <Paragraph ta="center" fow="800">\n        {\`${parameterName!.toLowerCase()}: \${${parameterName!.toLowerCase()}}\`}\n      </Paragraph>\n    </YStack>\n  );\n} `
        );
      }
      await vscode.workspace.fs.writeFile(fileUri, screenFileData);

      // Check to see if this is an app created with the expo router template
      const withExpoRouter = await isWithExpoRouter(workspaceFolder);

      if (!withExpoRouter) {
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

        const newImport = `import { ${
          screenName + "Screen"
        } } from "../../features/${screenName.toLowerCase()}/screen";\n`;
        const startingCreateStack = navContents.lastIndexOf("import");
        let newRoute = `  ${screenName.toLowerCase()}: undefined;\n`;
        if (!isStaticRoute) {
          newRoute = `  "${screenName.toLowerCase()}": {\n    ${parameterName!.toLowerCase()}:string;\n  };\n`;
        }
        const closingCreateStack = navContents.indexOf("}>();");
        const newStackScreen = `  <Stack.Screen\n        name="${screenName.toLowerCase()}"\n        component={${
          screenName + "Screen"
        }}\n        options={{\n          title: "${screenName}",\n        }}\n      />\n`;
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

        let newNavRoute = `  ${screenName.toLowerCase()}: "${screenName.toLowerCase()}",\n`;
        if (!isStaticRoute) {
          newNavRoute = `  ${screenName.toLowerCase()}: "${screenName.toLowerCase()}/:${parameterName!.toLowerCase()}",\n`;
        }
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
      } else {
        // In the case that this is an expo-router app
        let expoFolderUri = vscode.Uri.file(
          path.join(workspaceFolder.uri.fsPath, "apps", "expo", "app")
        );
        let expoFileUri = vscode.Uri.file(
          path.join(expoFolderUri.fsPath, `${screenName.toLowerCase()}.tsx`)
        );

        if (!isStaticRoute) {
          expoFolderUri = vscode.Uri.file(
            path.join(
              workspaceFolder.uri.fsPath,
              "apps",
              "expo",
              "app",
              screenName.toLowerCase()
            )
          );

          expoFileUri = vscode.Uri.file(
            path.join(
              expoFolderUri.fsPath,
              `[${parameterName!.toLowerCase()}].tsx`
            )
          );
        }

        // Create the new screen folder
        vscode.workspace.fs.createDirectory(expoFolderUri);

        // Create the new screen file
        const screenFileData = new TextEncoder().encode(
          `import { ${
            screenName + "Screen"
          } } from "app/features/${screenName.toLowerCase()}/screen";\n\nexport default function () {\n    return <${
            screenName + "Screen"
          }/>\n}\n`
        );
        await vscode.workspace.fs.writeFile(expoFileUri, screenFileData);
      }

      // This is common between the two app templates
      // Same for apps/nextjs/pages
      const nextFolderUri = vscode.Uri.file(
        path.join(
          workspaceFolder.uri.fsPath,
          "apps",
          "nextjs",
          "pages",
          screenName.toLowerCase()
        )
      );
      let nextFileUri = vscode.Uri.file(
        path.join(nextFolderUri.fsPath, "index.tsx")
      );

      if (!isStaticRoute) {
        nextFileUri = vscode.Uri.file(
          path.join(
            nextFolderUri.fsPath,
            `[${parameterName!.toLowerCase()}].tsx`
          )
        );
      }

      // Create the new nextjs folder
      vscode.workspace.fs.createDirectory(nextFolderUri);

      // Create the new nextjs file
      const nextFileData = new TextEncoder().encode(
        `import { ${
          screenName + "Screen"
        } } from 'app/features/${screenName.toLowerCase()}/screen'\n\nexport default ${
          screenName + "Screen"
        }\n`
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

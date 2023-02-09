# t3-cua-tools

![Typescript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=flat-square)
![Code](https://shields.io/badge/VSCode-00495c?logo=visual-studio-code&logoColor=FFF&style=flat-square)

This is a VSCode extension that consists of a set of tools for apps created with the create-t3-universal-app tool or cloned from the [CUA](https://github.com/chen-rn/CUA) (create-universal-app) template. This is also fully compatible with the latest version of CUA that's using Expo Router.

The public extension is live on the VSCode marketplace [here](https://marketplace.visualstudio.com/items?itemName=albbus-stack.t3-cua-tools).

## Usage

### New Screen

Input the new screen name in CapitalizedCamelCase (i.e. the name that you would have used for the screen component). Subsequently this command will generate a new `screen.tsx` file under the directory `packages/app/features/{ScreenName}`, add the generated component to the stack navigator in `packages/app/navigation/native/index.tsx`, add a new route in `packages/app/provider/navigation/index.tsx` and add a new `index.tsx` under `apps/nextjs/pages/{ScreenName}` importing your new screen in Nextjs. After that it will open the new `screen.tsx` file for you to modify.

### New Component

Input the new component name in CapitalizedCamelCase. Subsequently this command will generate a new component under the `packages/ui/src/components` folder. After that it will open the new `{ComponentName}.tsx` file for you to modify.

### New API Route

Input the new API route name in lowercaseCamelCase. Subsequently this command will generate a new router in the `packages/api/src/router` folder and add that to the `index.ts` router. After that it will open the new `{routeName.ts}` file for you to modify.

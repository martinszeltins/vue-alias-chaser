import * as vscode from 'vscode';

const waitUntil = (watchSource: () => boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
        let timePassed = 0;
        let interval: any;

        interval = setInterval(() => {
            if (watchSource() === true) {
                clearInterval(interval);
                resolve();
            }

            timePassed++;

            if (timePassed > 50) {
                clearInterval((interval));
                reject();
            }
        }, 50);
    });
};

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(async (document) => {
            
            if (document.fileName.endsWith('.d.ts')) {
                const config = vscode.workspace.getConfiguration();
                const projectDirPath = config.get<string>('vueProjectPath', '');
                
                if (!projectDirPath) {
                    vscode.window.showInformationMessage('[VueAliasChaser]: Vue Project Path is not configured in workspace settings!');
                    return;
                }

                await waitUntil(() => {
                    let editor = vscode.window.activeTextEditor;

                    const isActiveSelection = vscode.window.activeTextEditor !== null
                        && vscode.window.activeTextEditor !== undefined
                        && editor !== null
                        && editor !== undefined
                        && editor.selection.active !== null
                        && editor.selection.active !== undefined;

                    if (!isActiveSelection) {
                        return false;
                    }

                    const position = editor!.selection.active;
                    const line = editor!.document.lineAt(position.line);
                    const importPathMatch = line.text.match(/import\(['"](.+?)['"]\)/);

                    if (!importPathMatch) {
                        return false;
                    }

                    return true;
                });

                let editor = vscode.window.activeTextEditor;

                const position = editor!.selection.active;
                const line = editor!.document.lineAt(position.line);
                const importPathMatch = line.text.match(/import\(['"](.+?)['"]\)/);

                if (importPathMatch) {
                    const importPath = importPathMatch[1].replace(/^\.\/src\//, '/src/');

                    const config = vscode.workspace.getConfiguration();
                    const projectDirPath = config.get<string>('vueProjectPath', '');
                    const targetPath = `${projectDirPath}${importPath}`;

                    // Move the selection cursor to the beginning of the file at line 1 and column 1.
                    const startPosition = new vscode.Position(0, 0);
                    const endPosition = new vscode.Position(0, 0);
                    const newSelection = new vscode.Selection(startPosition, endPosition);
                    editor!.selection = newSelection;

                    // Now open the file itself.
                    const document = await vscode.workspace.openTextDocument(targetPath);
                    vscode.window.showTextDocument(document);

                    // Now close components.d.ts file!
                    setTimeout(async () => {
                        const tabGroups = vscode.window.tabGroups.all;
                        const tabs = tabGroups[0].tabs;
                        const componentsTab = tabs.find(tab => tab.label === 'components.d.ts');

                        if (componentsTab) {
                            vscode.window.tabGroups.close(componentsTab, true);
                        }
                    }, 50);
                }
            }
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(async (editor) => {
            if (editor && editor.document.fileName.endsWith('components.d.ts')) {
                await vscode.commands.executeCommand('workbench.action.navigateBack');
            }
        })
    );
}

export function deactivate() {}

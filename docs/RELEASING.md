# Releasing Work-Tracker

This document outlines the process for releasing a new version of Work-Tracker.

## Prerequisites

-   Ensure you have configured `GH_TOKEN` in your repository secrets if you are using a separate bot account, otherwise the standard `GITHUB_TOKEN` provided by Actions is sufficient.
-   Ensure you have push access to the repository.

## Release Process

1.  **Commit Changes**: Ensure all your changes are committed and pushed to the `main` branch.

2.  **Versioning**:
    Run the following command to bump the version number. Choose `patch`, `minor`, or `major` as appropriate.

    ```bash
    npm version patch  # 1.0.0 -> 1.0.1
    # OR
    npm version minor  # 1.0.0 -> 1.1.0
    # OR
    npm version major  # 1.0.0 -> 2.0.0
    ```

    This command will:
    -   Update the version in `package.json`.
    -   Create a git commit with the new version.
    -   Create a git tag (e.g., `v1.0.1`).

3.  **Push to GitHub**:
    Push the commits and the tags to GitHub.

    ```bash
    git push && git push --tags
    ```

4.  **Auto-Build**:
    -   Go to the [Actions tab](https://github.com/Matthew7727/worktracker/actions) in your repository.
    -   You should see a new workflow run triggered by the tag.
    -   Once the workflow completes, a new Release will be created in the [Releases](https://github.com/Matthew7727/worktracker/releases) section.
    -   The release will contain the installer (e.g., `Work-Tracker Setup 1.0.1.exe`) and the `latest.yml` file required for auto-updates.

## Auto-Updates

The application checks for updates on startup (in production mode).
-   If a new version is available in GitHub Releases, it will be downloaded automatically.
-   Once downloaded, the user will be notified (via console logs currently, or IPC event if UI is hooked up) and it will instal on next quit.

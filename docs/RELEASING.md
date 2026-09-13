# Releasing Work-Tracker

This document outlines the process for releasing a new version of Work-Tracker.

## Prerequisites

- Ensure the `production-release` GitHub Environment exists and has the protected Apple signing/notarization secrets described below.
- Ensure the release branch has passed the CI checks.

## Release Process

1. **Create a release branch** from `main` named `release/vX.Y.Z`.

2. **Version the branch**. Run the following command and commit the result:

   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   # OR
   npm version minor  # 1.0.0 -> 1.1.0
   # OR
   npm version major  # 1.0.0 -> 2.0.0
   ```

   Use `--no-git-tag-version`: the release workflow owns the immutable tag.

   ```bash
   npm version patch --no-git-tag-version
   git add package.json package-lock.json
   git commit -m "chore: bump version"
   git push origin release/vX.Y.Z
   ```

3. **Open and merge a PR** from `release/vX.Y.Z` to `main`. The Release workflow then:
   - validates that the branch version and `package.json` agree;
   - creates `vX.Y.Z` at the exact merge commit and never moves it;
   - builds Windows plus signed/notarized Apple Silicon macOS installers;
   - uploads assets to a draft release and publishes it only if both builds pass.

   A reviewer must approve the protected `production-release` environment before Apple credentials are used. The release then publishes automatically after both platform builds pass.

4. **Retrying a failed release**: use **Actions → Release → Run workflow** and enter the existing tag. The workflow will only rebuild the tag if it still points at the exact requested commit.

## Apple signing setup

Create a protected GitHub Environment named `production-release`, require a reviewer, and add these environment secrets:

- `CSC_LINK`: base64-encoded export of the **Developer ID Application** `.p12` certificate.
- `CSC_KEY_PASSWORD`: password used when exporting that `.p12`.
- `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID`: notarization credentials.

The workflow imports the certificate into a temporary keychain, verifies it is a Developer ID identity, signs, notarizes, staples, and verifies the final app and DMG. It deletes the temporary keychain afterwards.

## Auto-Updates

The application checks for updates on startup (in production mode).

- If a new version is available in GitHub Releases, it will be downloaded automatically.
- Once downloaded, the user will be notified (via console logs currently, or IPC event if UI is hooked up) and it will instal on next quit.

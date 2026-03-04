---
name: Azure App Service deployment setup
overview: "Configure the VaultWrx Backend Service for Azure App Service: add Prettier lint script, use code deployment (no Docker), document port configuration (PORT vs WEBSITES_PORT), and document manual Azure setup."
todos: []
isProject: false
---

# Azure App Service deployment setup

## Current state

- **Stack:** Node.js 22, Express, TypeScript, TypeORM, PostgreSQL. App listens on `PORT` or `APP_PORT` (default 3060) and already reads these from env ([src/config/app.ts](VaultWrx-Backend-Service/src/config/app.ts)).
- **Pipeline:** [azure-pipelines.yml](VaultWrx-Backend-Service/azure-pipelines.yml) currently uses Docker + **AzureWebAppContainer@1**. You will **not** use Docker; deployment will be **code** (zip or Git) to a Node.js runtime on App Service.

---

## How port configuration works on Azure App Service

### When you use a custom container (Docker)

- Azure only exposes **80** and **443** to the internet. Traffic is proxied to a port **inside** your container.
- **WEBSITES_PORT** is an **Azure platform setting** (App Service Application settings). It tells Azure: “Forward incoming requests to this port inside the container.”
- Your container must **listen on that same port**. So you set:
  - **In Azure:** `WEBSITES_PORT=3060` (or whatever port your app uses).
  - **In the container:** Your app reads `process.env.PORT` (Azure injects this from `WEBSITES_PORT`) and listens on it. Your app already does this via `PORT` / `APP_PORT` in [src/config/app.ts](VaultWrx-Backend-Service/src/config/app.ts).
- If you don’t set `WEBSITES_PORT`, Azure may default to 80; your app would need to listen on 80, or you set `WEBSITES_PORT` to match your app (e.g. 3060).

### When you use code deployment (no Docker) – your case

- You create a **Web App** with a **Node.js** runtime (e.g. “Node 22 LTS”), not “Web App for Containers.”
- Azure runs your app with its Node runtime. The platform sets **PORT** (often **8080** on Linux Node images) so your app knows which port to listen on.
- You **do not** use **WEBSITES_PORT** here. That variable is only for custom containers.
- You **do** set **PORT** (or **APP_PORT**) in App Service Application settings **only if** you want to override the default (e.g. set `PORT=3060` so your app listens on 3060). Your app already reads `PORT`/`APP_PORT` from the environment, so it will use whatever Azure or you set.
- Summary: for code deploy, set `PORT` (or `APP_PORT`) in app settings to the port your app should listen on (e.g. `3060`); no `WEBSITES_PORT` needed.

---

## Changes to make

### 1. Add Prettier lint script

- In [package.json](VaultWrx-Backend-Service/package.json), add a `lint` script that runs Prettier in check mode so the pipeline’s `npm run lint` step passes. Use the same pattern as existing `code:check` so it matches your repo (e.g. `"lint": "prettier --check \"src/**/*.{ts,css,js,html}\""` or point to the same paths as `code:check`).

### 2. Switch pipeline to code deployment (no Docker)

- Remove or bypass the **Docker** and **Deploy (AzureWebAppContainer@1)** stages that build/push an image and deploy a container.
- Add a **Deploy** stage that deploys **artifacts** (e.g. built `dist/` + `package.json` + production `node_modules` or a zip of the app) to the Web App using **AzureWebApp@1** (or “Azure App Service deploy” task) with **package** or **zip** option. The pipeline already publishes `dist` and `package` artifacts in the Build stage; the deploy task will use those (and run `npm install --production` on the agent or on the server, depending on task config).
- In the deploy task (or in Azure App Service Application settings), set **PORT** (or **APP_PORT**) to the port your app listens on (e.g. **3060**). Do **not** set WEBSITES_PORT for code deploy.
- Ensure the Build stage produces a deployable artifact (e.g. `dist`, `package.json`, and optionally `node_modules` or let the deploy task run `npm ci --production` from a package artifact).

### 3. Optional: Separate app names for staging vs production

- Use different `appName` values for staging and production (e.g. `vaultwrx-backend-staging`, `vaultwrx-backend-prod`) in the deploy tasks.

### 4. Document Azure setup (DEPLOYMENT.md)

- Add **DEPLOYMENT.md** describing:
  - **Code deployment (no Docker):** Create Web App with **Node.js** runtime (e.g. Node 22 LTS), not “Web App for Containers.” Deploy via Azure DevOps (AzureWebApp task) or Zip Deploy / Git.
  - **Port:** Set **PORT** (or **APP_PORT**) in Application settings to the value your app listens on (e.g. 3060). No WEBSITES_PORT for code deploy.
  - **WEBSITES_PORT:** Mention only for reference: “If you ever use a custom container, set WEBSITES_PORT to the port the container listens on.”
  - Required app settings: `NODE_ENV`, `PORT` or `APP_PORT`, database vars (`TYPEORM`_*), `JWT_SECRET`, `APP_URL`, etc., per [.env.example](VaultWrx-Backend-Service/.env.example) and [src/config](VaultWrx-Backend-Service/src/config).

### 5. Optional: Production env template

- Add **.env.production.example** listing the variables that must be set in Azure (no real secrets).

---

## Summary of file-level actions


| File                                                                | Action                                                                                                                                               |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| [package.json](VaultWrx-Backend-Service/package.json)               | Add `"lint": "prettier --check \"src/**/*.{ts,css,js,html}\""` (or align with existing `code:check`).                                                |
| [azure-pipelines.yml](VaultWrx-Backend-Service/azure-pipelines.yml) | Remove/skip Docker and AzureWebAppContainer stages; add Deploy stage using AzureWebApp@1 (code/zip); set PORT (or APP_PORT) in app settings to 3060. |
| **DEPLOYMENT.md** (new)                                             | Document code deploy, PORT vs WEBSITES_PORT, and required app settings.                                                                              |
| **.env.production.example** (optional)                              | List production env vars for Azure.                                                                                                                  |


No code changes are required in the Node app: `server.listen(this.port)` already binds to all interfaces and uses `PORT`/`APP_PORT` from config.
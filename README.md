# shadowtrace

ShadowTrace - Alpha

Local run:

1. npm install
2. npm run dev

Build:

1. npm run build

Deploy on the ShadowTrace droplet:

1. ssh user@shadowtrace-droplet
2. git clone https://github.com/$(gh api user --jq .login)/shadowtrace.git
3. cd shadowtrace
4. npm ci --production=false
5. npm run build
6. serve the build (example): npx serve -s dist -l 80


FROM node:20-alpine AS build

WORKDIR /app

ARG API_URL
ENV API_URL=${API_URL}

RUN apk add --no-cache gettext

COPY package*.json ./
RUN if [ -f package-lock.json ]; then \
        npm ci --no-audit --no-fund; \
    else \
        npm install --no-audit --no-fund; \
    fi

COPY . .
RUN : "${API_URL:?API_URL build argument is required}" \
    && case "$API_URL" in /*|http://*|https://*) ;; *) echo "API_URL must be /api or an absolute http(s) URL" >&2; exit 1 ;; esac \
    && envsubst '${API_URL}' < src/environments/environment.prod.ts.template > src/environments/environment.prod.ts
RUN npm run build -- --configuration=production

FROM nginx:alpine

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

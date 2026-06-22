FROM node:20-alpine AS build

WORKDIR /app

ARG API_URL=/api
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
    && case "$API_URL" in /*) ;; *) echo "API_URL must be a relative path like /api" >&2; exit 1 ;; esac \
    && envsubst '${API_URL}' < src/environments/environment.prod.ts.template > src/environments/environment.prod.ts
RUN npm run build -- --configuration=production

FROM nginx:alpine

RUN apk add --no-cache gettext \
    && rm -f /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

EXPOSE 80

CMD : "${BACKEND_URL:?BACKEND_URL is required}" \
    && : "${BACKEND_HOST:?BACKEND_HOST is required}" \
    && case "$BACKEND_URL" in http://*|https://*) ;; *) echo "BACKEND_URL must include http:// or https://" >&2; exit 1 ;; esac \
    && case "$BACKEND_URL" in */) echo "BACKEND_URL must not end with /" >&2; exit 1 ;; *) ;; esac \
    && envsubst '${BACKEND_URL} ${BACKEND_HOST}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf \
    && exec nginx -g 'daemon off;'

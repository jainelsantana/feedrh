FROM node:20-alpine AS build

WORKDIR /app

ARG API_URL=/api
ENV API_URL=${API_URL}

RUN apk add --no-cache gettext

COPY package*.json ./
RUN npm install

COPY . .
RUN : "${API_URL:?API_URL build argument is required}" \
    && case "$API_URL" in /*) ;; *) echo "API_URL must be a relative path like /api" >&2; exit 1 ;; esac \
    && envsubst < src/environments/environment.prod.ts.template > src/environments/environment.prod.ts
RUN npm run build -- --configuration=production

FROM nginx:alpine

RUN apk add --no-cache gettext

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["/bin/sh", "-c", ": \"${BACKEND_URL:?BACKEND_URL is required}\" && : \"${BACKEND_HOST:?BACKEND_HOST is required}\" && envsubst '${BACKEND_URL} ${BACKEND_HOST}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

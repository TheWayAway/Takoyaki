#!/bin/sh
echo "tunnel: $CLOUDFLARE_TUNNEL_ID" > /tmp/config.yml
echo "credentials-file: /etc/cloudflared/credentials.json" >> /tmp/config.yml
echo "ingress:" >> /tmp/config.yml
echo "  - hostname: $CLOUDFLARE_HOSTNAME" >> /tmp/config.yml
echo "    service: $CLOUDFLARE_SERVICE_URL" >> /tmp/config.yml
echo "  - service: http_status:404" >> /tmp/config.yml
exec cloudflared tunnel --config /tmp/config.yml --no-autoupdate run

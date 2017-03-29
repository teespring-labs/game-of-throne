#!/usr/bin/env bash

filename="./.env"
if [ ! -f ${filename} ]; then
    echo "Please copy sample.env to .env and update your credentials."
fi

while IFS='' read -r line || [[ -n "$line" ]]; do
  export $line
done < "$filename"

serverless deploy --verbose

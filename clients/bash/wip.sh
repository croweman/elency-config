#!/bin/bash

valueToHash="IAmAValueToHash"
key="M2VlMzRiOTFiNmM0NDY2YWI0MTAxZmZi"

rm -f tmp_*

printf "%s" "$valueToHash" >> tmp_valueToHash
printf "%s" "$key" >> tmp_key

decodedKey=$(base64 --decode -i tmp_key)
openssl dgst -sha256 -binary -hmac ${decodedKey} tmp_valueToHash >> tmp_hashed
base64Hash=$(base64 -i tmp_hashed)
echo ${base64Hash}

rm tmp_*
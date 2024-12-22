#!/bin/bash

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate CA private key and certificate
openssl req -x509 -newkey rsa:4096 -days 365 -nodes \
  -keyout certs/ca-key.pem -out certs/ca-cert.pem \
  -subj "/C=US/ST=California/L=San Francisco/O=ZapCache/OU=Dev/CN=localhost"

# Generate server private key and CSR
openssl req -newkey rsa:4096 -nodes \
  -keyout certs/server-key.pem -out certs/server-csr.pem \
  -subj "/C=US/ST=California/L=San Francisco/O=ZapCache/OU=Dev/CN=localhost"

# Sign the server CSR
openssl x509 -req -in certs/server-csr.pem \
  -days 365 -CA certs/ca-cert.pem -CAkey certs/ca-key.pem \
  -CAcreateserial -out certs/server-cert.pem

# Clean up CSR file
rm certs/server-csr.pem

#!/bin/sh
# -------------------------------------------------
# Generate provate key and self-signed certificate
# using openssl
# ref: https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs
# -------------------------------------------------
NAME=digital-artisan
ALIAS=$NAME
PRIVATE_KEY=$NAME.key
CERT=$NAME.crt
KEY_CERT=$NAME.keycert
KEYSTORE=$NAME.jks
PASSWORD=passw0rd

rm $NAME.*
openssl req \
       -newkey rsa:2048 \
       -new -nodes \
       -x509 -days 365 \
       -keyout $PRIVATE_KEY \
       -out $CERT \
       -config san.cnf

cat $PRIVATE_KEY $CERT > $KEY_CERT
openssl pkcs12 -export \
     -in   $KEY_CERT   \
     -out  $KEYSTORE   \
     -name $ALIAS      \
     -noiter -nomaciter 
     
echo generated following for $NAME
echo <quote>private key    :<quote> $PRIVATE_KEY
echo <quote>certifcate     :<quote> $CERT
echo <quote>key+certifcate :<quote> $KEY_CERT
echo <quote>keystore       :<quote> $KEYSTORE

keytool -import -trustcacerts \
   -alias $ALIAS-root \
   -keypass passw0rd  \
   -storepass passw0rd \
   -keystore $KEYSTORE \
   -file $CERT         \
   -noprompt -v

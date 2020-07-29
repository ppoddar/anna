#!/bin/sh
# -------------------------------------------------
# Generate private key and self-signed certificate
# using openssl
# ref: https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs
# -------------------------------------------------
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"


NAME=digital-artisan
ALIAS=$NAME
PRIVATE_KEY=$DIR/$NAME.key
CERT=$DIR/$NAME.cert
KEY_CERT=$DIR/$NAME.keycert
KEYSTORE=$DIR/$NAME.jks
PASSWORD=passw0rd

openssl req \
       -newkey rsa:2048 \
       -new -nodes \
       -x509 -days 365 \
       -keyout $PRIVATE_KEY \
       -out $CERT \
       -config $DIR/san.cnf
       

cat $PRIVATE_KEY $CERT > $KEY_CERT
openssl pkcs12 -export \
     -in   $KEY_CERT   \
     -out  $KEYSTORE   \
     -name $ALIAS      \
     -noiter -nomaciter \
     -passout pass:$PASSWORD 
     
# echo generated following for $DOMAIN
# echo "private key    :" $PRIVATE_KEY
# echo "certifcate     :" $CERT
# echo "key+certifcate :" $KEY_CERT
# echo "keystore       :" $KEYSTORE

#openssl x509 -text -noout -in $CERT
#openssl rsa -check -in $PRIVATE_KEY

keytool -import -trustcacerts \
   -v \
   -alias $ALIAS-root \
   -keypass passw0rd  \
   -storepass passw0rd \
   -keystore $KEYSTORE \
   -file $CERT         \
   -noprompt 
# copy keysore to ann-spring resources to be packaged 
# cp $KEYSTORE ../../anna-spring/src/main/resources/
       
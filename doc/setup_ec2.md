# Set up AWS EC2 instance for deployment

## Create Instance

## Get Key pair

chmod 400 anna.pem


## setup DNS

### find out IP

### Point DNS record
Go to Route 53

select hiraafood.com
edit A record to EC2 IP address



## set up docker

connect
yum install docker
add user 
exit
connect
docker ps

## setup Postgres


# Deploy

## Local

cd bin
./deploy.sh

pg_ctl -D /usr/local/var/postgres start

psql -d anna







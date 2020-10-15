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
sudo yum install -y postgresql postgresql-server postgresql-devel postgresql-contrib postgresql-docs

service postgresql initdb
sudo service postgresql start

vi /var/lib/pgsql9/data/pg_hba.conf

# Deploy

## Local

cd bin
./deploy.sh

pg_ctl -D /usr/local/var/postgres start

psql -d anna







FROM php:5.6-apache
ADD OVA3 /var/www/html/
RUN mkdir /var/www/html/tmp
RUN chmod 777 /var/www/html/tmp
RUN a2enmod rewrite
RUN a2enmod headers
COPY php.ini /usr/local/etc/php/
RUN docker-php-ext-install mysql mysqli pdo pdo_mysql
RUN apt-get update && apt-get install -y mysql-client

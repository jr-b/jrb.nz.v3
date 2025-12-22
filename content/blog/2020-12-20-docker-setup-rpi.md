+++
title = "Configurer Docker sur un Raspberry Pi"
date = 2020-12-20
[taxonomies]
tags = ["docker", "raspberry pi"]
+++

Petit guide rapide pour configurer Docker sur un Raspberry Pi.

### Récupère le script d'installation

`curl -fsSL https://get.docker.com -o get-docker.sh`

### Ajoute les droits pour l'utilisateur pi

`sudo usermod -aG docker pi`

### Lance un container de test

`docker run hello-world`

## docker-compose

### Installer les dépendances

`sudo apt-get install -y libffi-dev libssl-dev`
`sudo apt-get install -y python3 python3-pip`
`sudo apt-get remove python-configparser` (optionel)

### Installer docker-compose

`sudo pip3 -v install docker-compose`

Installation de n8n
`docker run -d --restart always --name n8n -p 5678:5678 -v ~/.n8n:/root/.n8n n8nio/n8n:0.78.0-rpi`

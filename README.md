# WordPress-CMS-Detector
A very generic "Is this WordPress?" detector written in node.js and HTML. Tested on node.js 20.6.1 on Ubuntu 22.04 using NGINX.

## To Install:

### Required:
node.js 19+
NPM packages: express, cors, node-fetch, node-html-parser

### Install commands

In your install directory, run ```npm init -y```<br>
Then, run ```npm install express cors node-fetch node-html-parser```<br>
If you're using UFW, run ```sudo ufw allow 3000/tcp```<br>
Once you've set up the project, run it with ```node app.js```<br>


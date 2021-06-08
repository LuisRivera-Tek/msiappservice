const express = require('express');
const app = express();
const port = process.env.PORT;
var database_server= process.env.MSI_DATABASE_SERVER
var database= process.env.MSI_DATABASE
var keyvault_uri=process.env.KEYVAULT_URI
var keyvault_secret_uri= process.env.KEYVAULT_SECRET_URI
const request = require('request');
const sql = require('mssql');
const sqlConfig = {
  database: database,
  server: database_server,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: false, // change to true for local dev / self-signed certs
  },
  authentication:{
    type:"azure-active-directory-msi-app-service"
  }

}


app.get('/', function (req, res) {
  res.send('Welcome to Luis Rivera MSI Demo! To print all the identity headers naviagte to /msi/headers. To print data from my Azure SQL database please go to /msi/AzureSQL')
});

// Print the Identity Headers
app.get('/msi/headers', function (req, res) {
	
var identity_header= process.env.IDENTITY_HEADER;
var identity_endpoint= process.env.IDENTITY_ENDPOINT;
	
	
  res.send({
	  "identity_header":identity_header,
	  "identity_endpoint": identity_endpoint
	  
  })
});

//Connect to AZure SQL using Managed Service Identity
  app.get('/msi/AzureSQL', function (req, res) {

    async function ConnectToSQL ()  {
        try {
            await sql.connect(sqlConfig)
            const result = await sql.query`select * from dbo.Songs`
            console.dir(result)
            res.send(result)
          
        } catch (err) {
            console.log("Cannot connect")
            console.log(err)
            res.send(err)
        }
    }
    
    ConnectToSQL();
  });
   
app.listen(port);

# msiappservice-azuresql

Hello, I hope that you are doing great!

In this exercise, I will be using MSI to connect my app service to an Azure SQL Database.
Feel free to deploy my code to Azure using the button below:

**Note: This will create a Linux app service plan in the B1 tier along with a Node JS App Service. So please make sure to clean up after you are finished**


[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FLuisRivera-Tek%2Fmsiappservice-azuresql%2Fmsi-azuresql%2Ftemplate.json)

**Note: If you're using my app service to test MSI, make sure that you are using npm install && node --max-http-header-size=800000 server.js as your Node JS run command**



Enable managed identity for your app service:

![image](https://user-images.githubusercontent.com/77988455/121377155-5c8ea500-c8ff-11eb-89f4-af2f320ef12d.png)

In our code, we will be referencing the Azure SQL Server and the SQL Database as environment variables. So please make sure to add the follow app settings:

           MSI_DATABASE_SERVER= server.database.windows.net
           MSI_DATABASE= NameOfYourDatabase
           
           
In our code, we create the store the environment variables in variables:

          var database_server= process.env.MSI_DATABASE_SERVER
          var database= process.env.MSI_DATABASE
          
For this example, I am using the npm "mssql" library to connect to Azure SQL. So we should now 'require mssql'. After that, we should establish the configuration options for connecting to Azure SQL, pay additional attention to the authentication type we set in the following code:


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


Now, we connect to our Azure SQL database:


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






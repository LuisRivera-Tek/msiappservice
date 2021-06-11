# msiappservice-azuresql

Hello, I hope that you are doing great!

In this exercise, I will be using MSI to connect my app service to an Azure SQL Database.
Feel free to deploy my code to Azure using the button below:

**Note: This will create a Linux app service plan in the B1 tier along with a Node JS App Service. So please make sure to clean up after you are finished**


[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FLuisRivera-Tek%2Fmsiappservice-azuresql%2Fmsi-azuresql%2Ftemplate.json)





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
    trustServerCertificate: false, 
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




In my case, my app runs the query everytime /msi/AzureSQL is called, so lets test the app:

![image](https://user-images.githubusercontent.com/77988455/121381978-6dd9b080-c903-11eb-9737-060c7dbc5624.png)

Did you see the same error message as me? This is because we still need to grant access to our app so it is able to access the Database.
For that, we need to run a few queries. First lets login to SQL Server Management Studio.

**Note: You have to login as an Azure Active Directory Admin to SSMS. if not, you will get the following error when trying to grant access:**

![image](https://user-images.githubusercontent.com/77988455/121383522-c198c980-c904-11eb-9406-ddacf0358b22.png)


To achieve this, you need to add yourself as an Admin on Your Azure SQL Server DB > Azure Active Directory Admin:

![image](https://user-images.githubusercontent.com/77988455/121383989-1d635280-c905-11eb-9577-f0d1002e3d0c.png)

Now, when logging in to SSMS, you can use the options related to Azure Active Directory to login:

![image](https://user-images.githubusercontent.com/77988455/121384260-54d1ff00-c905-11eb-9f7a-565fef5c3a5c.png)

Now, run the following query on your database:

**Note: replace the identity name with your service principal identity name, in my case (since I used system-assigned managed identity), it is the same name as my app service**

                      CREATE USER [<identity-name>] FROM EXTERNAL PROVIDER;
                      ALTER ROLE db_datareader ADD MEMBER [<identity-name>];
                      ALTER ROLE db_datawriter ADD MEMBER [<identity-name>];
                      ALTER ROLE db_ddladmin ADD MEMBER [<identity-name>];
                      GO
                      

After a few minutes/seconds, you should now be able to test the app by requesting /msi/azuresql:

![image](https://user-images.githubusercontent.com/77988455/121385584-797aa680-c906-11eb-80ab-3aa6c2f8ead3.png)

I hope you had fun with this exercise!








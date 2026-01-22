# WildFly Datasource Configuration (Deployment Mode)

This guide explains how to configure a PostgreSQL datasource in **WildFly using the JDBC driver deployment method**.  
Deployment mode is simple and ideal for development or standalone servers.

---

## Prerequisites

Before starting, ensure you have:

- WildFly installed (example: `/opt/wildfly`)
- PostgreSQL running
- A database and user created:


## 1️⃣ Deploy the JDBC Driver (.jar)

1. Open the WildFly admin console:
2. Log in with your admin credentials.
3. Go to: Deployments → Add → Upload Deployment
4. Select your JDBC driver file, for example: postgresql-42.x.x.jar
5. Click **Next**, then **Finish** to deploy it.
6. Verify the deployment by checking: Configuration → Subsystems → Datasources & Drivers → JDBC Drivers
7. You should now see the driver listed (e.g., `postgresql`).

## 2️⃣ Add a Datasource

1. Navigate to: Configuration → Subsystems → Datasources & Drivers → Datasources
3. Choose your database type (e.g., PostgreSQL).
4. When prompted for a driver, select the one you deployed earlier.
5. Enter your datasource configuration:
Example:
- Name: `MyDS`
- JNDI Name: `java:/jdbc/MyDS`
- Connection URL: `jdbc:postgresql://localhost:5432/mydb`
- Username: `myuser`
- Password: `mypassword`
6. Click **Test Connection** to verify connectivity.
7. Click **Finish** to create the datasource.

---

Your JDBC driver is now deployed and the datasource is configured. WildFly applications can now use it.

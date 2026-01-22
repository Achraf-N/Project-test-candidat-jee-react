# Test Management API - Backend Setup

This guide explains how to configure and deploy the Test Management API backend application on WildFly.

---

## Prerequisites

Before starting, ensure you have:

- WildFly installed (example: `/opt/wildfly`)
- PostgreSQL running
- A database and user created
- Java 17 or higher
- Maven installed

---

## Required Environment Variables

The application requires the following environment variables to be configured:

### 1. Groq API Configuration (for AI-powered open question scoring)

```bash
GROQ_API_KEY=gsk_your_api_key_here
```

**How to get Groq API Key:**
1. Visit https://console.groq.com/keys
2. Sign up or login
3. Create a new API key
4. Copy the key (starts with `gsk_...`)

See [GROQ_SETUP.md](GROQ_SETUP.md) for detailed setup instructions.

### 2. Email Configuration (for sending test invitations)

```bash
MAIL_USER=your-email@gmail.com
MAIL_PWD=your-app-password
```

**Gmail Setup:**
1. Use a Gmail account
2. Enable 2-factor authentication
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Use the generated app password (not your Gmail password)

**Setting Environment Variables:**

**Windows (System Environment - Permanent):**
1. Open Start Menu → Search "Environment Variables"
2. Click "Edit the system environment variables"
3. Click "Environment Variables" button
4. Under "System variables", click "New" for each variable
5. Restart WildFly after setting variables

**Linux/Mac:**
```bash
export GROQ_API_KEY="gsk_your_api_key_here"
export MAIL_USER="your-email@gmail.com"
export MAIL_PWD="your-app-password"
```

Add to `~/.bashrc` or `~/.zshrc` for persistence.

---

## WildFly Datasource Configuration (Deployment Mode)

This section explains how to configure a PostgreSQL datasource in **WildFly using the JDBC driver deployment method**.


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

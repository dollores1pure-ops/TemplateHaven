## Database Setup

Follow these steps to connect the application to your MySQL instance and apply the latest schema.

1. **Create or reuse a database**
   - Ensure the target MySQL server is reachable from the application host.
   - Create an empty database if one does not already exist (e.g. `templatehub`).

2. **Configure environment variables**
   - Create a `.env` file in the project root (same folder as `package.json`).
   - Provide a MySQL connection string in `DATABASE_URL`. The format is:

     ```
     DATABASE_URL=mysql://<username>:<password>@<host>:<port>/<database>
     ```

     Example using the credentials you shared:

     ```
     DATABASE_URL=mysql://root:W7__8_X1j2338Cl617kjHz@84.200.80.12:3306/templatehub
     SESSION_SECRET=replace-with-a-long-random-string
     ```

   - Update the database name (`templatehub`) or session secret as needed.

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Apply the schema with Drizzle**

   The project ships with a MySQL-aware Drizzle configuration. Push the schema to the database:

   ```bash
   npm run db:push
   ```

   > `db:push` uses `drizzle-kit push` under the hood. It will align the remote schema with the source definitions in `shared/schema.ts`.

5. **Start the server**

   ```bash
   npm run dev
   ```

   The Express server will bootstrap, ensure the default admin user exists, and start serving the API/UI.

## Admin account

- A default admin account is created automatically on startup if one does not exist. The username defaults to `admin` and the password to `admin123`.
- Override the defaults by setting `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` before the first run.

## Premium feature management

- Logged-in administrators can manage premium access from the **Admin Dashboard → User Premium Access** section.
- Premium toggles update the `is_premium` flag in the database immediately.

## Troubleshooting

- **`tsc: not found` during `npm run check`** — install dependencies with `npm install` first.
- **`drizzle-kit push` connection errors** — double-check the `DATABASE_URL`, network access to the MySQL host, and that the database exists.

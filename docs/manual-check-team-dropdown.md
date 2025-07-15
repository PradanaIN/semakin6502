# Manual Check: Team Dropdown Filtering

This project exposes a page at `/kegiatan-tambahan` where users can choose a team
and then pick a master kegiatan. The kegiatan options are filtered based on the
selected team using the `teamId` field.

Steps:
1. Install dependencies and run the development server:
   ```bash
   npm install --prefix api
   npm install --prefix web
   npm run dev --prefix web
   ```
2. Open `http://localhost:5173/tambahan` in a browser.
3. Click **Tambah Kegiatan** to open the form.
4. Select a team from the **Tim** dropdown.
5. The **Kegiatan** dropdown now lists only master kegiatan where
   `teamId` matches the chosen team.

This confirms the frontend correctly filters by `teamId`.

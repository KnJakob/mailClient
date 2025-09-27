# mailClient

This project uses Tanstack Start and Shadcn Components.

Run with
```bash
vite dev
```
or use the vscode Task.

Add the environment variables:
>/env/trainer.txt (Trainer seperated by ',')
>
>/env/trainingzeiten.txt (training-times as String)
>
>.env (GMX_USERNAME, GMX_PASSWORD)

To-Do:
- look over the Date attribute in mail.ts: current type String but fetches as Date
  - for sorting purposes maybe leave it as Date and then change it in the data-table.tsx when shown on screen
- look over from attribute, because it wont be shown atm
- add pagination
- add search bar
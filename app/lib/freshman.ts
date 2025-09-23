import * as fs from "node:fs";
import { createServerFn } from "@tanstack/react-start"; // oder @tanstack/react-router/start

const filePath = "./env/neuesMitglied.txt";

async function readFreshmanText() {
  return await fs.promises.readFile(filePath, "utf-8").catch(() => "Fehler bei der Datei");
}

export const getFreshmanText = createServerFn({
  method: "GET",
}).handler(() => {
  return readFreshmanText();
});

export const updateFreshmanText = createServerFn({ method: "POST" })
  .validator((text: string) => text) // validiert die Eingabe
  .handler(async ({ data }) => {
    await fs.promises.writeFile(filePath, data, "utf-8");
  });

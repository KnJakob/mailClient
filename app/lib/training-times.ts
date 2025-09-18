import * as fs from "node:fs";
import { createServerFn } from "@tanstack/react-start"; // oder @tanstack/react-router/start

const filePath = "./env/trainingszeiten.txt";

async function readTrainingTimes() {
  return await fs.promises.readFile(filePath, "utf-8").catch(() => "Fehler bei der Datei");
}

export const getTrainingTimes = createServerFn({
  method: "GET",
}).handler(() => {
  return readTrainingTimes();
});

export const updateTrainingTimes = createServerFn({ method: "POST" })
  .validator((text: string) => text) // validiert die Eingabe
  .handler(async ({ data }) => {
    await fs.promises.writeFile(filePath, data, "utf-8");
  });

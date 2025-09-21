import * as fs from "node:fs";
import { createServerFn } from "@tanstack/react-start";

const filePath = "./env/trainer.txt";

async function readTrainers() {
  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    const trainers = content.split(",").map(trainer => trainer.trim()).filter(Boolean);
    return trainers;
  } catch (error) {
    return [];
  }
}

export const getTrainers = createServerFn({
  method: "GET",
}).handler(() => {
  return readTrainers();
});

export const updateTrainers = createServerFn({ method: "POST" })
  .validator((trainers: string[]) => trainers)
  .handler(async ({ data }) => {
    const content = data.join(", ");
    await fs.promises.writeFile(filePath, content, "utf-8");
  });

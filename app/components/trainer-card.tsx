import { useState } from "react";
import { ClipboardButton } from "./clipboard-button";
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";
import { EditDialog } from "./edit-dialog";
import { updateTrainers } from "@/lib/trainer";

export function TrainerCard({ trainers }: { trainers: string[] }) {
  const [selectedTrainer, setSelectedTrainer] = useState<string>("");
  const trainersAsString = trainers.join(",");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktuelle Trainer</CardTitle>
        <CardAction>
          <ClipboardButton  text={selectedTrainer ? `Viele Grüße,\n${selectedTrainer}` : ""}/>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trainer auswählen..." />
          </SelectTrigger>
          <SelectContent>
            {trainers.map((trainer, index) => (
              <SelectItem key={index} value={trainer}>
                {trainer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTrainer && (
          <p className="mt-2 text-sm text-gray-600">
            Ausgewählt: <strong>{selectedTrainer}</strong>
          </p>
        )}
      </CardContent>
      <CardFooter>
        <EditDialog 
          text={trainersAsString}
          title="Trainer bearbeiten"
          description="Bearbeiten Sie hier die Trainer, getrennt durch Kommata."
          placeholder={trainersAsString}
          label="Trainer"
          onSave={async (text) => await updateTrainers({ data: text.split(',') })}
        />
      </CardFooter>
    </Card>
  );
}
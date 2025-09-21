import { useState } from "react";
import { ClipboardButton } from "./clipboard-button";
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";

export function TrainerCard({ trainers }: { trainers: string[] }) {
  const [selectedTrainer, setSelectedTrainer] = useState<string>("");
  
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
          <Button variant="outline"><Link to="/prank">Bearbeiten</Link></Button>
      </CardFooter>
    </Card>
  );
}
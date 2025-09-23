import { Link } from "@tanstack/react-router";
import { ClipboardButton } from "./clipboard-button";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from "./ui/card";
import { EditDialog } from "./edit-dialog";
import { updateTrainingTimes } from "@/lib/training-times";

export function TrainingCard({content}: {content:string}) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Trainingszeiten</CardTitle>
          <CardAction>
            <ClipboardButton text={`Wir bieten aktuell folgende Trainingszeiten an:\n${content}`}/>
          </CardAction>
        </CardHeader>
        <CardContent>
          {content ?? "Daten nicht geladen"}
        </CardContent>
        <CardFooter>
          <EditDialog 
            text={content}
            title="Trainingszeiten bearbeiten"
            description="Bearbeiten Sie hier die Trainingszeiten."
            placeholder={content}
            label="Trainingszeiten"
            onSave={async (text) => await updateTrainingTimes({ data: text })}
          />
        </CardFooter>
    </Card>
    )
}
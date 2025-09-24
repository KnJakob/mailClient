import { ClipboardButton } from "./clipboard-button";
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from "./ui/card";
import { EditDialog } from "./edit-dialog";
import { updateTrainingTimes } from "@/lib/training-times";

export function TrainingCard({content, collapsed}: {content:string, collapsed: boolean}) {

    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Trainingszeiten</CardTitle>
          <CardAction>
            <ClipboardButton text={`Wir bieten aktuell folgende Trainingszeiten an:\n${content}`}/>
          </CardAction>
        </CardHeader>
        <CardContent>
          {collapsed 
            ? `${content?.slice(0, 26) || ""}...`
            : content ?? "Daten nicht geladen"
          }
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
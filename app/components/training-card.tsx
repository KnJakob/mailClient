import { Link } from "@tanstack/react-router";
import { ClipboardButton } from "./clipboard-button";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from "./ui/card";
import { EditDialog } from "./edit-dialog";

export function TrainingCard({content}: {content:string}) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Trainingszeiten</CardTitle>
          <CardAction>
            <ClipboardButton text={content}/>
          </CardAction>
        </CardHeader>
        <CardContent>
          {content ?? "Daten nicht geladen"}
        </CardContent>
        <CardFooter>
            <EditDialog text={content}/>
        </CardFooter>
    </Card>
    )
}
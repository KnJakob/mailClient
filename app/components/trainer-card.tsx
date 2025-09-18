import { Link } from "@tanstack/react-router";
import { ClipboardButton } from "./clipboard-button";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from "./ui/card";

export function TrainingCard({content}: {content:string}) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trainer</CardTitle>
          <CardAction>
            <ClipboardButton text={content}/>
          </CardAction>
        </CardHeader>
        <CardContent>
          {content ?? "Daten nicht geladen"}
        </CardContent>
        <CardFooter>
            <Button variant="outline"><Link to="/prank">Bearbeiten</Link></Button>
        </CardFooter>
    </Card>
    )
}
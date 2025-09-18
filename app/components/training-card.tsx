import { Link } from "@tanstack/react-router";
import { ClipboardButton } from "./clipboard-button";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from "./ui/card";

export function TrainingCard() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Trainingszeiten</CardTitle>
          <CardAction>
            <ClipboardButton />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>Dienstag: 17:00-18:30 jüngere Gruppe, 18:30-20:00 ältere Gruppe</p>
          <p>Mühlenau Grundschule</p>
          <p>Freitag: 17:00-18:00 jüngere Gruppe, 18:00-19:30 ältere Gruppe</p>
          <p>Wilma Rudolph Oberschule</p>
        </CardContent>
        <CardFooter>
            <Button variant="outline"><Link to="/prank">Bearbeiten</Link></Button>
        </CardFooter>
    </Card>
    )
}
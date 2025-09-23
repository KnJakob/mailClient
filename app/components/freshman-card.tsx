import { ClipboardButton } from "./clipboard-button";
import { Card, CardHeader, CardTitle, CardAction, CardContent, CardFooter } from "./ui/card";
import { EditDialog } from "./edit-dialog";
import { updateFreshmanText } from "@/lib/freshman";

export function FreshmanCard({content, collapsed}: {content:string, collapsed: boolean}) {

    return (
      <Card>
        <CardHeader>
          <CardTitle>Neues Mitglied</CardTitle>
          <CardAction>
            <ClipboardButton text={content}/>
          </CardAction>
        </CardHeader>
        <CardContent>
          {collapsed 
            ? `${content?.slice(0, 18) || ""}...`
            : content ?? "Daten nicht geladen"
          }
        </CardContent>
        <CardFooter>
          <EditDialog 
            text={content}
            title="Neuzugang Text Bearbeiten"
            description="Bearbeiten Sie hier den Text den neue Mitglieder bekommen sollen."
            placeholder={content}
            label="Text"
            onSave={async (text) => await updateFreshmanText({ data: text })}
          />
        </CardFooter>
    </Card>
    )
}
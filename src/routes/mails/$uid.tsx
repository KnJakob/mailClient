import { getFreshmanText } from '@/lib/freshman'
import { getMailBySeq } from '@/lib/mail'
import { getTrainers } from '@/lib/trainer'
import { getTrainingTimes } from '@/lib/training-times'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Mail, User, ChevronDown, ArrowLeft, ArrowBigLeft } from 'lucide-react'
import { MailSidebar } from '@/components/mail-sidebar'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/mails/$uid')({
  component: RouteComponent,
  loader: async({params}) => {
    const uid = parseInt(params.uid, 10)
    if (isNaN(uid)) {
      throw new Error('UID muss eine Zahl sein')
    }
    const [trainingTimes, trainers, freshmanText, email] = await Promise.all([
      getTrainingTimes(),
      getTrainers(),
      getFreshmanText(),
      getMailBySeq({data: uid})
    ])
    return { trainingTimes, trainers, freshmanText, email }
  },
})

function RouteComponent() {
  const { trainingTimes, trainers, freshmanText, email } = Route.useLoaderData()
  const [isToOpen, setIsToOpen] = useState(false)
  
  // Annahme: email.to könnte ein String oder Array sein
  const toRecipients = Array.isArray(email.to) ? email.to : email.to ? [email.to] : []
  
  return (
    <>
    <div className="flex">
      <div className="flex-1 overflow-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link to="/mails" className="flex items-center gap-2">
              <ArrowBigLeft className="h-5 w-5" />
              <span>Zurück zur Übersicht</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-5 w-5" />
            <h1 className="text-2xl font-semibold text-foreground">E-Mail Details</h1>
          </div>
        </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <CardTitle className="text-xl">{email.subject}</CardTitle>
                  <div className="space-y-2">
                    <CardDescription className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Von:</span> {email.from}
                    </CardDescription>
                    
                    {toRecipients.length > 0 && (
                      <Collapsible open={isToOpen} onOpenChange={setIsToOpen}>
                        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium">An:</span>
                          <span>{toRecipients.length > 1 ? `${toRecipients.length} Empfänger` : toRecipients[0]}</span>
                          {toRecipients.length > 1 && (
                            <ChevronDown className={`h-4 w-4 transition-transform ${isToOpen ? 'rotate-180' : ''}`} />
                          )}
                        </CollapsibleTrigger>
                        {toRecipients.length > 1 && (
                          <CollapsibleContent className="mt-2 ml-6 space-y-1">
                            {toRecipients.map((recipient, idx) => (
                              <div key={idx} className="text-sm text-muted-foreground">
                                {recipient}
                              </div>
                            ))}
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  <Mail className="h-3 w-3 mr-1" />
                  ID: {Route.useParams().uid}
                </Badge>
              </div>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line text-foreground leading-relaxed">
                  {email.body}
                </div>
              </div>
            </CardContent>
          </Card>
              </div>
      <div className="">
        <MailSidebar trainingTimes={trainingTimes} trainers={trainers} freshmanText={freshmanText}/>
      </div>
      </div>     
    </>
  )
}
import { FreshmanCard } from "./freshman-card";
import { TrainerCard } from "./trainer-card";
import { TrainingCard } from "./training-card";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "./ui/sidebar";

export function MailSidebar({ trainingTimes, trainers, freshmanText }: {trainingTimes:string, trainers:string[], freshmanText:string}){
    return (
        //@ts-ignore
        <SidebarProvider style={{"--sidebar-width": "26rem",}}>
            <Sidebar side="right" variant="floating" collapsible="offcanvas" >
            <SidebarHeader />
            <SidebarContent className="space-y-2 px-1">
                <p className="text-xl text-center font-semibold">Inhalte</p>
                <TrainingCard content={trainingTimes} collapsed={true} />
                <TrainerCard trainers={trainers} />
                <FreshmanCard content={freshmanText} collapsed={true} />
            </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    )
}
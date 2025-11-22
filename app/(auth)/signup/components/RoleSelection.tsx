import Link from "next/link"; 
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
} from "@/components/ui/card"; 
 
export function RoleSelection() { 
  return ( 
    <Card className="mx-auto max-w-2xl w-full shadow-xl"> 
      <CardHeader className="space-y-1 text-center"> 
        <CardTitle className="text-3xl font-bold">Join Mathwiz</CardTitle> 
        <CardDescription className="text-base"> 
          Choose your role to get started with math competitions 
        </CardDescription> 
      </CardHeader> 
      <CardContent> 
        <div className="grid gap-4 md:grid-cols-2"> 
          <Link 
            href="/signup/register?role=mathelete" 
            className="group relative overflow-hidden rounded-lg border-2 border-slate-200 bg-white p-6 transition-all hover:border-[#25346A] hover:shadow-lg dark:border-slate-700 dark:bg-slate-800" 
          > 
            <div className="flex flex-col items-center text-center space-y-4"> 
              <div className="rounded-full bg-[#25346A] p-4"> 
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2} 
                > 
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  /> 
                </svg> 
              </div> 
              <div> 
                <h3 className="text-xl font-semibold mb-2 group-hover:text-[#25346A]"> 
                  Join as a Mathelete 
                </h3> 
                <p className="text-sm text-muted-foreground"> 
                  Compete in math challenges, solve problems, and climb the leaderboards 
                </p> 
              </div> 
              <div className="text-xs text-muted-foreground mt-2"> 
                Perfect for students and math enthusiasts 
              </div> 
            </div> 
          </Link> 
 
          <Link 
            href="/signup/register?role=organizer" 
            className="group relative overflow-hidden rounded-lg border-2 border-slate-200 bg-white p-6 transition-all hover:border-[#f49700] hover:shadow-lg dark:border-slate-700 dark:bg-slate-800" 
          > 
            <div className="flex flex-col items-center text-center space-y-4"> 
              <div className="rounded-full bg-[#f49700] p-4"> 
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2} 
                > 
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                  /> 
                </svg> 
              </div> 
              <div> 
                <h3 className="text-xl font-semibold mb-2 group-hover:text-[#f49700]"> 
                  Join as an Organizer 
                </h3> 
                <p className="text-sm text-muted-foreground"> 
                  Create contests, manage participants, and host math competitions 
                </p> 
              </div> 
              <div className="text-xs text-muted-foreground mt-2"> 
                Perfect for teachers and competition hosts 
              </div> 
            </div> 
          </Link> 
        </div> 
         
        <div className="mt-6 text-center text-sm text-muted-foreground"> 
          Already have an account?{" "} 
          <Link href="/login" className="text-[#25346A] hover:underline font-medium"> 
            Sign in 
          </Link> 
        </div> 
      </CardContent> 
    </Card> 
  ); 
} 

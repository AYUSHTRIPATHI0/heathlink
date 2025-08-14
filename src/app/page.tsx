import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Github, Linkedin, HeartPulse } from 'lucide-react';

const developers = [
  {
    name: "Ayush Tripathi",
    avatar: "AT",
    avatarUrl: "https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-617.jpg",
    github: "https://github.com/AYUSHTRIPATHI0",
    linkedin: "https://www.linkedin.com/in/ayushtripathi00",
  },
  {
    name: "Anvesha Srivastava",
    avatar: "AS",
    avatarUrl: "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-female-user-profile-vector-illustration-isolated-background-women-profile-sign-business-concept_157943-38866.jpg",
    github: "https://github.com/anve-sha",
    linkedin: "https://www.linkedin.com/in/anvesha-srivastava-41520b350",
  },
  {
    name: "Ananya Singh",
    avatar: "AS",
    avatarUrl: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT5DtLu_hCEcQ4NIQvgxlpHYwO88DcCmqTPjK697zVsjeCRO-QB",
    github: "https://github.com/ananyasingh03439-cmd",
    linkedin: "https://www.linkedin.in/ananya-singh-91121b36b",
  },
  {
    name: "Ananya Mishra",
    avatar: "AM",
    avatarUrl: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQrWw9b9NdN-hBrXBpTVtKqtwuD_lDnzHGJ5fq-iCYlI8JrO97W",
    github: "https://github.com/misananya07",
    linkedin: "https://www.linkedin.in/ananya-mishra-018619360",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
          <HeartPulse className="w-8 h-8 text-primary" />
          <span className="font-headline">HealthSync</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="text-center py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-headline">
              Your Personal AI Health Companion
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              Track your daily stats, get intelligent predictions, and sync your health journey seamlessly.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="developers" className="bg-secondary py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight font-headline">Meet the Developers</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Built with passion by a team of dedicated developers.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {developers.map((dev) => (
                <Card key={dev.name} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={dev.avatarUrl || `https://i.pravatar.cc/150?u=${dev.name}`} alt={dev.name} />
                      <AvatarFallback>{dev.avatar}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline">{dev.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center gap-4">
                    <Link href={dev.github} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon">
                        <Github className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={dev.linkedin} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon">
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} HealthSync. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

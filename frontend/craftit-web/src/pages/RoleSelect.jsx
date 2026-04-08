import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Palette, Briefcase } from 'lucide-react';

export default function RoleSelect() {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    navigate('/register', { state: { role } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 font-sans">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light text-stone-900 mb-3 tracking-tight">Welcome to Craftit</h1>
          <p className="text-stone-500">Be part of Craftit and connect through real, handcrafted portraits. How would you like to continue?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="group cursor-pointer hover:border-orange-200 hover:shadow-orange-100/50 transition-all duration-300"
            onClick={() => handleSelectRole('Artist')}
          >
            <CardHeader className="text-center pb-2 pt-8">
              <div className="mx-auto bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Palette className="w-8 h-8 text-orange-500" />
              </div>
              <CardTitle className="text-xl">I'm an Artist</CardTitle>
            </CardHeader>
            <CardContent className="text-center mb-4">
              <CardDescription className="text-md">
                Showcase your handcrafted portraits, connect with clients, and bring your art to life through real commissions.
              </CardDescription>
              <Button variant="outline" className="mt-6 w-full group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-200">
                Join as Artist
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="group cursor-pointer hover:border-emerald-200 hover:shadow-emerald-100/50 transition-all duration-300"
            onClick={() => handleSelectRole('Client')}
          >
            <CardHeader className="text-center pb-2 pt-8">
              <div className="mx-auto bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-8 h-8 text-emerald-500" />
              </div>
              <CardTitle className="text-xl">I'm a Client</CardTitle>
            </CardHeader>
            <CardContent className="text-center mb-4">
              <CardDescription className="text-md">
                    Discover skilled portrait artists, commission handcrafted artwork, and bring your ideas to life.
              </CardDescription>
              <Button variant="outline" className="mt-6 w-full group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-200">
                Join as Client
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <p className="text-center mt-12 text-sm text-stone-500">
          Already have an account? <Button variant="link" className="p-0 h-auto font-medium text-stone-900 underline hover:text-orange-600" onClick={() => navigate('/login')}>Sign in</Button>
        </p>
      </div>
    </div>
  );
}
